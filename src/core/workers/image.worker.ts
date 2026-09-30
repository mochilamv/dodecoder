import { applyPrnuDefense } from '../image/prnu-defense';
import { applyDeepDecontamination, applyYuv420ChromaSubsampling } from '../image/decontamination';
import { stripDisplayColorProfiles } from '../image/icc-sanitizer';

self.onmessage = async (event: MessageEvent) => {
  const { buffer, mimeType, options, needsAlpha } = event.data;
  
  try {
    const blob = new Blob([buffer], { type: mimeType });
    const bitmap = await createImageBitmap(blob);

    let width = bitmap.width;
    let height = bitmap.height;
    
    // Resolution throttling: max edge strictly 1920px with proportional scale
    const maxEdge = Math.max(width, height);
    let sourceSource: ImageBitmap | OffscreenCanvas = bitmap;
    
    if (maxEdge > 1920) {
      const scale = 1920 / maxEdge;
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      
      const downscaleCanvas = new OffscreenCanvas(width, height);
      const dsCtx = downscaleCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
      dsCtx.drawImage(bitmap, 0, 0, width, height);
      sourceSource = downscaleCanvas;
    }

    // Isolate inside Web Worker using OffscreenCanvas
    const targetCanvas = new OffscreenCanvas(width, height);
    
    // Test runtime 2D context instantiation directly inside Web Worker environment.
    // Strip alpha if opaque media to prevent ALPH / VP8X injection
    const ctx = targetCanvas.getContext('2d', { alpha: needsAlpha, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D | null;
    if (!ctx) {
      throw new Error('WORKER_CONTEXT_FAILED');
    }

    // Unconditional affine perturbation
    const prnuLevel = options.defenseLevel === 'standard' ? 'hardened' : options.defenseLevel;
    applyPrnuDefense(sourceSource as any, targetCanvas, prnuLevel, needsAlpha, false);
    
    bitmap.close();

    // Decontamination
    if (options.extremeSanitization) {
      applyDeepDecontamination(targetCanvas, needsAlpha);
    } else {
      const imgData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
      applyYuv420ChromaSubsampling(imgData.data, targetCanvas.width, targetCanvas.height);
      ctx.putImageData(imgData, 0, 0);
    }

    // Encoding Pipeline
    const effectiveMime = 'image/webp';
    const effectiveQuality = 0.60;
    const rawBlob = await targetCanvas.convertToBlob({ type: effectiveMime, quality: effectiveQuality });

    // Inspect RIFF Header
    const rawBuffer = await rawBlob.arrayBuffer();
    const rawBytes = new Uint8Array(rawBuffer);
    
    if (!needsAlpha && rawBytes.length >= 16) {
      const fourCC = String.fromCharCode(rawBytes[12], rawBytes[13], rawBytes[14], rawBytes[15]);
      if (fourCC === 'VP8X') {
        console.warn('Residual extended chunks detected: FourCC equals VP8X on intended non-transparent media.');
      }
    }

    // Zero-copy ICC strip
    const cleanBytes = stripDisplayColorProfiles(rawBytes, effectiveMime);
    
    // Transfer back
    const resultBuffer = cleanBytes.buffer;
    (self as any).postMessage(
      { buffer: resultBuffer },
      [resultBuffer]
    );

  } catch (err: any) {
    (self as any).postMessage({ error: err.message || 'Worker processing failed' });
  }
};
