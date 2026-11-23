import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { finalizeSanitizedOutput } from '../forensic/finalize-output';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles } from './icc-sanitizer';
import { applyDeepDecontamination, sanitizeAlphaChannel } from './decontamination';
import { applyPoissonGaussianNoise } from './poisson-gaussian';
import { createAbortError, isAbortError, withManagedImageBitmap } from './bitmap-lifecycle';

export { withManagedImageBitmap } from './bitmap-lifecycle';

export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number;
  signal?: AbortSignal;
}

const TILE_SIZE = 2048;
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
    // Do not fall back to main thread on explicit abort or unsupported WebP encode
    if (isAbortError(err) || (err instanceof Error && err.message === 'WEBP_ENCODE_UNSUPPORTED')) {
      throw err;
    }

    console.warn('Worker pipeline failed, falling back to Main Thread row-batched chunks:', err);
    const blob = file;
    const initialDims = await withManagedImageBitmap(
      () => createImageBitmap(blob),
      ({ bitmap }) => ({ width: bitmap.width, height: bitmap.height }),
      signal
    );
    let width = initialDims.width;
    let height = initialDims.height;
    if (width <= 0 || height <= 0) {
      throw new Error('INVALID_IMAGE_DIMENSIONS');
    }

    const maxEdge = Math.max(width, height);
    let workingBlob: File | Blob = blob;

    if (maxEdge > 1920) {
      const scale = 1920 / maxEdge;
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const dsCanvas = document.createElement('canvas');
      dsCanvas.width = width;
      dsCanvas.height = height;
      const dsCtx = dsCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true });
      if (!dsCtx) throw new Error('Main thread downscale context instantiation failed');

      await withManagedImageBitmap(
        () => createImageBitmap(blob),
        ({ bitmap }) => {
          dsCtx.drawImage(bitmap, 0, 0, width, height);
        },
        signal
      );
      workingBlob = await new Promise<Blob>((res, rej) =>
        dsCanvas.toBlob(b => b ? res(b) : rej(new Error('Downscale failed')), 'image/png')
      );
    }

    if (signal?.aborted) throw createAbortError(signal.reason);

    const cols = Math.ceil(width / TILE_SIZE);
    const rows = Math.ceil(height / TILE_SIZE);
    tilesProcessed = cols * rows;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = width;
    outCanvas.height = height;
    const outCtx = outCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true });
    if (!outCtx) throw new Error('Main thread context instantiation failed');

    let currentTile = 0;
    let anyTileHasTransparency = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (signal?.aborted) throw createAbortError(signal.reason);

        const sx = c * TILE_SIZE;
        const sy = r * TILE_SIZE;
        const sw = Math.min(TILE_SIZE, width - sx);
        const sh = Math.min(TILE_SIZE, height - sy);

        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = sw;
        tileCanvas.height = sh;
        const tileCtx = tileCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true });
        if (!tileCtx) throw new Error('Main thread tile context instantiation failed');

        const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;

        await withManagedImageBitmap(
          () => createImageBitmap(workingBlob, sx, sy, sw, sh),
          ({ bitmap }) => {
            applyPrnuDefense(bitmap as any, tileCanvas, prnuLevel, needsAlpha, false);
          },
          signal
        );

        applyDeepDecontamination(tileCanvas, needsAlpha);

        const imgData = tileCtx.getImageData(0, 0, sw, sh);
        applyPoissonGaussianNoise(imgData.data);
        const alphaReport = sanitizeAlphaChannel(imgData.data, needsAlpha);
        if (alphaReport.hasTransparency) anyTileHasTransparency = true;
        tileCtx.putImageData(imgData, 0, 0);

        outCtx.drawImage(tileCanvas, sx, sy);

        currentTile++;
        onProgress?.(25 + (currentTile / tilesProcessed) * 50);
        await new Promise(r => setTimeout(r, 0));
      }
    }

    if (signal?.aborted) throw createAbortError(signal.reason);

    let encodeCanvas = outCanvas;
    if (needsAlpha && !anyTileHasTransparency) {
      const opaqueCanvas = document.createElement('canvas');
      opaqueCanvas.width = width;
      opaqueCanvas.height = height;
      const opaqueCtx = opaqueCanvas.getContext('2d', { alpha: false });
      if (opaqueCtx) {
        opaqueCtx.drawImage(outCanvas, 0, 0);
        encodeCanvas = opaqueCanvas;
      }
    }

    onProgress?.(80);
    const encodedBlob = await new Promise<Blob>((res, rej) =>
      encodeCanvas.toBlob(b => b && b.type === 'image/webp' ? res(b) : rej(new Error('WEBP_ENCODE_UNSUPPORTED')), 'image/webp', WEBP_QUALITY)
    );
    const rawEncoded = new Uint8Array(await encodedBlob.arrayBuffer());
    onProgress?.(90);
    cleanBytes = stripDisplayColorProfiles(rawEncoded, effectiveMime);
  }

  onProgress?.(92);
  const finalized = await finalizeSanitizedOutput(cleanBytes, effectiveMime);

  if (finalized.sha256 === auditBefore.sha256) {
    throw new Error('Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input');
  }

  onProgress?.(100);
  return {
    blob: finalized.blob,
    originalBlob: file,
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
    tilesProcessed,
    wasmEncoded: false
  };
}
