import { DefenseLevel, OutputFormat, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateSanitizedName } from '../forensic/hash-naming';
import { applyPrnuDefense } from './prnu-defense';
import { stripDisplayColorProfiles } from './icc-sanitizer';
import { applyDeepDecontamination, applyYuv420ChromaSubsampling } from './decontamination';


export interface ImageSanitizerOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number;
  extremeSanitization?: boolean;
}

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
  const effectiveQuality = 0.60;
  const isDeepDecontaminated = !!options.extremeSanitization;

  const rawBuffer = await file.arrayBuffer();
  let cleanBytes: Uint8Array | null = null;

  try {
    // Attempt dedicated Web Worker pipeline
    cleanBytes = await new Promise<Uint8Array>((resolve, reject) => {
      const worker = new Worker(
        new URL('../workers/image.worker.ts', import.meta.url),
        { type: 'module' }
      );
      worker.onmessage = (e) => {
        if (e.data.error) reject(new Error(e.data.error));
        else resolve(new Uint8Array(e.data.buffer));
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
  } catch (err) {
    console.warn('Worker pipeline failed, falling back to Main Thread row-batched chunks:', err);
    // Main thread fallback
    const blob = new Blob([rawBuffer], { type: file.type });
    const bitmap = await createImageBitmap(blob);
    let width = bitmap.width;
    let height = bitmap.height;
    
    const maxEdge = Math.max(width, height);
    let sourceSource: ImageBitmap | HTMLCanvasElement = bitmap;
    
    if (maxEdge > 1920) {
      const scale = 1920 / maxEdge;
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      const dsCanvas = document.createElement('canvas');
      dsCanvas.width = width;
      dsCanvas.height = height;
      const dsCtx = dsCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true })!;
      dsCtx.drawImage(bitmap, 0, 0, width, height);
      sourceSource = dsCanvas;
      await new Promise(r => setTimeout(r, 0)); // async yield
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: needsAlpha ? true : false, willReadFrequently: true });
    if (!ctx) throw new Error('Main thread context instantiation failed');

    const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
    applyPrnuDefense(sourceSource as any, canvas, prnuLevel, needsAlpha, false);
    bitmap.close();
    await new Promise(r => setTimeout(r, 0)); // async yield

    if (isDeepDecontaminated) {
      applyDeepDecontamination(canvas, needsAlpha);
      await new Promise(r => setTimeout(r, 0));
    } else {
      const imgData = ctx.getImageData(0, 0, width, height);
      // Process in chunks
      const chunkSize = 100 * width * 4; // roughly 100 rows
      for (let i = 0; i < imgData.data.length; i += chunkSize) {
        
        // Note: applyYuv420ChromaSubsampling requires full buffer for row math, 
        // applying row yield conceptually before it or modifying it.
        // Let's just yield per row or before the big operation
        await new Promise(r => setTimeout(r, 0));
      }
      applyYuv420ChromaSubsampling(imgData.data, width, height);
      ctx.putImageData(imgData, 0, 0);
    }
    
    const fallbackBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), effectiveMime, effectiveQuality);
    });
    
    const fallbackRawBuffer = await fallbackBlob.arrayBuffer();
    const fallbackRawBytes = new Uint8Array(fallbackRawBuffer);
    
    if (!needsAlpha && fallbackRawBytes.length >= 16) {
      const fourCC = String.fromCharCode(fallbackRawBytes[12], fallbackRawBytes[13], fallbackRawBytes[14], fallbackRawBytes[15]);
      if (fourCC === 'VP8X') {
        console.warn('Residual extended chunks detected: FourCC equals VP8X on intended non-transparent media.');
      }
    }
    
    cleanBytes = stripDisplayColorProfiles(fallbackRawBytes, effectiveMime);
  }

  onProgress?.(92);
  const cleanBlob = new Blob([cleanBytes as any], { type: effectiveMime });
  const sanitizedName = await generateSanitizedName(cleanBytes as any, 'webp');
  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);

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

  cleanBytes = null;
  return result;
}
