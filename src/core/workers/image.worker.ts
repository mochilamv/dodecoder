import { applyPrnuDefense } from '../image/prnu-defense';
import { applyDeepDecontamination, sanitizeAlphaChannel } from '../image/decontamination';
import { stripDisplayColorProfiles } from '../image/icc-sanitizer';
import { applyPoissonGaussianNoise } from '../image/poisson-gaussian';
import { createAbortError, withManagedImageBitmap } from '../image/bitmap-lifecycle';
import type { DefenseLevel } from '../types';

const TILE_SIZE = 2048;
const WEBP_QUALITY = 0.6;

export interface ImageWorkerJobInput {
  buffer: ArrayBuffer;
  mimeType: string;
  options: { defenseLevel: DefenseLevel };
  needsAlpha: boolean;
}

export interface ImageWorkerJobResult {
  buffer: ArrayBuffer;
  tilesProcessed: number;
  wasmEncoded: boolean;
}

export async function processImageWorkerJob(
  input: ImageWorkerJobInput,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<ImageWorkerJobResult> {
  const { buffer, mimeType, options, needsAlpha } = input;
  if (signal?.aborted) throw createAbortError(signal.reason);

  const blob = new Blob([buffer], { type: mimeType });

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
  let workingBlob: Blob = blob;

  if (maxEdge > 1920) {
    const scale = 1920 / maxEdge;
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const dsCanvas = new OffscreenCanvas(width, height);
    const dsCtx = dsCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | null;
    if (!dsCtx) throw new Error('WORKER_DOWNSCALE_CONTEXT_FAILED');

    await withManagedImageBitmap(
      () => createImageBitmap(blob),
      ({ bitmap }) => {
        dsCtx.drawImage(bitmap, 0, 0, width, height);
      },
      signal
    );
    workingBlob = await dsCanvas.convertToBlob({ type: 'image/png' });
  }

  if (signal?.aborted) throw createAbortError(signal.reason);

  const cols = Math.ceil(width / TILE_SIZE);
  const rows = Math.ceil(height / TILE_SIZE);
  const totalTiles = cols * rows;

  const outCanvas = new OffscreenCanvas(width, height);
  const outCtx = outCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | null;
  if (!outCtx) throw new Error('WORKER_CONTEXT_FAILED');

  let currentTile = 0;
  let anyTileHasTransparency = false;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (signal?.aborted) throw createAbortError(signal.reason);

      const sx = c * TILE_SIZE;
      const sy = r * TILE_SIZE;
      const sw = Math.min(TILE_SIZE, width - sx);
      const sh = Math.min(TILE_SIZE, height - sy);

      const tileCanvas = new OffscreenCanvas(sw, sh);
      const tileCtx = tileCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | null;
      if (!tileCtx) throw new Error('WORKER_TILE_CONTEXT_FAILED');

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
      onProgress?.(Math.round(25 + (currentTile / totalTiles) * 50));
    }
  }

  if (signal?.aborted) throw createAbortError(signal.reason);

  // Drop alpha channel entirely at encode time when source was visually opaque
  let encodeCanvas = outCanvas;
  if (needsAlpha && !anyTileHasTransparency) {
    const opaqueCanvas = new OffscreenCanvas(width, height);
    const opaqueCtx = opaqueCanvas.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D | null;
    if (opaqueCtx) {
      opaqueCtx.drawImage(outCanvas, 0, 0);
      encodeCanvas = opaqueCanvas;
    }
  }

  onProgress?.(80);
  const encodedBlob = await encodeCanvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY });
  if (encodedBlob.type !== 'image/webp') throw new Error('WEBP_ENCODE_UNSUPPORTED');
  const rawEncoded = new Uint8Array(await encodedBlob.arrayBuffer());
  onProgress?.(90);
  const cleanBytes = stripDisplayColorProfiles(rawEncoded, 'image/webp');

  const resultBytes = new Uint8Array(cleanBytes.byteLength);
  resultBytes.set(cleanBytes);
  const resultBuffer: ArrayBuffer = resultBytes.buffer;

  return { buffer: resultBuffer, tilesProcessed: totalTiles, wasmEncoded: false };
}

if (typeof self !== 'undefined') {
  self.onmessage = async (event: MessageEvent) => {
    try {
      const result = await processImageWorkerJob(event.data, (percent) => {
        (self as any).postMessage({ type: 'progress', percent });
      });
      (self as any).postMessage(result, [result.buffer]);
    } catch (err: any) {
      (self as any).postMessage({ error: err?.message || 'Worker processing failed' });
    }
  };
}
