import { DefenseLevel, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { finalizeSanitizedOutput } from '../forensic/finalize-output';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles } from './icc-sanitizer';
import { applyDeepDecontamination, sanitizeAlphaChannel } from './decontamination';
import { applyPoissonGaussianNoise } from './poisson-gaussian';
import { createAbortError, isAbortError, withManagedImageBitmap } from './bitmap-lifecycle';
import { assertSafeImageDimensions, ImageDecompressionGuardError } from './image-header-guard';

export { withManagedImageBitmap } from './bitmap-lifecycle';

export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  signal?: AbortSignal;
}

const MAX_IMAGE_EDGE = 1920;
const WEBP_QUALITY = 0.6;

export async function sanitizeImage(
  file: File | Blob,
  options: ImageSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  const signal = options.signal;
  if (signal?.aborted) throw createAbortError(signal.reason);

  onProgress?.(10);
  const originalName = file instanceof File ? file.name : 'unnamed_image';
  const originalSize = file.size;

  const auditBefore = await analyzeForensics(file, originalName);
  if (signal?.aborted) throw createAbortError(signal.reason);
  onProgress?.(25);

  const isOpaqueSource = file.type === 'image/jpeg' || /\.(jpe?g|bmp)$/i.test(originalName);
  const needsAlpha = !isOpaqueSource;

  const effectiveMime = 'image/webp';
  const isDeepDecontaminated = true;

  const rawBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw createAbortError(signal.reason);

  // Fail-closed pre-decode decompression-bomb guard BEFORE spawning worker or createImageBitmap
  assertSafeImageDimensions(rawBuffer);

  let cleanBytes: Uint8Array | null = null;
  let tilesProcessed = 0;

  try {
    const workerRes = await new Promise<{ buffer: ArrayBuffer; tilesProcessed: number }>((resolve, reject) => {
      if (signal?.aborted) {
        reject(createAbortError(signal.reason));
        return;
      }

      const worker = new Worker(
        new URL('../workers/image.worker.ts', import.meta.url),
        { type: 'module' }
      );

      let settled = false;
      const onAbort = () => {
        if (settled) return;
        settled = true;
        worker.terminate();
        reject(createAbortError(signal?.reason));
      };
      const cleanup = () => {
        signal?.removeEventListener('abort', onAbort);
      };

      signal?.addEventListener('abort', onAbort, { once: true });

      worker.onmessage = (e) => {
        if (e.data.type === 'progress') {
          onProgress?.(e.data.percent);
          return;
        }
        if (settled) return;
        settled = true;
        cleanup();
        if (e.data.error) reject(new Error(e.data.error));
        else resolve({ buffer: e.data.buffer, tilesProcessed: e.data.tilesProcessed });
        worker.terminate();
      };
      worker.onerror = (e) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(e);
        worker.terminate();
      };
      worker.postMessage({
        buffer: rawBuffer,
        mimeType: file.type || 'image/jpeg',
        options: { defenseLevel: options.defenseLevel },
        needsAlpha
      }, [rawBuffer]);
    });
    cleanBytes = new Uint8Array(workerRes.buffer);
    tilesProcessed = workerRes.tilesProcessed;
  } catch (err) {
    // Do not fall back to main thread on explicit abort, decompression-bomb guard, or unsupported WebP encode
    if (
      isAbortError(err) ||
      err instanceof ImageDecompressionGuardError ||
      (err instanceof Error && err.message === 'WEBP_ENCODE_UNSUPPORTED')
    ) {
      throw err;
    }

    console.warn('Worker pipeline failed, falling back to Main Thread single-pass canvas:', err);
    const blob = file;
    const decoded = await withManagedImageBitmap(
      () => createImageBitmap(blob),
      ({ bitmap }) => {
        const srcWidth = bitmap.width;
        const srcHeight = bitmap.height;
        if (srcWidth <= 0 || srcHeight <= 0) {
          throw new Error('INVALID_IMAGE_DIMENSIONS');
        }

        const maxEdge = Math.max(srcWidth, srcHeight);
        const targetWidth =
          maxEdge > MAX_IMAGE_EDGE
            ? Math.max(1, Math.round((srcWidth * MAX_IMAGE_EDGE) / maxEdge))
            : srcWidth;
        const targetHeight =
          maxEdge > MAX_IMAGE_EDGE
            ? Math.max(1, Math.round((srcHeight * MAX_IMAGE_EDGE) / maxEdge))
            : srcHeight;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true });
        if (!ctx) throw new Error('Main thread context instantiation failed');

        if (maxEdge > MAX_IMAGE_EDGE) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        return { width: targetWidth, height: targetHeight, canvas, ctx };
      },
      signal
    );

    if (signal?.aborted) throw createAbortError(signal.reason);
    onProgress?.(35);

    const { width, height, canvas: workCanvas, ctx: workCtx } = decoded;
    tilesProcessed = 1;

    const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
    applyPrnuDefense(workCanvas, workCanvas, prnuLevel, needsAlpha);
    onProgress?.(55);

    applyDeepDecontamination(workCanvas, needsAlpha);
    onProgress?.(70);

    const imgData = workCtx.getImageData(0, 0, width, height);
    applyPoissonGaussianNoise(imgData.data);
    const alphaReport = sanitizeAlphaChannel(imgData.data, needsAlpha);
    workCtx.putImageData(imgData, 0, 0);

    if (signal?.aborted) throw createAbortError(signal.reason);

    let encodeCanvas = workCanvas;
    if (needsAlpha && !alphaReport.hasTransparency) {
      const opaqueCanvas = document.createElement('canvas');
      opaqueCanvas.width = width;
      opaqueCanvas.height = height;
      const opaqueCtx = opaqueCanvas.getContext('2d', { alpha: false });
      if (opaqueCtx) {
        opaqueCtx.drawImage(workCanvas, 0, 0);
        encodeCanvas = opaqueCanvas;
      }
    }

    onProgress?.(80);
    const encodedBlob = await new Promise<Blob>((res, rej) =>
      encodeCanvas.toBlob(b => b && b.type === 'image/webp' ? res(b) : rej(new Error('WEBP_ENCODE_UNSUPPORTED')), 'image/webp', WEBP_QUALITY)
    );
    const rawEncoded = new Uint8Array(await encodedBlob.arrayBuffer());
    onProgress?.(90);
    try {
      cleanBytes = stripDisplayColorProfiles(rawEncoded, effectiveMime);
    } finally {
      rawEncoded.fill(0);
    }
  }

  let finalized;
  try {
    onProgress?.(92);
    finalized = await finalizeSanitizedOutput(cleanBytes, effectiveMime);
  } finally {
    if (cleanBytes) {
      cleanBytes.fill(0);
    }
  }

  if (finalized.sha256 === auditBefore.sha256) {
    throw new Error('Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input');
  }

  onProgress?.(100);
  return {
    blob: finalized.blob,
    originalName,
    sanitizedName: finalized.sanitizedName,
    originalSize,
    sanitizedSize: finalized.sanitizedSize,
    format: finalized.format,
    sha256: finalized.sha256,
    defenseLevel: options.defenseLevel,
    auditBefore,
    auditAfter: finalized.auditAfter,
    processedAt: Date.now(),
    isDeepDecontaminated,
    tilesProcessed
  };
}
