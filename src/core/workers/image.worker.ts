import { applyPrnuDefense } from '../image/prnu-defense';
import { applyDeepDecontamination } from '../image/decontamination';
import { stripDisplayColorProfiles } from '../image/icc-sanitizer';
import { applyPoissonGaussianNoise } from '../image/poisson-gaussian';
import { encodeDeterministicWebp } from '../image/wasm-encoder';

const TILE_SIZE = 2048;

self.onmessage = async (event: MessageEvent) => {
  const { buffer, mimeType, options, needsAlpha } = event.data;

  try {
    const blob = new Blob([buffer], { type: mimeType });

    const metaBitmap = await createImageBitmap(blob);
    let width = metaBitmap.width;
    let height = metaBitmap.height;
    metaBitmap.close();

    const maxEdge = Math.max(width, height);
    let workingBlob: Blob = blob;

    if (maxEdge > 1920) {
      const scale = 1920 / maxEdge;
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const dsCanvas = new OffscreenCanvas(width, height);
      const dsCtx = dsCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
      const rawBitmap = await createImageBitmap(blob);
      dsCtx.drawImage(rawBitmap, 0, 0, width, height);
      rawBitmap.close();
      workingBlob = await dsCanvas.convertToBlob({ type: 'image/png' });
    }

    const cols = Math.ceil(width / TILE_SIZE);
    const rows = Math.ceil(height / TILE_SIZE);
    const totalTiles = cols * rows;

    const outCanvas = new OffscreenCanvas(width, height);
    const outCtx = outCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
    if (!outCtx) throw new Error('WORKER_CONTEXT_FAILED');

    let currentTile = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * TILE_SIZE;
        const sy = r * TILE_SIZE;
        const sw = Math.min(TILE_SIZE, width - sx);
        const sh = Math.min(TILE_SIZE, height - sy);

        const tileBitmap = await createImageBitmap(workingBlob, sx, sy, sw, sh);

        const tileCanvas = new OffscreenCanvas(sw, sh);
        const tileCtx = tileCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;

        const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
        applyPrnuDefense(tileBitmap as any, tileCanvas, prnuLevel, needsAlpha, false);
        tileBitmap.close();

        applyDeepDecontamination(tileCanvas, needsAlpha);

        const imgData = tileCtx.getImageData(0, 0, sw, sh);
        applyPoissonGaussianNoise(imgData.data);
        tileCtx.putImageData(imgData, 0, 0);

        outCtx.drawImage(tileCanvas, sx, sy);

        currentTile++;
        (self as any).postMessage({
          type: 'progress',
          percent: Math.round(25 + (currentTile / totalTiles) * 50)
        });
      }
    }

    (self as any).postMessage({ type: 'progress', percent: 78 });
    const finalImgData = outCtx.getImageData(0, 0, width, height);
    const rawEncoded = await encodeDeterministicWebp(finalImgData.data, width, height);
    (self as any).postMessage({ type: 'progress', percent: 90 });
    const cleanBytes = stripDisplayColorProfiles(rawEncoded, 'image/webp');

    const resultBuffer = cleanBytes.buffer.slice(
      cleanBytes.byteOffset,
      cleanBytes.byteOffset + cleanBytes.byteLength
    );

    (self as any).postMessage(
      { buffer: resultBuffer, tilesProcessed: totalTiles, wasmEncoded: true },
      [resultBuffer]
    );
  } catch (err: any) {
    (self as any).postMessage({ error: err.message || 'Worker processing failed' });
  }
};
