import { DefenseLevel } from '../types';

export interface PrnuTransformConfig {
  theta: number;
  sx: number;
  sy: number;
  noiseIntensity: number;
}

export function calculateAntiPrnuConfig(
  level: DefenseLevel,
  skipNoise: boolean = false
): PrnuTransformConfig {
  if (level === 'standard') {
    return { theta: 0, sx: 1.0, sy: 1.0, noiseIntensity: 0 };
  }

  const seed = new Uint32Array(3);
  crypto.getRandomValues(seed);

  const thetaDeg = 0.1 + (seed[0] / 0xFFFFFFFF) * 0.2;
  const sign = (seed[0] % 2 === 0) ? 1 : -1;
  const theta = sign * (thetaDeg * Math.PI) / 180.0;

  const sx = 0.995 + (seed[1] / 0xFFFFFFFF) * 0.004;
  let sy = 0.995 + (seed[2] / 0xFFFFFFFF) * 0.004;
  
  if (sx - sy > -0.0005 && sx - sy < 0.0005) {
      sy = sx < 0.997 ? sx + 0.0006 : sx - 0.0006;
  }

  return { theta, sx, sy, noiseIntensity: skipNoise ? 0 : 2 };
}

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

export function applyPrnuDefense(
  sourceImage: ImageBitmap | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement | OffscreenCanvas,
  level: DefenseLevel,
  hasAlpha: boolean = true,
  skipNoise: boolean = false
): void {
  const origW = sourceImage.width;
  const origH = sourceImage.height;

  if (level === 'standard') {
    targetCanvas.width = origW;
    targetCanvas.height = origH;
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true, alpha: hasAlpha }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    ctx.drawImage(sourceImage, 0, 0);
    return;
  }

  const config = calculateAntiPrnuConfig(level, skipNoise);

  const srcCanvas = new OffscreenCanvas(origW, origH);
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
  srcCtx.drawImage(sourceImage, 0, 0);
  const srcImgData = srcCtx.getImageData(0, 0, origW, origH);
  const srcData = new Uint32Array(srcImgData.data.buffer);

  const crop = 3;
  const destW = origW - crop * 2;
  const destH = origH - crop * 2;

  targetCanvas.width = destW;
  targetCanvas.height = destH;
  const destCtx = targetCanvas.getContext('2d', { willReadFrequently: true, alpha: hasAlpha }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const destImgData = destCtx.createImageData(destW, destH);
  const destData = new Uint32Array(destImgData.data.buffer);

  const cosT = Math.cos(config.theta);
  const sinT = Math.sin(config.theta);
  
  const a = config.sx * cosT;
  const b = -config.sy * sinT;
  const c = config.sx * sinT;
  const d = config.sy * cosT;
  
  const det = a * d - b * c;
  const invA = d / det;
  const invB = -b / det;
  const invC = -c / det;
  const invD = a / det;

  const cx = origW * 0.5;
  const cy = origH * 0.5;

  const entropy = new Uint32Array(1);
  crypto.getRandomValues(entropy);
  let state = entropy[0] || 0x12345678;

  const origHMinus1 = origH - 1;
  const origWMinus1 = origW - 1;

  let destIdx = 0;
  const applyNoise = config.noiseIntensity > 0;

  for (let y = 0; y < destH; y++) {
    const dy = y + crop - cy;
    const startX = -cx + crop;
    
    let srcX = startX * invA + dy * invB + cx;
    let srcY = startX * invC + dy * invD + cy;

    for (let x = 0; x < destW; x++) {
      const ix = Math.floor(srcX);
      const iy = Math.floor(srcY);
      const px = srcX - ix;
      const py = srcY - iy;

      const wx0 = cubicWeight(px + 1);
      const wx1 = cubicWeight(px);
      const wx2 = cubicWeight(px - 1);
      const wx3 = cubicWeight(px - 2);

      const wy0 = cubicWeight(py + 1);
      const wy1 = cubicWeight(py);
      const wy2 = cubicWeight(py - 1);
      const wy3 = cubicWeight(py - 2);

      const ro0 = (iy - 1 < 0 ? 0 : iy - 1 > origHMinus1 ? origHMinus1 : iy - 1) * origW;
      const ro1 = (iy < 0 ? 0 : iy > origHMinus1 ? origHMinus1 : iy) * origW;
      const ro2 = (iy + 1 < 0 ? 0 : iy + 1 > origHMinus1 ? origHMinus1 : iy + 1) * origW;
      const ro3 = (iy + 2 < 0 ? 0 : iy + 2 > origHMinus1 ? origHMinus1 : iy + 2) * origW;

      const cx0 = ix - 1 < 0 ? 0 : ix - 1 > origWMinus1 ? origWMinus1 : ix - 1;
      const cx1 = ix < 0 ? 0 : ix > origWMinus1 ? origWMinus1 : ix;
      const cx2 = ix + 1 < 0 ? 0 : ix + 1 > origWMinus1 ? origWMinus1 : ix + 1;
      const cx3 = ix + 2 < 0 ? 0 : ix + 2 > origWMinus1 ? origWMinus1 : ix + 2;

      let r = 0, g = 0, b = 0, a_ch = 0;

      if (wy0 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro0 + cx0]; const w = wx0 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro0 + cx1]; const w = wx1 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro0 + cx2]; const w = wx2 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro0 + cx3]; const w = wx3 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
      }
      if (wy1 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro1 + cx0]; const w = wx0 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro1 + cx1]; const w = wx1 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro1 + cx2]; const w = wx2 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro1 + cx3]; const w = wx3 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
      }
      if (wy2 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro2 + cx0]; const w = wx0 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro2 + cx1]; const w = wx1 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro2 + cx2]; const w = wx2 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro2 + cx3]; const w = wx3 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
      }
      if (wy3 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro3 + cx0]; const w = wx0 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro3 + cx1]; const w = wx1 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro3 + cx2]; const w = wx2 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro3 + cx3]; const w = wx3 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a_ch += ((p >>> 24) & 0xFF) * w; }
      }

      let noise = 0;
      if (applyNoise) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        noise = ((state & 0xFF) % 5) - 2;
      }

      const fR = r + noise;
      const fG = g + noise;
      const fB = b + noise;

      const outR = fR < 0 ? 0 : fR >= 255.5 ? 255 : (fR + 0.5) | 0;
      const outG = fG < 0 ? 0 : fG >= 255.5 ? 255 : (fG + 0.5) | 0;
      const outB = fB < 0 ? 0 : fB >= 255.5 ? 255 : (fB + 0.5) | 0;
      const outA = hasAlpha ? (a_ch < 0 ? 0 : a_ch >= 255.5 ? 255 : (a_ch + 0.5) | 0) : 255;

      destData[destIdx++] = outR | (outG << 8) | (outB << 16) | (outA << 24);

      srcX += invA;
      srcY += invC;
    }
  }

  destCtx.putImageData(destImgData, 0, 0);
}
