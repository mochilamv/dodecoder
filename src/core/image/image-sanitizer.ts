import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateHashedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';

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

  // 3. Setup Offscreen Canvas or Fallback Canvas
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
  }

  // 4. Apply Anti-PRNU & Geometric Re-alignment
  applyPrnuDefense(bitmap, canvas, options.defenseLevel);
  onProgress?.(70);

  // 5. Determine Target MIME type and extension
  let targetMime: string = options.outputFormat;
  if (targetMime === 'original') {
    targetMime = file.type || 'image/jpeg';
  }
  // Enforce supported clean web formats
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(targetMime)) {
    targetMime = 'image/webp';
  }

  const quality = options.quality ?? 0.92;
  const ext = targetMime === 'image/webp' ? 'webp' : targetMime === 'image/png' ? 'png' : 'jpg';

  // 6. Re-encode to clean blob
  let cleanBlob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    cleanBlob = await canvas.convertToBlob({ type: targetMime, quality });
  } else {
    cleanBlob = await new Promise<Blob>((resolve, reject) => {
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
  onProgress?.(85);

  // 7. Cleanup raw bitmap from memory
  bitmap.close();

  // 8. Generate Anti-Forensic Hashed Filename (16 hex chars from SHA-256)
  const cleanBuffer = await cleanBlob.arrayBuffer();
  const sanitizedName = await generateHashedName(cleanBuffer, ext);

  // 9. Post-Sanitization Forensic Audit (After)
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
  onProgress?.(100);

  return {
    blob: cleanBlob,
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
