import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateSanitizedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles } from './icc-sanitizer';
import { applyDeepDecontamination } from './decontamination';
import { applyPoissonGaussianNoise } from './poisson-gaussian';
import { encodeDeterministicWebp } from './wasm-encoder';

export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number;
}

const TILE_SIZE = 2048;

export async function sanitizeImage(
  file: File | Blob,
  options: ImageSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  onProgress?.(10);
  const originalName = file instanceof File ? file.name : 'unnamed_image';
  const originalSize = file.size;

  const auditBefore = await analyzeForensics(file, originalName);
  onProgress?.(25);

  const isOpaqueSource = file.type === 'image/jpeg' || /\.(jpe?g|bmp)$/i.test(originalName);
  const needsAlpha = !isOpaqueSource;

  const effectiveMime = 'image/webp';
  const isDeepDecontaminated = true;

  const rawBuffer = await file.arrayBuffer();
  let cleanBytes: Uint8Array | null = null;
  let tilesProcessed = 0;

  try {
    const workerRes = await new Promise<{ buffer: ArrayBuffer; tilesProcessed: number }>((resolve, reject) => {
      const worker = new Worker(
        new URL('../workers/image.worker.ts', import.meta.url),
        { type: 'module' }
      );
      worker.onmessage = (e) => {
        if (e.data.error) reject(new Error(e.data.error));
        else resolve({ buffer: e.data.buffer, tilesProcessed: e.data.tilesProcessed });
        worker.terminate();
      };
      worker.onerror = (e) => {
        reject(e);
        worker.terminate();
      };
      worker.postMessage({
        buffer: rawBuffer,
        mimeType: file.type || 'image/jpeg',
        options,
        needsAlpha
      }, [rawBuffer]);
    });
    cleanBytes = new Uint8Array(workerRes.buffer);
    tilesProcessed = workerRes.tilesProcessed;
  } catch (err) {
    console.warn('Worker pipeline failed, falling back to Main Thread row-batched chunks:', err);
    const blob = new Blob([rawBuffer], { type: file.type });
    const metaBitmap = await createImageBitmap(blob);
    const width = metaBitmap.width;
    const height = metaBitmap.height;
    metaBitmap.close();

    const cols = Math.ceil(width / TILE_SIZE);
    const rows = Math.ceil(height / TILE_SIZE);
    tilesProcessed = cols * rows;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = width;
    outCanvas.height = height;
    const outCtx = outCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true });
    if (!outCtx) throw new Error('Main thread context instantiation failed');

    let currentTile = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * TILE_SIZE;
        const sy = r * TILE_SIZE;
        const sw = Math.min(TILE_SIZE, width - sx);
        const sh = Math.min(TILE_SIZE, height - sy);

        const tileBitmap = await createImageBitmap(blob, sx, sy, sw, sh);
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = sw;
        tileCanvas.height = sh;
        const tileCtx = tileCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true })!;

        const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
        applyPrnuDefense(tileBitmap as any, tileCanvas, prnuLevel, needsAlpha, false);
        tileBitmap.close();

        applyDeepDecontamination(tileCanvas, needsAlpha);

        const imgData = tileCtx.getImageData(0, 0, sw, sh);
        applyPoissonGaussianNoise(imgData.data);
        tileCtx.putImageData(imgData, 0, 0);

        outCtx.drawImage(tileCanvas, sx, sy);

        currentTile++;
        onProgress?.(25 + (currentTile / tilesProcessed) * 60);
        await new Promise(r => setTimeout(r, 0));
      }
    }

    const finalImageData = outCtx.getImageData(0, 0, width, height);
    const wasmEncoded = await encodeDeterministicWebp(finalImageData.data, width, height);
    cleanBytes = stripDisplayColorProfiles(wasmEncoded, effectiveMime);
  }

  onProgress?.(92);
  const cleanBlob = new Blob([cleanBytes as any], { type: effectiveMime });
  const ext = 'webp';
  const sanitizedName = await generateSanitizedName(cleanBytes as any, ext);
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);

  if (auditAfter.sha256 === auditBefore.sha256) {
    throw new Error('Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input');
  }

  onProgress?.(100);
  return {
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
    tilesProcessed,
    wasmEncoded: true
  };
}
