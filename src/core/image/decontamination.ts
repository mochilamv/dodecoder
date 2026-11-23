/**
 * Anti-Steganography Deep Decontamination Pipeline
 *
 * Disrupts sub-perceptual spatial watermarks, UID markers, and carrier signals:
 * 1. Spatial Micro-Resampling: 99.5% downscale and 100% Catmull-Rom bicubic reconstruction.
 * 2. Hardware-Accelerated 3x3 Median Filter: WebGL fragment shader with deterministic CPU fallback.
 * 3. Visibility-Threshold Dithering: Deterministic discrete level modulation across RGB channels.
 */

function cubicWeight(x: number): number {
  const ax = x < 0 ? -x : x;
  if (ax < 1.0) {
    const ax2 = ax * ax;
    return ax2 * (1.5 * ax - 2.5) + 1.0;
  }
  if (ax < 2.0) {
    const ax2 = ax * ax;
    return ax2 * (-0.5 * ax + 2.5) - 4.0 * ax + 2.0;
  }
  return 0.0;
}

export function resampleBicubic(
  srcData: Uint32Array,
  srcW: number,
  srcH: number,
  destData: Uint32Array,
  destW: number,
  destH: number,
  hasAlpha: boolean = true
): void {
  const scaleX = srcW / destW;
  const scaleY = srcH / destH;
  
  const srcHMinus1 = srcH - 1;
  const srcWMinus1 = srcW - 1;

  let destIdx = 0;
  for (let y = 0; y < destH; y++) {
    const srcY = (y + 0.5) * scaleY - 0.5;
    const iy = Math.floor(srcY);
    const py = srcY - iy;

    const wy0 = cubicWeight(py + 1);
    const wy1 = cubicWeight(py);
    const wy2 = cubicWeight(py - 1);
    const wy3 = cubicWeight(py - 2);

    const ro0 = (iy - 1 < 0 ? 0 : iy - 1 >= srcH ? srcHMinus1 : iy - 1) * srcW;
    const ro1 = (iy < 0 ? 0 : iy >= srcH ? srcHMinus1 : iy) * srcW;
    const ro2 = (iy + 1 < 0 ? 0 : iy + 1 >= srcH ? srcHMinus1 : iy + 1) * srcW;
    const ro3 = (iy + 2 < 0 ? 0 : iy + 2 >= srcH ? srcHMinus1 : iy + 2) * srcW;

    for (let x = 0; x < destW; x++) {
      const srcX = (x + 0.5) * scaleX - 0.5;
      const ix = Math.floor(srcX);
      const px = srcX - ix;

      const wx0 = cubicWeight(px + 1);
      const wx1 = cubicWeight(px);
      const wx2 = cubicWeight(px - 1);
      const wx3 = cubicWeight(px - 2);

      const cx0 = ix - 1 < 0 ? 0 : ix - 1 >= srcW ? srcWMinus1 : ix - 1;
      const cx1 = ix < 0 ? 0 : ix >= srcW ? srcWMinus1 : ix;
      const cx2 = ix + 1 < 0 ? 0 : ix + 1 >= srcW ? srcWMinus1 : ix + 1;
      const cx3 = ix + 2 < 0 ? 0 : ix + 2 >= srcW ? srcWMinus1 : ix + 2;

      let r = 0, g = 0, b = 0, a = 0;

      // Unrolled 16-tap sampling: premultiplied alpha when hasAlpha=true prevents
      // RGB hidden under alpha=0 from bleeding into visible neighbor pixels.
      if (hasAlpha) {
        if (wy0 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro0 + cx0]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx0 * wy0; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx1 !== 0) { const p = srcData[ro0 + cx1]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx1 * wy0; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx2 !== 0) { const p = srcData[ro0 + cx2]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx2 * wy0; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx3 !== 0) { const p = srcData[ro0 + cx3]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx3 * wy0; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
        }
        if (wy1 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro1 + cx0]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx0 * wy1; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx1 !== 0) { const p = srcData[ro1 + cx1]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx1 * wy1; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx2 !== 0) { const p = srcData[ro1 + cx2]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx2 * wy1; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx3 !== 0) { const p = srcData[ro1 + cx3]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx3 * wy1; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
        }
        if (wy2 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro2 + cx0]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx0 * wy2; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx1 !== 0) { const p = srcData[ro2 + cx1]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx1 * wy2; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx2 !== 0) { const p = srcData[ro2 + cx2]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx2 * wy2; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx3 !== 0) { const p = srcData[ro2 + cx3]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx3 * wy2; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
        }
        if (wy3 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro3 + cx0]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx0 * wy3; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx1 !== 0) { const p = srcData[ro3 + cx1]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx1 * wy3; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx2 !== 0) { const p = srcData[ro3 + cx2]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx2 * wy3; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
          if (wx3 !== 0) { const p = srcData[ro3 + cx3]; const pa = (p >>> 24) & 0xFF; if (pa !== 0) { const w = wx3 * wy3; const wa = w * pa; r += (p & 0xFF) * wa; g += ((p >> 8) & 0xFF) * wa; b += ((p >> 16) & 0xFF) * wa; a += wa; } }
        }

        const outA = a < 0 ? 0 : a >= 255.5 ? 255 : (a + 0.5) | 0;
        if (outA === 0) {
          destData[destIdx++] = 0;
        } else {
          const invA = 1.0 / a;
          const ur = r * invA;
          const ug = g * invA;
          const ub = b * invA;
          const outR = ur < 0 ? 0 : ur >= 255.5 ? 255 : (ur + 0.5) | 0;
          const outG = ug < 0 ? 0 : ug >= 255.5 ? 255 : (ug + 0.5) | 0;
          const outB = ub < 0 ? 0 : ub >= 255.5 ? 255 : (ub + 0.5) | 0;
          destData[destIdx++] = outR | (outG << 8) | (outB << 16) | (outA << 24);
        }
      } else {
        if (wy0 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro0 + cx0]; const w = wx0 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx1 !== 0) { const p = srcData[ro0 + cx1]; const w = wx1 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx2 !== 0) { const p = srcData[ro0 + cx2]; const w = wx2 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx3 !== 0) { const p = srcData[ro0 + cx3]; const w = wx3 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
        }
        if (wy1 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro1 + cx0]; const w = wx0 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx1 !== 0) { const p = srcData[ro1 + cx1]; const w = wx1 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx2 !== 0) { const p = srcData[ro1 + cx2]; const w = wx2 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx3 !== 0) { const p = srcData[ro1 + cx3]; const w = wx3 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
        }
        if (wy2 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro2 + cx0]; const w = wx0 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx1 !== 0) { const p = srcData[ro2 + cx1]; const w = wx1 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx2 !== 0) { const p = srcData[ro2 + cx2]; const w = wx2 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx3 !== 0) { const p = srcData[ro2 + cx3]; const w = wx3 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
        }
        if (wy3 !== 0) {
          if (wx0 !== 0) { const p = srcData[ro3 + cx0]; const w = wx0 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx1 !== 0) { const p = srcData[ro3 + cx1]; const w = wx1 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx2 !== 0) { const p = srcData[ro3 + cx2]; const w = wx2 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
          if (wx3 !== 0) { const p = srcData[ro3 + cx3]; const w = wx3 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; }
        }

        const outR = r < 0 ? 0 : r >= 255.5 ? 255 : (r + 0.5) | 0;
        const outG = g < 0 ? 0 : g >= 255.5 ? 255 : (g + 0.5) | 0;
        const outB = b < 0 ? 0 : b >= 255.5 ? 255 : (b + 0.5) | 0;
        destData[destIdx++] = outR | (outG << 8) | (outB << 16) | (255 << 24);
      }
    }
  }
}

export function applySpatialMicroResampling(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  hasAlpha: boolean = true
): void {
  const origW = canvas.width;
  const origH = canvas.height;
  if (origW < 4 || origH < 4) return;

  const downW = Math.max(2, (origW * 0.995 + 0.5) | 0);
  const downH = Math.max(2, (origH * 0.995 + 0.5) | 0);

  let downCanvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== 'undefined') {
    downCanvas = new OffscreenCanvas(downW, downH);
  } else {
    downCanvas = document.createElement('canvas');
    downCanvas.width = downW;
    downCanvas.height = downH;
  }

  const downCtx = downCanvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  downCtx.drawImage(canvas, 0, 0, downW, downH);

  const downImgData = downCtx.getImageData(0, 0, downW, downH);
  const downData = new Uint32Array(downImgData.data.buffer);

  const destCtx = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  const destImgData = destCtx.createImageData(origW, origH);
  const destData = new Uint32Array(destImgData.data.buffer);

  resampleBicubic(downData, downW, downH, destData, origW, origH, hasAlpha);
  destCtx.putImageData(destImgData, 0, 0);
}

export function median9(v: Uint8Array): number {
  let p0 = v[0], p1 = v[1], p2 = v[2], p3 = v[3], p4 = v[4], p5 = v[5], p6 = v[6], p7 = v[7], p8 = v[8];
  let t = 0;
  if (p1 > p2) { t = p1; p1 = p2; p2 = t; }
  if (p4 > p5) { t = p4; p4 = p5; p5 = t; }
  if (p7 > p8) { t = p7; p7 = p8; p8 = t; }
  if (p0 > p1) { t = p0; p0 = p1; p1 = t; }
  if (p3 > p4) { t = p3; p3 = p4; p4 = t; }
  if (p6 > p7) { t = p6; p6 = p7; p7 = t; }
  if (p1 > p2) { t = p1; p1 = p2; p2 = t; }
  if (p4 > p5) { t = p4; p4 = p5; p5 = t; }
  if (p7 > p8) { t = p7; p7 = p8; p8 = t; }
  if (p0 > p3) { t = p0; p0 = p3; p3 = t; }
  if (p5 > p8) { t = p5; p5 = p8; p8 = t; }
  if (p4 > p7) { t = p4; p4 = p7; p7 = t; }
  if (p3 > p6) { t = p3; p3 = p6; p6 = t; }
  if (p1 > p4) { t = p1; p1 = p4; p4 = t; }
  if (p2 > p5) { t = p2; p2 = p5; p5 = t; }
  if (p4 > p7) { t = p4; p4 = p7; p7 = t; }
  if (p4 > p2) { t = p4; p4 = p2; p2 = t; }
  if (p6 > p4) { t = p6; p6 = p4; p4 = t; }
  if (p4 > p2) { p4 = p2; }
  return p4;
}

export function applyMedianFilterCpu(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const len = data.length;
  const output = new Uint8ClampedArray(len);
  output.set(data);

  const r = new Uint8Array(9);
  const g = new Uint8Array(9);
  const b = new Uint8Array(9);

  const wMinus1 = width - 1;
  const hMinus1 = height - 1;

  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      let idx = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy < 0 ? 0 : y + dy > hMinus1 ? hMinus1 : y + dy;
        const row = ny * width;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx < 0 ? 0 : x + dx > wMinus1 ? wMinus1 : x + dx;
          const p = (row + nx) << 2;
          r[idx] = data[p];
          g[idx] = data[p + 1];
          b[idx] = data[p + 2];
          idx++;
        }
      }

      const outPos = (rowBase + x) << 2;
      if (data[outPos + 3] === 0) {
        output[outPos] = 0;
        output[outPos + 1] = 0;
        output[outPos + 2] = 0;
      } else {
        output[outPos] = median9(r);
        output[outPos + 1] = median9(g);
        output[outPos + 2] = median9(b);
      }
    }
  }
  data.set(output);
}

export function createMedianOrientationTestPattern(
  width: number = 8,
  height: number = 8
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  const midX = width >> 1;
  const midY = height >> 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) << 2;
      if (y < midY && x < midX) {
        // Distinct top-left marker: pure Red
        data[idx] = 255;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      } else if (y < midY) {
        // Top-right: pure Green
        data[idx] = 0;
        data[idx + 1] = 255;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      } else if (x < midX) {
        // Bottom-left: pure Blue
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      } else {
        // Bottom-right: Yellow
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      }
    }
  }
  return data;
}

export function verifyMedianOrientationTestPattern(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number
): {
  ok: boolean;
  topLeft: [number, number, number, number];
  topRight: [number, number, number, number];
  bottomLeft: [number, number, number, number];
  bottomRight: [number, number, number, number];
  failureReason?: string;
} {
  const readPixel = (x: number, y: number): [number, number, number, number] => {
    const idx = (y * width + x) << 2;
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  };

  const lx = Math.max(0, Math.min(width - 1, 1));
  const rx = Math.max(0, width - 2);
  const ty = Math.max(0, Math.min(height - 1, 1));
  const by = Math.max(0, height - 2);

  const topLeft = readPixel(lx, ty);
  const topRight = readPixel(rx, ty);
  const bottomLeft = readPixel(lx, by);
  const bottomRight = readPixel(rx, by);

  const isEq = (a: [number, number, number, number], b: [number, number, number, number]) =>
    a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

  if (
    isEq(topLeft, [255, 0, 0, 255]) &&
    isEq(topRight, [0, 255, 0, 255]) &&
    isEq(bottomLeft, [0, 0, 255, 255]) &&
    isEq(bottomRight, [255, 255, 0, 255])
  ) {
    return { ok: true, topLeft, topRight, bottomLeft, bottomRight };
  }

  let failureReason = 'Quadrant color mismatch';
  if (isEq(topLeft, [0, 0, 255, 255]) && isEq(bottomLeft, [255, 0, 0, 255])) {
    failureReason = 'Vertical flip (Y-inversion) detected';
  } else if (isEq(topLeft, [0, 255, 0, 255]) && isEq(topRight, [255, 0, 0, 255])) {
    failureReason = 'Horizontal flip (X-inversion) detected';
  }

  return { ok: false, topLeft, topRight, bottomLeft, bottomRight, failureReason };
}

export function applyMedianFilter3x3(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  hasAlpha: boolean = true
): void {
  const w = canvas.width;
  const h = canvas.height;
  if (w < 3 || h < 3) return;

  const ctx2d = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (!ctx2d) return;

  let glCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  let gl: WebGLRenderingContext | null = null;
  let vs: WebGLShader | null = null;
  let fs: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  let posBuffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const framebuffer: WebGLFramebuffer | null = null;

  try {
    try {
      if (typeof OffscreenCanvas !== 'undefined') {
        glCanvas = new OffscreenCanvas(w, h);
      } else {
        glCanvas = document.createElement('canvas');
        glCanvas.width = w;
        glCanvas.height = h;
      }
      const glAttrs: WebGLContextAttributes = {
        alpha: hasAlpha,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        antialias: false,
        depth: false,
        stencil: false,
      };
      gl = glCanvas.getContext('webgl', glAttrs) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }

    if (!gl) {
      const imgData = ctx2d.getImageData(0, 0, w, h);
      applyMedianFilterCpu(imgData.data, w, h);
      ctx2d.putImageData(imgData, 0, 0);
      return;
    }

    try {
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = (a_position + 1.0) * 0.5;
        }
      `;

      const outputExpr = hasAlpha
        ? 'a == 0.0 ? vec4(0.0, 0.0, 0.0, 0.0) : vec4(r[4], g[4], b[4], a)'
        : 'vec4(r[4], g[4], b[4], 1.0)';

      const fsSource = `
        precision mediump float;
        uniform sampler2D u_image;
        uniform vec2 u_resolution;
        varying vec2 v_texCoord;

        void sort9(inout float v[9]) {
          for (int i = 0; i < 9; i++) {
            for (int j = i + 1; j < 9; j++) {
              if (v[i] > v[j]) {
                float tmp = v[i];
                v[i] = v[j];
                v[j] = tmp;
              }
            }
          }
        }

        void main() {
          vec2 onePixel = vec2(1.0, 1.0) / u_resolution;
          float r[9];
          float g[9];
          float b[9];
          int idx = 0;
          for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
              vec4 c = texture2D(u_image, v_texCoord + vec2(float(x), float(y)) * onePixel);
              r[idx] = c.r;
              g[idx] = c.g;
              b[idx] = c.b;
              idx++;
            }
          }
          sort9(r);
          sort9(g);
          sort9(b);
          float a = texture2D(u_image, v_texCoord).a;
          gl_FragColor = ${outputExpr};
        }
      `;

      vs = gl.createShader(gl.VERTEX_SHADER);
      if (!vs) throw new Error('WebGL vertex shader allocation failed');
      gl.shaderSource(vs, vsSource);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        throw new Error(`WebGL vertex shader compile failed: ${gl.getShaderInfoLog(vs) || 'unknown'}`);
      }

      fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fs) throw new Error('WebGL fragment shader allocation failed');
      gl.shaderSource(fs, fsSource);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        throw new Error(`WebGL fragment shader compile failed: ${gl.getShaderInfoLog(fs) || 'unknown'}`);
      }

      program = gl.createProgram();
      if (!program) throw new Error('WebGL program allocation failed');
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`WebGL program link failed: ${gl.getProgramInfoLog(program) || 'unknown'}`);
      }
      gl.useProgram(program);

      posBuffer = gl.createBuffer();
      if (!posBuffer) throw new Error('WebGL vertex buffer allocation failed');
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const aPos = gl.getAttribLocation(program, 'a_position');
      if (aPos < 0) throw new Error('WebGL attribute a_position unavailable');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, 'u_resolution');
      if (!uRes) throw new Error('WebGL uniform u_resolution unavailable');
      gl.uniform2f(uRes, w, h);

      const uImage = gl.getUniformLocation(program, 'u_image');
      if (uImage) gl.uniform1i(uImage, 0);

      texture = gl.createTexture();
      if (!texture) throw new Error('WebGL texture allocation failed');
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      // Canvas sources honor pixelStorei per WebGL 1.0 spec (unlike ImageBitmap).
      // Enforce upright Y orientation, straight alpha, and disable browser ICC conversion.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas as any);

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      ctx2d.clearRect(0, 0, w, h);
      ctx2d.drawImage(glCanvas as any, 0, 0);
    } catch {
      const imgData = ctx2d.getImageData(0, 0, w, h);
      applyMedianFilterCpu(imgData.data, w, h);
      ctx2d.putImageData(imgData, 0, 0);
    }
  } finally {
    if (gl) {
      try {
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(null);
        if (texture) gl.deleteTexture(texture);
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (posBuffer) gl.deleteBuffer(posBuffer);
        if (program) {
          if (vs) gl.detachShader(program, vs);
          if (fs) gl.detachShader(program, fs);
          gl.deleteProgram(program);
        }
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        // Ignore teardown failures on an already-lost WebGL context
      }
    }
    if (glCanvas) {
      glCanvas.width = 0;
      glCanvas.height = 0;
    }
  }
}

export const MAX_CRYPTO_RANDOM_CHUNK_BYTES = 65536;

export type RandomBytesGenerator = (target: Uint8Array<ArrayBuffer>) => Uint8Array<ArrayBuffer>;

export function fillCryptoRandomBytes(target: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  for (let offset = 0; offset < target.length; offset += MAX_CRYPTO_RANDOM_CHUNK_BYTES) {
    const chunkLen = Math.min(MAX_CRYPTO_RANDOM_CHUNK_BYTES, target.length - offset);
    globalThis.crypto.getRandomValues(target.subarray(offset, offset + chunkLen));
  }
  return target;
}

function makeSeededByteGenerator(seed: number): RandomBytesGenerator {
  let state = (seed | 0) || 0x12345678;
  return (target: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> => {
    for (let i = 0; i < target.length; i++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      target[i] = state & 0xff;
    }
    return target;
  };
}

export function applyVisibilityDithering(
  data: Uint8ClampedArray | Uint8Array,
  rngOrSeed?: RandomBytesGenerator | number
): void {
  const len = data.length;
  const pixelCount = len >> 2;
  if (pixelCount <= 0) return;

  const fillBytes: RandomBytesGenerator =
    typeof rngOrSeed === 'function'
      ? rngOrSeed
      : typeof rngOrSeed === 'number'
        ? makeSeededByteGenerator(rngOrSeed)
        : fillCryptoRandomBytes;

  const chunkPixels = Math.min(pixelCount, MAX_CRYPTO_RANDOM_CHUNK_BYTES);
  const randBuf = new Uint8Array(chunkPixels);

  try {
    let pixelOffset = 0;
    while (pixelOffset < pixelCount) {
      const batch = Math.min(chunkPixels, pixelCount - pixelOffset);
      const view = batch === chunkPixels ? randBuf : randBuf.subarray(0, batch);
      fillBytes(view);

      for (let k = 0; k < batch; k++) {
        const rb = view[k];
        const i = (pixelOffset + k) << 2;

        // Preserve normalized zero RGB on fully transparent pixels (AUD-06/AUD-07 vector c)
        if (data[i + 3] === 0) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          continue;
        }

        const rSign = (rb & 1) === 0 ? 1 : -1;
        const rMag = ((rb >>> 1) & 1) + 1;
        const rOffset = rSign * rMag;

        const gSign = ((rb >>> 2) & 1) === 0 ? 1 : -1;
        const gMag = ((rb >>> 3) & 1) + 1;
        const gOffset = gSign * gMag;

        const bSign = ((rb >>> 4) & 1) === 0 ? 1 : -1;
        const bMag = ((rb >>> 5) & 1) + 1;
        const bOffset = bSign * bMag;

        const nr = data[i] + rOffset;
        const ng = data[i + 1] + gOffset;
        const nb = data[i + 2] + bOffset;

        data[i] = nr < 0 ? 0 : nr > 255 ? 255 : nr;
        data[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
        data[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
      }

      pixelOffset += batch;
    }
  } finally {
    randBuf.fill(0);
  }
}

export const ALPHA_NEAR_OPAQUE_THRESHOLD = 252;
export const ALPHA_NEAR_TRANSPARENT_THRESHOLD = 3;
export const MAX_ALPHA_SANITIZATION_DELTA = 3;

export interface AlphaSanitizationReport {
  hasTransparency: boolean;
  pixelsSnappedOpaque: number;
  pixelsSnappedTransparent: number;
  pixelsDitheredAlpha: number;
  pixelsZeroedRgb: number;
  maxAbsAlphaDelta: number;
}

/**
 * Zeros RGB channels wherever alpha === 0 to eliminate hidden RGB payloads
 * prior to any spatial resampling or filtering.
 */
export function normalizeTransparentRgb(data: Uint8ClampedArray | Uint8Array): number {
  let zeroed = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        zeroed++;
      }
    }
  }
  return zeroed;
}

/**
 * Mitigates all three alpha-channel steganography vectors (AUD-06 / Report AUD-07):
 * (a) Near-opaque alpha [252..254] snaps to 255 (|delta alpha| <= 3), neutralizing opaque LSB payloads.
 * (b) Real transparency [4..251] re-randomizes low 2 bits via chunked CSPRNG (|delta alpha| <= 3).
 * (c) Transparent / near-transparent [0..3] snaps to 0 (|delta alpha| <= 3) and zeros hidden RGB channels.
 */
export function sanitizeAlphaChannel(
  data: Uint8ClampedArray | Uint8Array,
  hasAlpha: boolean = true,
  rng?: RandomBytesGenerator
): AlphaSanitizationReport {
  const pixelCount = data.length >> 2;
  const report: AlphaSanitizationReport = {
    hasTransparency: false,
    pixelsSnappedOpaque: 0,
    pixelsSnappedTransparent: 0,
    pixelsDitheredAlpha: 0,
    pixelsZeroedRgb: 0,
    maxAbsAlphaDelta: 0,
  };
  if (pixelCount <= 0) return report;

  if (!hasAlpha) {
    for (let i = 0; i < data.length; i += 4) {
      const a0 = data[i + 3];
      if (a0 !== 255) {
        const d = 255 - a0;
        if (d > report.maxAbsAlphaDelta) report.maxAbsAlphaDelta = d;
        data[i + 3] = 255;
        report.pixelsSnappedOpaque++;
      }
    }
    return report;
  }

  const fillBytes = rng ?? fillCryptoRandomBytes;
  const chunkPixels = Math.min(pixelCount, MAX_CRYPTO_RANDOM_CHUNK_BYTES);
  const randBuf = new Uint8Array(chunkPixels);

  try {
    let pixelOffset = 0;
    while (pixelOffset < pixelCount) {
      const batch = Math.min(chunkPixels, pixelCount - pixelOffset);
      const view = batch === chunkPixels ? randBuf : randBuf.subarray(0, batch);
      let rngFilled = false;

      for (let k = 0; k < batch; k++) {
        const i = (pixelOffset + k) << 2;
        const a0 = data[i + 3];

        if (a0 >= ALPHA_NEAR_OPAQUE_THRESHOLD) {
          if (a0 !== 255) {
            const d = 255 - a0;
            if (d > report.maxAbsAlphaDelta) report.maxAbsAlphaDelta = d;
            data[i + 3] = 255;
            report.pixelsSnappedOpaque++;
          }
        } else if (a0 <= ALPHA_NEAR_TRANSPARENT_THRESHOLD) {
          report.hasTransparency = true;
          if (a0 !== 0) {
            if (a0 > report.maxAbsAlphaDelta) report.maxAbsAlphaDelta = a0;
            data[i + 3] = 0;
            report.pixelsSnappedTransparent++;
          }
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            report.pixelsZeroedRgb++;
          }
        } else {
          // Real semi-transparent pixel in [4..251]: replace bottom 2 bits with CSPRNG
          if (!rngFilled) {
            fillBytes(view);
            rngFilled = true;
          }
          const a1 = (a0 & 0xfc) | (view[k] & 0x03);
          data[i + 3] = a1;
          report.hasTransparency = true;
          report.pixelsDitheredAlpha++;
          const d = a1 >= a0 ? a1 - a0 : a0 - a1;
          if (d > report.maxAbsAlphaDelta) report.maxAbsAlphaDelta = d;
        }
      }

      pixelOffset += batch;
    }
  } finally {
    randBuf.fill(0);
  }

  return report;
}

export function applyYuv420ChromaSubsampling(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  for (let by = 0; by < height; by += 2) {
    const hasNextRow = by + 1 < height;
    const rowOffset0 = by * width;
    const rowOffset1 = (by + 1) * width;

    for (let bx = 0; bx < width; bx += 2) {
      const hasNextCol = bx + 1 < width;

      const idx0 = (rowOffset0 + bx) << 2;
      let count = 0;
      let sumCb = 0;
      let sumCr = 0;

      const vis0 = data[idx0 + 3] !== 0;
      let y0 = 0, y1 = 0, y2 = 0, y3 = 0;
      let idx1 = 0, idx2 = 0, idx3 = 0;
      let vis1 = false, vis2 = false, vis3 = false;

      if (vis0) {
        const r0 = data[idx0];
        const g0 = data[idx0 + 1];
        const b0 = data[idx0 + 2];
        y0 = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
        sumCb += -0.168736 * r0 - 0.331264 * g0 + 0.5 * b0 + 128;
        sumCr += 0.5 * r0 - 0.418688 * g0 - 0.081312 * b0 + 128;
        count++;
      } else {
        data[idx0] = 0;
        data[idx0 + 1] = 0;
        data[idx0 + 2] = 0;
      }

      if (hasNextCol) {
        idx1 = idx0 + 4;
        vis1 = data[idx1 + 3] !== 0;
        if (vis1) {
          const r = data[idx1], g = data[idx1 + 1], b = data[idx1 + 2];
          y1 = 0.299 * r + 0.587 * g + 0.114 * b;
          sumCb += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          sumCr += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
          count++;
        } else {
          data[idx1] = 0;
          data[idx1 + 1] = 0;
          data[idx1 + 2] = 0;
        }
      }
      if (hasNextRow) {
        idx2 = (rowOffset1 + bx) << 2;
        vis2 = data[idx2 + 3] !== 0;
        if (vis2) {
          const r = data[idx2], g = data[idx2 + 1], b = data[idx2 + 2];
          y2 = 0.299 * r + 0.587 * g + 0.114 * b;
          sumCb += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          sumCr += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
          count++;
        } else {
          data[idx2] = 0;
          data[idx2 + 1] = 0;
          data[idx2 + 2] = 0;
        }
      }
      if (hasNextRow && hasNextCol) {
        idx3 = idx2 + 4;
        vis3 = data[idx3 + 3] !== 0;
        if (vis3) {
          const r = data[idx3], g = data[idx3 + 1], b = data[idx3 + 2];
          y3 = 0.299 * r + 0.587 * g + 0.114 * b;
          sumCb += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          sumCr += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
          count++;
        } else {
          data[idx3] = 0;
          data[idx3 + 1] = 0;
          data[idx3 + 2] = 0;
        }
      }

      if (count === 0) continue;

      const cbShift = (sumCb / count) - 128;
      const crShift = (sumCr / count) - 128;

      if (vis0) {
        data[idx0]     = y0 + 1.402 * crShift;
        data[idx0 + 1] = y0 - 0.344136 * cbShift - 0.714136 * crShift;
        data[idx0 + 2] = y0 + 1.772 * cbShift;
      }

      if (vis1) {
        data[idx1]     = y1 + 1.402 * crShift;
        data[idx1 + 1] = y1 - 0.344136 * cbShift - 0.714136 * crShift;
        data[idx1 + 2] = y1 + 1.772 * cbShift;
      }
      if (vis2) {
        data[idx2]     = y2 + 1.402 * crShift;
        data[idx2 + 1] = y2 - 0.344136 * cbShift - 0.714136 * crShift;
        data[idx2 + 2] = y2 + 1.772 * cbShift;
      }
      if (vis3) {
        data[idx3]     = y3 + 1.402 * crShift;
        data[idx3 + 1] = y3 - 0.344136 * cbShift - 0.714136 * crShift;
        data[idx3 + 2] = y3 + 1.772 * cbShift;
      }
    }
  }
}

export function applyDeepDecontamination(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  hasAlpha: boolean = true
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (ctx && hasAlpha) {
    const preData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (normalizeTransparentRgb(preData.data) > 0) {
      ctx.putImageData(preData, 0, 0);
    }
  }

  applySpatialMicroResampling(canvas, hasAlpha);
  applyMedianFilter3x3(canvas, hasAlpha);
  if (ctx) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyYuv420ChromaSubsampling(imgData.data, canvas.width, canvas.height);
    applyVisibilityDithering(imgData.data);
    sanitizeAlphaChannel(imgData.data, hasAlpha);
    ctx.putImageData(imgData, 0, 0);
  }
}
