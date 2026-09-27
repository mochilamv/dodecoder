import { DefenseLevel } from '../types';

export interface PrnuTransformConfig {
  theta: number; // radians
  sx: number;
  sy: number;
  noiseIntensity: number;
}

export function calculateAntiPrnuConfig(
  level: DefenseLevel
): PrnuTransformConfig {
  if (level === 'standard') {
    return { theta: 0, sx: 1.0, sy: 1.0, noiseIntensity: 0 };
  }

  const seed = new Uint32Array(3);
  crypto.getRandomValues(seed);

  // Rotation theta in [0.1, 0.3] degrees, randomized sign
  const thetaDeg = 0.1 + (seed[0] / 0xFFFFFFFF) * 0.2;
  const sign = (seed[0] % 2 === 0) ? 1 : -1;
  const theta = sign * (thetaDeg * Math.PI) / 180.0;

  // Anisotropic scaling |sx - sy| >= 0.0005
  // sx in [0.995, 0.999]
  const sx = 0.995 + (seed[1] / 0xFFFFFFFF) * 0.004;
  let sy = 0.995 + (seed[2] / 0xFFFFFFFF) * 0.004;
  
  if (Math.abs(sx - sy) < 0.0005) {
      sy = sx < 0.997 ? sx + 0.0006 : sx - 0.0006;
  }

  return { theta, sx, sy, noiseIntensity: 2 };
}

// Fast Catmull-Rom weight calculation (alpha = -0.5)
function cubicWeight(x: number): number {
  const absX = Math.abs(x);
  if (absX <= 1.0) {
    return 1.5 * absX * absX * absX - 2.5 * absX * absX + 1.0;
  } else if (absX < 2.0) {
    return -0.5 * absX * absX * absX + 2.5 * absX * absX - 4.0 * absX + 2.0;
  }
  return 0.0;
}

export function applyPrnuDefense(
  sourceImage: ImageBitmap | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement | OffscreenCanvas,
  level: DefenseLevel,
  hasAlpha: boolean = true
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

  const config = calculateAntiPrnuConfig(level);

  // We need the source data. Render to an offscreen canvas.
  const srcCanvas = new OffscreenCanvas(origW, origH);
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
  srcCtx.drawImage(sourceImage, 0, 0);
  const srcImgData = srcCtx.getImageData(0, 0, origW, origH);
  const srcData = new Uint32Array(srcImgData.data.buffer); // 32-bit access for speed (ABGR)

  // Crop slightly to hide boundaries rotated inwards
  const crop = 3;
  const destW = origW - crop * 2;
  const destH = origH - crop * 2;

  targetCanvas.width = destW;
  targetCanvas.height = destH;
  const destCtx = targetCanvas.getContext('2d', { willReadFrequently: true, alpha: hasAlpha }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const destImgData = destCtx.createImageData(destW, destH);
  const destData = new Uint32Array(destImgData.data.buffer);

  // Affine Matrix
  const cosT = Math.cos(config.theta);
  const sinT = Math.sin(config.theta);
  
  // Forward matrix: [sx*cosT, -sy*sinT; sx*sinT, sy*cosT]
  const a = config.sx * cosT;
  const b = -config.sy * sinT;
  const c = config.sx * sinT;
  const d = config.sy * cosT;
  
  // Inverse matrix
  const det = a * d - b * c;
  const invA = d / det;
  const invB = -b / det;
  const invC = -c / det;
  const invD = a / det;

  const cx = origW / 2.0;
  const cy = origH / 2.0;

  // Dithering setup
  const entropy = new Uint32Array(1);
  crypto.getRandomValues(entropy);
  let state = entropy[0] || 0x12345678;

  // Fast Bicubic Interpolation with DDA
  for (let y = 0; y < destH; y++) {
    // Center offset y
    const dy = y + crop - cy;
    
    // Constant terms for this scanline
    const startX = -cx + crop;
    let srcX = startX * invA + dy * invB + cx;
    let srcY = startX * invC + dy * invD + cy;

    for (let x = 0; x < destW; x++) {
      // 1. Get integer coordinates and fractional parts
      const ix = Math.floor(srcX);
      const iy = Math.floor(srcY);
      const px = srcX - ix;
      const py = srcY - iy;

      // 2. Precalculate weights
      const wx0 = cubicWeight(px + 1);
      const wx1 = cubicWeight(px);
      const wx2 = cubicWeight(px - 1);
      const wx3 = cubicWeight(px - 2);

      const wy0 = cubicWeight(py + 1);
      const wy1 = cubicWeight(py);
      const wy2 = cubicWeight(py - 1);
      const wy3 = cubicWeight(py - 2);

      let r = 0, g = 0, b = 0, a_ch = 0;

      // 3. 16-tap sampling (4x4)
      for (let m = -1; m <= 2; m++) {
        let wy = 0;
        if (m === -1) wy = wy0;
        else if (m === 0) wy = wy1;
        else if (m === 1) wy = wy2;
        else wy = wy3;
        if (wy === 0) continue;

        let cy_idx = iy + m;
        if (cy_idx < 0) cy_idx = 0;
        else if (cy_idx >= origH) cy_idx = origH - 1;
        
        const rowOffset = cy_idx * origW;

        for (let n = -1; n <= 2; n++) {
          let wx = 0;
          if (n === -1) wx = wx0;
          else if (n === 0) wx = wx1;
          else if (n === 1) wx = wx2;
          else wx = wx3;
          if (wx === 0) continue;

          let cx_idx = ix + n;
          if (cx_idx < 0) cx_idx = 0;
          else if (cx_idx >= origW) cx_idx = origW - 1;

          const w = wx * wy;
          const pixel = srcData[rowOffset + cx_idx];
          
          // Little-endian ABGR: [R, G, B, A] in memory means:
          // byte 0: R, byte 1: G, byte 2: B, byte 3: A
          r += (pixel & 0xFF) * w;
          g += ((pixel >> 8) & 0xFF) * w;
          b += ((pixel >> 16) & 0xFF) * w;
          a_ch += ((pixel >> 24) & 0xFF) * w;
        }
      }

      // XorShift32 for dithering
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const noise = ((state & 0xFF) % 5) - 2; // [-2, 2]

      // Clamp and write
      const outR = Math.min(255, Math.max(0, r + noise));
      const outG = Math.min(255, Math.max(0, g + noise));
      const outB = Math.min(255, Math.max(0, b + noise));
      const outA = hasAlpha ? Math.min(255, Math.max(0, a_ch)) : 255;

      destData[y * destW + x] = outR | (outG << 8) | (outB << 16) | (outA << 24);

      // Advance DDA
      srcX += invA;
      srcY += invC;
    }
  }

  destCtx.putImageData(destImgData, 0, 0);
}
