import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateSanitizedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles } from './icc-sanitizer';
import { applyDeepDecontamination, applyYuv420ChromaSubsampling } from './decontamination';

export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number; // Maintained for interface compatibility, strictly 0.60 for lossy
  extremeSanitization?: boolean;
}

/**
 * Mandatory Unified Lossy Reconstructive Image Sanitization Pipeline
 *
 * Directives:
 * 1. 100% of decoded image payloads route exclusively through lossy VP8 encoder.
 * 2. Complete removal of lossless VP8L execution paths and screenshot / variance heuristics.
 * 3. Output MIME type is strictly image/webp.
 * 4. Encoder quality is hardcoded strictly to 0.60.
 * 5. Unconditional stochastic affine perturbation on all processed canvas contexts.
 * 6. Unconditional random noise dithering on all processed canvas contexts.
 * 7. Unconditional YUV 4:2:0 Chroma Subsampling on all processed canvas contexts.
 * 8. Complete removal of bloat fallback and file size inflation UI warnings.
 * 9. Visual text ringing and UI artifacting are explicit and accepted outcomes of the quantization matrix.
 */
export async function sanitizeImage(
  file: File | Blob,
  options: ImageSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  onProgress?.(10);

  const originalName = file instanceof File ? file.name : 'unnamed_image';
  const originalSize = file.size;

  // 1. Initial Forensic Audit (Before)
  const auditBefore = await analyzeForensics(file, originalName);
  onProgress?.(25);

  // 2. Pure Bitmap Decimation via Canvas (Mandatory 100% canvas routing)
  const bitmap = await createImageBitmap(file);
  onProgress?.(45);

  // 3. Unified Lossy Encoding Parameters (VP8, locked 0.60 quality)
  const effectiveMime = 'image/webp';
  const effectiveQuality = 0.60;
  const isDeepDecontaminated = !!options.extremeSanitization;

  const isOpaqueSource = file.type === 'image/jpeg' || /\.(jpe?g|bmp)$/i.test(originalName);
  const needsAlpha = !isOpaqueSource;

  // 4. Setup Offscreen Canvas or Fallback Canvas
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
  }
  canvas.getContext('2d', { willReadFrequently: true, alpha: needsAlpha });

  // 5. Execute Stochastic Affine Perturbation & Random Noise Dithering UNCONDITIONALLY
  // skipNoise is strictly false: noise dithering is enforced on all canvas contexts
  const prnuLevel: DefenseLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
  applyPrnuDefense(bitmap, canvas, prnuLevel, needsAlpha, false);

  // 6. Anti-Steganography Deep Decontamination or Unconditional YUV 4:2:0 Chroma Subsampling
  if (isDeepDecontaminated) {
    applyDeepDecontamination(canvas, needsAlpha);
  } else {
    // Unconditional YUV 4:2:0 Chroma Subsampling across all processed images
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyYuv420ChromaSubsampling(imgData.data, canvas.width, canvas.height);
      ctx.putImageData(imgData, 0, 0);
    }
  }
  onProgress?.(70);

  // 7. Re-encode via canvas strictly to Lossy VP8 WebP container
  let rawBlob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    rawBlob = await canvas.convertToBlob({ type: effectiveMime, quality: effectiveQuality });
  } else {
    rawBlob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        b => {
          if (b) resolve(b);
          else reject(new Error('Failed to encode canvas blob'));
        },
        effectiveMime,
        effectiveQuality
      );
    });
  }
  onProgress?.(85);
  bitmap.close();

  // Active Canvas Memory Cleanup: clearRect on all utilized canvas contexts
  const canvasCtx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);

  // 8. Zero-Copy Post-Processing: Strip browser-injected ICC display profiles and normalize WebP container
  const rawBuffer = await rawBlob.arrayBuffer();
  let cleanBytes: Uint8Array | null = stripDisplayColorProfiles(new Uint8Array(rawBuffer), effectiveMime);

  const cleanBlob = new Blob([cleanBytes as any], { type: effectiveMime });

  onProgress?.(92);

  const sanitizedName = await generateSanitizedName(cleanBytes, 'webp');
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);

  // Invariant verification: output SHA-256 must strictly diverge from input SHA-256
  if (auditAfter.sha256 === auditBefore.sha256) {
    throw new Error('Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input');
  }

  onProgress?.(100);

  const result: SanitizedResult = {
    blob: cleanBlob,
    originalBlob: file,
    originalName,
    sanitizedName,
    originalSize,
    sanitizedSize: cleanBlob.size,
    format: effectiveMime,
    sha256: auditAfter.sha256,
    defenseLevel: options.defenseLevel,
    auditBefore,
    auditAfter,
    processedAt: Date.now(),
    isDeepDecontaminated,
    extremeSanitization: options.extremeSanitization,
  };

  // Aggressive memory cleanup: reassign heavy memory references strictly to null
  cleanBytes = null;

  return result;
}
