import { applyPrnuDefense } from '../image/prnu-defense';
import { applyDeepDecontamination, sanitizeAlphaChannel } from '../image/decontamination';
import { stripDisplayColorProfiles } from '../image/icc-sanitizer';
import { applyPoissonGaussianNoise } from '../image/poisson-gaussian';
import { createAbortError, withManagedImageBitmap } from '../image/bitmap-lifecycle';
import { assertSafeImageDimensions } from '../image/image-header-guard';
import type { DefenseLevel } from '../types';

const MAX_IMAGE_EDGE = 1920;
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
}

export async function processImageWorkerJob(
  input: ImageWorkerJobInput,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<ImageWorkerJobResult> {
  const { buffer, mimeType, options, needsAlpha } = input;
  if (signal?.aborted) throw createAbortError(signal.reason);

  // Fail-closed pre-decode decompression-bomb guard BEFORE createImageBitmap
  assertSafeImageDimensions(buffer);

  const blob = new Blob([buffer], { type: mimeType });

  // Single-pass decode + optional 1920px proportional downscale into one canvas
  // (no dead 2048px outer tile loop, no intermediate PNG round-trip).
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

      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const ctx = canvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | null;
      if (!ctx) throw new Error('WORKER_CONTEXT_FAILED');

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
  const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
  applyPrnuDefense(workCanvas, workCanvas, prnuLevel, needsAlpha, false);
  onProgress?.(55);

  applyDeepDecontamination(workCanvas, needsAlpha);
  onProgress?.(70);

  const imgData = workCtx.getImageData(0, 0, width, height);
  applyPoissonGaussianNoise(imgData.data);
  const alphaReport = sanitizeAlphaChannel(imgData.data, needsAlpha);
  workCtx.putImageData(imgData, 0, 0);

  if (signal?.aborted) throw createAbortError(signal.reason);

  // Drop alpha channel entirely at encode time when source was visually opaque
  let encodeCanvas = workCanvas;
  if (needsAlpha && !alphaReport.hasTransparency) {
    const opaqueCanvas = new OffscreenCanvas(width, height);
    const opaqueCtx = opaqueCanvas.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D | null;
    if (opaqueCtx) {
      opaqueCtx.drawImage(workCanvas, 0, 0);
      encodeCanvas = opaqueCanvas;
    }
  }

  onProgress?.(80);
  const encodedBlob = await encodeCanvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY });
  if (encodedBlob.type !== 'image/webp') throw new Error('WEBP_ENCODE_UNSUPPORTED');
  const rawEncoded = new Uint8Array(await encodedBlob.arrayBuffer());
  onProgress?.(90);

  let cleanBytes: Uint8Array | null = null;
  try {
    cleanBytes = stripDisplayColorProfiles(rawEncoded, 'image/webp');
    const resultBytes = new Uint8Array(cleanBytes.byteLength);
    resultBytes.set(cleanBytes);
    const resultBuffer: ArrayBuffer = resultBytes.buffer;
    return { buffer: resultBuffer, tilesProcessed: 1 };
  } finally {
    rawEncoded.fill(0);
    if (cleanBytes) cleanBytes.fill(0);
  }
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
