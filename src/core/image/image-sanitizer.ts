import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateEphemeralSaltedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles } from './icc-sanitizer';

export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number; // 0.85 - 0.95
}

/**
 * Destructive & Reconstructive Image Sanitization Pipeline
 *
 * Decimates the original media container, strips all metadata, applies
 * PRNU sensor pattern defense, and re-encodes pure pixel data into a clean container.
 */
export async function sanitizeImage(
  file: File | Blob,
  options: ImageSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  onProgress?.(10);

  // 1. Initial Forensic Audit (Before)
  const originalName = file instanceof File ? file.name : 'unnamed_image';
  const auditBefore = await analyzeForensics(file, originalName);
  onProgress?.(30);

  // 2. Pure Bitmap Decimation
  // createImageBitmap extracts ONLY uncompressed RGBA pixel data,
  // completely dropping EXIF, IFD1 thumbnails, MakerNotes, and XMP.
  const bitmap = await createImageBitmap(file);
  onProgress?.(50);

  // 3. Determine Target MIME type and alpha requirement
  let targetMime: string = options.outputFormat;
  if (targetMime === 'original') {
    targetMime = file.type || 'image/jpeg';
  }
  // Enforce supported clean web formats
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(targetMime)) {
    targetMime = 'image/webp';
  }

  // Detect if source or target requires alpha channel (omit alpha for JPEG/opaque to avoid VP8X/ALPH chunks)
  const isOpaqueSource = file.type === 'image/jpeg' || /\.(jpe?g|bmp)$/i.test(originalName);
  const needsAlpha = !isOpaqueSource && targetMime !== 'image/jpeg';

  const quality = options.quality ?? 0.92;
  const ext = targetMime === 'image/webp' ? 'webp' : targetMime === 'image/png' ? 'png' : 'jpg';

  // 4. Setup Offscreen Canvas or Fallback Canvas with explicit alpha channel setting
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
  }
  // Initialize context with alpha flag to suppress unwanted VP8X and ALPH chunks
  canvas.getContext('2d', { willReadFrequently: true, alpha: needsAlpha });

  // 5. Apply Anti-PRNU & Geometric Re-alignment
  applyPrnuDefense(bitmap, canvas, options.defenseLevel, needsAlpha);
  onProgress?.(70);

  // 6. Re-encode to blob via canvas
  let rawBlob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    rawBlob = await canvas.convertToBlob({ type: targetMime, quality });
  } else {
    rawBlob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        b => {
          if (b) resolve(b);
          else reject(new Error('Failed to encode canvas blob'));
        },
        targetMime,
        quality
      );
    });
  }
  onProgress?.(80);

  // 7. Cleanup raw bitmap from memory
  bitmap.close();

  // 8. Zero-Copy Post-Processing: Strip browser-injected ICC display profiles and calibration chunks
  const rawBuffer = await rawBlob.arrayBuffer();
  const strippedBytes = stripDisplayColorProfiles(new Uint8Array(rawBuffer), targetMime);
  const cleanBlob = new Blob([strippedBytes as any], { type: targetMime });
  onProgress?.(88);

  // 9. Generate Anti-Forensic Hashed Filename (with CSPRNG Ephemeral Salting)
  const sanitizedName = await generateEphemeralSaltedName(strippedBytes, ext);

  // 10. Post-Sanitization Forensic Audit (After)
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
  onProgress?.(100);

  return {
    blob: cleanBlob,
    originalBlob: file,
    originalName,
    sanitizedName,
    originalSize: file.size,
    sanitizedSize: cleanBlob.size,
    format: targetMime,
    sha256: auditAfter.sha256,
    defenseLevel: options.defenseLevel,
    auditBefore,
    auditAfter,
    processedAt: Date.now(),
  };
}
