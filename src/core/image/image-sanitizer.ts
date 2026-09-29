import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { countSuspiciousMetadataTags } from '../forensic/marker-parser';
import { generateSanitizedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles, stripAllMetadataSurgical } from './icc-sanitizer';
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
 * Destructive & Reconstructive Image Sanitization Pipeline
 *
 * Implements:
 * 1. Fast-Track Bypass ("Strip Only"): 1:1 bitstream when 0 suspicious tags exist.
 * 2. Intelligent Compression Routing: Lossless WebP without noise for screenshots/flat media;
 *    Hardcoded 0.60 Lossy VP8 with YUV 4:2:0 Chroma Subsampling and PRNU disruption for photos.
 * 3. Bloat Fallback: if canvas output > input file, discards canvas and surgically
 *    excises metadata directly on original bitstream.
 */
export async function sanitizeImage(
  file: File | Blob,
  options: ImageSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  onProgress?.(10);

  const originalName = file instanceof File ? file.name : 'unnamed_image';
  const originalSize = file.size;
  let originalBuffer: ArrayBuffer | null = await file.arrayBuffer();
  let originalBytes: Uint8Array | null = new Uint8Array(originalBuffer);

  // 1. Initial Forensic Audit (Before)
  const auditBefore = await analyzeForensics(file, originalName);
  onProgress?.(25);

  let targetMime: string = options.outputFormat;
  if (targetMime === 'original') {
    targetMime = file.type || 'image/jpeg';
  }
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(targetMime)) {
    targetMime = 'image/webp';
  }
  const ext = targetMime === 'image/webp' ? 'webp' : targetMime === 'image/png' ? 'png' : 'jpg';

  // --- ITEM 1: Fast-Track Bypass ("Strip Only") ---
  const suspiciousCount = countSuspiciousMetadataTags(originalBytes, file.type);
  const shouldBypass = suspiciousCount === 0 && !options.extremeSanitization;
  if (shouldBypass) {
    onProgress?.(80);
    const cleanBlob = new Blob([originalBytes as any], { type: targetMime });
    const sanitizedName = await generateSanitizedName(originalBytes, ext);
    const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
    onProgress?.(100);

    const bypassResult: SanitizedResult = {
      blob: cleanBlob,
      originalBlob: file,
      originalName,
      sanitizedName,
      originalSize,
      sanitizedSize: cleanBlob.size,
      format: targetMime,
      sha256: auditAfter.sha256,
      defenseLevel: options.defenseLevel,
      auditBefore,
      auditAfter,
      processedAt: Date.now(),
      isBypass: true,
      extremeSanitization: options.extremeSanitization,
    };

    originalBuffer = null;
    originalBytes = null;
    return bypassResult;
  }

  // --- Proceed with Full Reconstructive Pipeline ---
  // 2. Pure Bitmap Decimation
  const bitmap = await createImageBitmap(file);
  onProgress?.(45);

  // --- ITEM 2: Intelligent Compression Routing (Lossy vs Lossless) & Decontamination ---
  const isNonPhoto = isNonPhotographicImage(bitmap, file.type, originalName);
  let isDeepDecontaminated = false;

  let effectiveMime = targetMime;
  // Hardcode encoder quality strictly to 0.60 to neutralize low-amplitude steganography and sensor PRNU
  let effectiveQuality = 0.60;
  let skipNoise = isNonPhoto;

  if (options.extremeSanitization && isNonPhoto) {
    // Extreme Sanitization overrides format routing:
    // Forces Lossy VP8 quantization strictly at 0.60 to destroy leftover carrier signals
    effectiveMime = 'image/webp';
    effectiveQuality = 0.60;
    skipNoise = false;
    isDeepDecontaminated = true;
  } else if (isNonPhoto) {
    // Non-photographic -> WebP Lossless, no noise injection
    effectiveMime = targetMime === 'image/png' ? 'image/png' : 'image/webp';
    effectiveQuality = 1.0;
  } else {
    // Photographic (real JPEG, high variance) -> Hardcoded Lossy 0.60 + stochastic noise injection
    effectiveQuality = 0.60;
  }

  const isOpaqueSource = file.type === 'image/jpeg' || /\.(jpe?g|bmp)$/i.test(originalName);
  const needsAlpha = !isOpaqueSource && effectiveMime !== 'image/jpeg';

  // 3. Setup Offscreen Canvas or Fallback Canvas
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
  }
  canvas.getContext('2d', { willReadFrequently: true, alpha: needsAlpha });

  // 4. Apply Anti-PRNU & Geometric Re-alignment
  applyPrnuDefense(bitmap, canvas, options.defenseLevel, needsAlpha, skipNoise);

  // 4b. Apply Anti-Steganography Deep Decontamination or Forced YUV 4:2:0 Chroma Subsampling
  if (isDeepDecontaminated) {
    applyDeepDecontamination(canvas, needsAlpha);
  } else if (effectiveMime === 'image/webp' || effectiveMime === 'image/jpeg') {
    // Force Chroma Subsampling strictly to YUV 4:2:0 to destroy color-channel anchored payloads
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

  // 5. Re-encode via canvas
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

  // 6. Zero-Copy Post-Processing: Strip browser-injected ICC display profiles and calibration chunks
  const rawBuffer = await rawBlob.arrayBuffer();
  const strippedBytes = stripDisplayColorProfiles(new Uint8Array(rawBuffer), effectiveMime);

  let cleanBlob = new Blob([strippedBytes as any], { type: effectiveMime });
  let finalBytes: Uint8Array | null = strippedBytes;
  let warningBadge: string | undefined;

  // --- ITEM 3: Post-Processing Bloat Fallback ---
  // Condition: in final validation, clean Blob > input file.
  // Note: if deep decontamination was applied, do not revert to original un-decontaminated bytes.
  if (!isDeepDecontaminated && cleanBlob.size > originalSize) {
    warningBadge = 'Size inflated by entropy injection';

    // Discard canvas result and apply surgical removal of metadata segments/chunks
    // directly on original bytes (without canvas recompression)
    const surgicalBytes = stripAllMetadataSurgical(originalBytes!, file.type || effectiveMime);
    finalBytes = surgicalBytes;
    cleanBlob = new Blob([surgicalBytes as any], { type: file.type || effectiveMime });
  }

  onProgress?.(92);

  const finalExt = cleanBlob.type === 'image/webp' ? 'webp' : cleanBlob.type === 'image/png' ? 'png' : 'jpg';
  const sanitizedName = await generateSanitizedName(finalBytes!, finalExt);
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
  onProgress?.(100);

  const result: SanitizedResult = {
    blob: cleanBlob,
    originalBlob: file,
    originalName,
    sanitizedName,
    originalSize,
    sanitizedSize: cleanBlob.size,
    format: cleanBlob.type,
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
  originalBuffer = null;
  originalBytes = null;
  finalBytes = null;

  return result;
}
