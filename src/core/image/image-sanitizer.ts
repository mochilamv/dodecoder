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
 * Detects whether an image is non-photographic (screenshot, meme, text, vector)
 * using the strict priority order:
 * (a) Declared MIME or extension == PNG
 * (b) Filename matches /screenshot/i
 * (c) If neither and format is JPEG, color variance analysis on a 48x48 downscale (unique quantized colors < 32)
 * Formats outside JPEG/PNG: safe fallback to true (Lossless without noise).
 */
export function isNonPhotographicImage(
  bitmap: ImageBitmap,
  mimeType: string,
  fileName: string
): boolean {
  // (a) MIME / extension == PNG
  if (mimeType === 'image/png' || /\.png$/i.test(fileName)) {
    return true;
  }

  // (b) Filename matches /screenshot/i
  if (/screenshot/i.test(fileName)) {
    return true;
  }

  // (c) If JPEG, run color variance analysis on 48x48 downscale
  const isJpeg = mimeType === 'image/jpeg' || /\.(jpe?g)$/i.test(fileName);
  if (isJpeg) {
    try {
      let canvas: HTMLCanvasElement | OffscreenCanvas;
      if (typeof OffscreenCanvas !== 'undefined') {
        canvas = new OffscreenCanvas(48, 48);
      } else {
        canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D
        | null;

      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, 48, 48);
        const imgData = ctx.getImageData(0, 0, 48, 48);
        const data = imgData.data;

        // Quantize colors to 4 bits per channel (4096 possible color bins)
        const uniqueColors = new Set<number>();
        let isPhoto = false;
        for (let i = 0; i < data.length; i += 4) {
          const qr = data[i] >> 4;
          const qg = data[i + 1] >> 4;
          const qb = data[i + 2] >> 4;
          const key = (qr << 8) | (qg << 4) | qb;
          uniqueColors.add(key);
          if (uniqueColors.size >= 32) {
            isPhoto = true;
            break;
          }
        }

        // Active context cleanup
        ctx.clearRect(0, 0, 48, 48);
        return !isPhoto;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  // Formats outside JPEG/PNG: safe fallback to Lossless without noise
  return true;
}

/**
 * Mandatory One-Way Reconstructive Image Sanitization Pipeline
 *
 * Directives:
 * 1. Fast-Track 1:1 bypass is completely disabled for all image formats (JPEG, PNG, WebP, BMP, TIFF).
 *    100% of image payloads route exclusively through canvas / OffscreenCanvas decoding.
 * 2. Mandatory Stochastic Affine Perturbation on canvas context to neutralize PRNU and factory DQT matrices.
 * 3. Heuristic re-encoding strictly using VP8 (Lossy 0.60 for photos / extreme) or VP8L (Lossless 1.0 for UI / text).
 * 4. Output SHA-256 strictly diverges from input SHA-256 for all processed images.
 * 5. In-place structural manipulation is strictly isolated to video and audio formats.
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

  // 3. Heuristic Compression Routing (VP8 vs VP8L) & Anti-Steganography
  const isNonPhoto = isNonPhotographicImage(bitmap, file.type, originalName);
  let isDeepDecontaminated = false;

  // Mandatory target format: WebP container using VP8 or VP8L codec
  const effectiveMime = 'image/webp';
  let effectiveQuality = 0.60;
  let skipNoise = isNonPhoto;

  if (options.extremeSanitization && isNonPhoto) {
    // Extreme Sanitization overrides format routing:
    // Forces Lossy VP8 quantization strictly at 0.60 to destroy leftover carrier signals
    effectiveQuality = 0.60;
    skipNoise = false;
    isDeepDecontaminated = true;
  } else if (isNonPhoto) {
    // Non-photographic -> Pure VP8L (Lossless, 1.0), preserves sharp glyph transitions without noise
    effectiveQuality = 1.0;
  } else {
    // Photographic (real photo, high variance) -> Pure VP8 (Lossy, 0.60) + stochastic noise injection
    effectiveQuality = 0.60;
  }

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

  // 5. Execute Stochastic Affine Perturbation to neutralize PRNU and factory DQT matrices
  const prnuLevel: DefenseLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
  applyPrnuDefense(bitmap, canvas, prnuLevel, needsAlpha, skipNoise);

  // 6. Anti-Steganography Deep Decontamination or Forced YUV 4:2:0 Chroma Subsampling
  if (isDeepDecontaminated) {
    applyDeepDecontamination(canvas, needsAlpha);
  } else if (!isNonPhoto) {
    // Force Chroma Subsampling strictly to YUV 4:2:0 on photographic VP8 payloads
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

  // 7. Re-encode via canvas strictly to VP8 or VP8L WebP container
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
  let warningBadge: string | undefined;
  if (cleanBlob.size > originalSize) {
    warningBadge = 'Size inflated by entropy injection';
  }

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
    warningBadge,
    isDeepDecontaminated,
    extremeSanitization: options.extremeSanitization,
  };

  // Aggressive memory cleanup: reassign heavy memory references strictly to null
  cleanBytes = null;

  return result;
}
