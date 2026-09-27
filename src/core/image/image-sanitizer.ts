import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { countSuspiciousMetadataTags } from '../forensic/marker-parser';
import { generateEphemeralSaltedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles, stripAllMetadataSurgical } from './icc-sanitizer';

export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number; // 0.85 - 0.95
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
        for (let i = 0; i < data.length; i += 4) {
          const qr = data[i] >> 4;
          const qg = data[i + 1] >> 4;
          const qb = data[i + 2] >> 4;
          const key = (qr << 8) | (qg << 4) | qb;
          uniqueColors.add(key);
          if (uniqueColors.size >= 32) {
            return false; // High variance -> Photographic JPEG!
          }
        }

        // Below threshold 32 -> Flat / Non-photographic!
        return uniqueColors.size < 32;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  // Formatos fora de JPEG/PNG: fallback seguro para Lossless sem ruído
  return true;
}

/**
 * Destructive & Reconstructive Image Sanitization Pipeline
 *
 * Implements:
 * 1. Fast-Track Bypass ("Strip Only"): 1:1 bitstream when 0 suspicious tags exist.
 * 2. Intelligent Compression Routing: Lossless WebP without noise for screenshots/flat media;
 *    Lossy 85% with stochastic PRNU noise for photographic JPEGs.
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
  const originalBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(originalBuffer);

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

  // --- ITEM 1: Fast-Track de Bypass ("Strip Only") ---
  const suspiciousCount = countSuspiciousMetadataTags(originalBytes, file.type);
  if (suspiciousCount === 0) {
    onProgress?.(80);
    const cleanBlob = new Blob([originalBytes as any], { type: targetMime });
    const sanitizedName = await generateEphemeralSaltedName(originalBytes, ext);
    const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
    onProgress?.(100);

    return {
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
    };
  }

  // --- Proceed with Full Reconstructive Pipeline ---
  // 2. Pure Bitmap Decimation
  const bitmap = await createImageBitmap(file);
  onProgress?.(45);

  // --- ITEM 2: Roteamento de Compressão Inteligente (Lossy vs Lossless) ---
  const isNonPhoto = isNonPhotographicImage(bitmap, file.type, originalName);
  const skipNoise = isNonPhoto;

  let effectiveMime = targetMime;
  let effectiveQuality = options.quality ?? 0.85;

  if (isNonPhoto) {
    // Não-fotográfica -> WebP Lossless, sem injeção de ruído
    effectiveMime = targetMime === 'image/png' ? 'image/png' : 'image/webp';
    effectiveQuality = 1.0;
  } else {
    // Fotográfica (JPEG real, alta variância) -> Lossy 85% + injeção de ruído estocástico
    effectiveQuality = options.quality ?? 0.85;
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

  // 6. Zero-Copy Post-Processing: Strip browser-injected ICC display profiles and calibration chunks
  const rawBuffer = await rawBlob.arrayBuffer();
  const strippedBytes = stripDisplayColorProfiles(new Uint8Array(rawBuffer), effectiveMime);

  let cleanBlob = new Blob([strippedBytes as any], { type: effectiveMime });
  let finalBytes = strippedBytes;
  let warningBadge: string | undefined;

  // --- ITEM 3: Fallback de Inchaço Pós-Processamento ---
  // Condição: na validação final, Blob limpo > arquivo de entrada
  if (cleanBlob.size > originalSize) {
    warningBadge = 'Tamanho inflado por injeção de entropia';

    // Descartar o resultado do canvas e aplicar remoção cirúrgica dos segments/chunks de metadado
    // diretamente nos bytes originais (sem recompressão via canvas)
    const surgicalBytes = stripAllMetadataSurgical(originalBytes, file.type || effectiveMime);
    finalBytes = surgicalBytes;
    cleanBlob = new Blob([surgicalBytes as any], { type: file.type || effectiveMime });
  }

  onProgress?.(92);

  const finalExt = cleanBlob.type === 'image/webp' ? 'webp' : cleanBlob.type === 'image/png' ? 'png' : 'jpg';
  const sanitizedName = await generateEphemeralSaltedName(finalBytes, finalExt);
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
  onProgress?.(100);

  return {
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
  };
}
