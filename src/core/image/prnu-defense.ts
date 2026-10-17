export type DefenseLevel = 'standard' | 'hardened' | 'paranoid';
export type WaveletKernel = 'db4' | 'haar';

export interface PrnuTransformConfig {
  theta: number;
  sx: number;
  sy: number;
  noiseIntensity: number;
}

export interface PRNUDefenseMetrics {
  normalizedCrossCorrelation: number;
  psnrDb: number;
  ssim: number;
  residualNoiseRms: number;
}

export const MAX_TILE_DIMENSION = 2048;

const ACTIVE_TILE_SIZE = 512;
const TILE_HALO = 8;
const MAX_FILTER_LEN = 8;
const TRANSPOSE_BLOCK = 16;

const DB4_C0 = -0.010597401785;
const DB4_C1 = 0.032883011667;
const DB4_C2 = 0.030841381836;
const DB4_C3 = -0.187034811719;
const DB4_C4 = -0.027983769417;
const DB4_C5 = 0.630880767930;
const DB4_C6 = 0.714846570553;
const DB4_C7 = 0.230377813309;

// Quadrature mirror high-pass coefficients: Hi-D[k] = (-1)^k * Lo-D[7 - k]
const DB4_H0 = DB4_C7;
const DB4_H1 = -DB4_C6;
const DB4_H2 = DB4_C5;
const DB4_H3 = -DB4_C4;
const DB4_H4 = DB4_C3;
const DB4_H5 = -DB4_C2;
const DB4_H6 = DB4_C1;
const DB4_H7 = -DB4_C0;

const INV_SQRT2 = 0.7071067811865475;

interface WaveletTileWorkspace {
  readonly maxPatchW: number;
  readonly maxPatchH: number;
  readonly maxSubW: number;
  readonly maxSubH: number;
  readonly rowLo: Float32Array;
  readonly rowHi: Float32Array;
  readonly subBand0: Float32Array;
  readonly subBand1: Float32Array;
  readonly subScratch: Float32Array;
  readonly rowBuf1D: Float32Array;
  readonly ext1D: Float32Array;
  readonly colIn1D: Float32Array;
  readonly colLo1D: Float32Array;
  readonly colHi1D: Float32Array;
  readonly colOut1D: Float32Array;
}

function createWaveletTileWorkspace(maxPatchW: number, maxPatchH: number): WaveletTileWorkspace {
  if (
    maxPatchW <= 0 ||
    maxPatchH <= 0 ||
    maxPatchW > MAX_TILE_DIMENSION ||
    maxPatchH > MAX_TILE_DIMENSION
  ) {
    throw new RangeError('Tile dimension exceeds MAX_TILE_DIMENSION bounds.');
  }

  const maxSubW = ((maxPatchW + 1) >> 1) + MAX_FILTER_LEN;
  const maxSubH = ((maxPatchH + 1) >> 1) + MAX_FILTER_LEN;
  // Extra tail padding (MAX_FILTER_LEN) allows branchless unrolled 8-tap convolution
  const max1DExt = Math.max(maxPatchW, maxPatchH) + MAX_FILTER_LEN * 3 + 2;
  const maxSubLen = Math.max(maxSubW, maxSubH);
  const subArea = maxSubW * maxSubH;
  const maxDim = Math.max(maxPatchW, maxPatchH);

  return {
    maxPatchW,
    maxPatchH,
    maxSubW,
    maxSubH,
    rowLo: new Float32Array(maxPatchH * maxSubW),
    rowHi: new Float32Array(maxPatchH * maxSubW),
    subBand0: new Float32Array(subArea),
    subBand1: new Float32Array(subArea),
    subScratch: new Float32Array(subArea),
    rowBuf1D: new Float32Array(maxDim),
    ext1D: new Float32Array(max1DExt),
    colIn1D: new Float32Array(maxPatchH),
    colLo1D: new Float32Array(maxSubLen),
    colHi1D: new Float32Array(maxSubLen),
    colOut1D: new Float32Array(maxPatchH),
  };
}

function zeroWaveletTileWorkspace(ws: WaveletTileWorkspace): void {
  ws.rowLo.fill(0);
  ws.rowHi.fill(0);
  ws.subBand0.fill(0);
  ws.subBand1.fill(0);
  ws.subScratch.fill(0);
  ws.rowBuf1D.fill(0);
  ws.ext1D.fill(0);
  ws.colIn1D.fill(0);
  ws.colLo1D.fill(0);
  ws.colHi1D.fill(0);
  ws.colOut1D.fill(0);
}

function fillSecureRandomUint32(buf: Uint32Array): void {
  const safeView = new Uint32Array(
    buf.buffer as ArrayBuffer,
    buf.byteOffset,
    buf.length
  );
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(safeView);
  } else {
    let seed = 0x9e3779b9;
    for (let i = 0; i < safeView.length; i++) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      safeView[i] = seed >>> 0;
    }
  }
}

function reflectIndex(idx: number, length: number): number {
  if (length <= 1) return 0;
  const period = length << 1;
  let k = idx % period;
  if (k < 0) k += period;
  return k < length ? k : period - 1 - k;
}

function clamp8(v: number): number {
  return (v & ~(v >> 31) | ((255 - v) >> 31)) & 255;
}

function dwt1D(
  input: Float32Array,
  inputOffset: number,
  length: number,
  useHaar: boolean,
  extScratch: Float32Array,
  outLo: Float32Array,
  outLoOffset: number,
  outHi: Float32Array,
  outHiOffset: number
): number {
  const fLen = useHaar ? 2 : 8;
  const padLeft = fLen;
  const padRight = fLen + (length & 1);
  const extLen = length + padLeft + padRight;
  const subLen = extLen >> 1;

  for (let i = 0; i < padLeft; i++) {
    extScratch[i] = input[inputOffset + reflectIndex(i - padLeft, length)];
  }
  for (let i = 0; i < length; i++) {
    extScratch[padLeft + i] = input[inputOffset + i];
  }
  for (let i = 0; i < padRight; i++) {
    extScratch[padLeft + length + i] = input[inputOffset + reflectIndex(length + i, length)];
  }

  if (useHaar) {
    for (let m = 0; m < subLen; m++) {
      const base = m << 1;
      const s0 = extScratch[base];
      const s1 = extScratch[base + 1];
      outLo[outLoOffset + m] = (s0 + s1) * INV_SQRT2;
      outHi[outHiOffset + m] = (s0 - s1) * INV_SQRT2;
    }
    return subLen;
  }

  // Copy 6 wrapped lookahead samples so the 8-tap loop executes with zero branches
  for (let w = 0; w < 6; w++) {
    extScratch[extLen + w] = extScratch[w];
  }

  for (let m = 0; m < subLen; m++) {
    const base = m << 1;
    const s0 = extScratch[base];
    const s1 = extScratch[base + 1];
    const s2 = extScratch[base + 2];
    const s3 = extScratch[base + 3];
    const s4 = extScratch[base + 4];
    const s5 = extScratch[base + 5];
    const s6 = extScratch[base + 6];
    const s7 = extScratch[base + 7];

    outLo[outLoOffset + m] =
      DB4_C0 * s0 +
      DB4_C1 * s1 +
      DB4_C2 * s2 +
      DB4_C3 * s3 +
      DB4_C4 * s4 +
      DB4_C5 * s5 +
      DB4_C6 * s6 +
      DB4_C7 * s7;

    outHi[outHiOffset + m] =
      DB4_H0 * s0 +
      DB4_H1 * s1 +
      DB4_H2 * s2 +
      DB4_H3 * s3 +
      DB4_H4 * s4 +
      DB4_H5 * s5 +
      DB4_H6 * s6 +
      DB4_H7 * s7;
  }

  return subLen;
}

function idwt1D(
  inLo: Float32Array,
  inLoOffset: number,
  inHi: Float32Array,
  inHiOffset: number,
  length: number,
  useHaar: boolean,
  extScratch: Float32Array,
  output: Float32Array,
  outputOffset: number
): void {
  const fLen = useHaar ? 2 : 8;
  const padLeft = fLen;
  const padRight = fLen + (length & 1);
  const extLen = length + padLeft + padRight;
  const subLen = extLen >> 1;

  if (useHaar) {
    for (let i = 0; i < extLen; i++) {
      extScratch[i] = 0.0;
    }
    for (let m = 0; m < subLen; m++) {
      const a = inLo[inLoOffset + m];
      const d = inHi[inHiOffset + m];
      const base = m << 1;
      extScratch[base] += (a + d) * INV_SQRT2;
      extScratch[base + 1] += (a - d) * INV_SQRT2;
    }
    for (let i = 0; i < length; i++) {
      output[outputOffset + i] = extScratch[i + padLeft];
    }
    return;
  }

  const clearLen = extLen + 6;
  for (let i = 0; i < clearLen; i++) {
    extScratch[i] = 0.0;
  }

  // Dual synthesis identity: loR[7 - k] = loD[k], hiR[7 - k] = hiD[k]
  for (let m = 0; m < subLen; m++) {
    const a = inLo[inLoOffset + m];
    const d = inHi[inHiOffset + m];
    const base = m << 1;
    extScratch[base] += a * DB4_C0 + d * DB4_H0;
    extScratch[base + 1] += a * DB4_C1 + d * DB4_H1;
    extScratch[base + 2] += a * DB4_C2 + d * DB4_H2;
    extScratch[base + 3] += a * DB4_C3 + d * DB4_H3;
    extScratch[base + 4] += a * DB4_C4 + d * DB4_H4;
    extScratch[base + 5] += a * DB4_C5 + d * DB4_H5;
    extScratch[base + 6] += a * DB4_C6 + d * DB4_H6;
    extScratch[base + 7] += a * DB4_C7 + d * DB4_H7;
  }

  for (let i = 0; i < length; i++) {
    output[outputOffset + i] = extScratch[i + padLeft];
  }
}

function quickselectMedian(arr: Float32Array, count: number): number {
  if (count <= 0) return 0.0;
  if (count === 1) return arr[0];

  const kTarget = count >> 1;
  let left = 0;
  let right = count - 1;

  while (left < right) {
    const mid = (left + right) >> 1;
    if (arr[mid] < arr[left]) {
      const t = arr[left];
      arr[left] = arr[mid];
      arr[mid] = t;
    }
    if (arr[right] < arr[left]) {
      const t = arr[left];
      arr[left] = arr[right];
      arr[right] = t;
    }
    if (arr[right] < arr[mid]) {
      const t = arr[mid];
      arr[mid] = arr[right];
      arr[right] = t;
    }

    const pivot = arr[mid];
    let lt = left;
    let gt = right;
    let i = left;

    while (i <= gt) {
      const val = arr[i];
      if (val < pivot) {
        arr[i] = arr[lt];
        arr[lt] = val;
        lt++;
        i++;
      } else if (val > pivot) {
        arr[i] = arr[gt];
        arr[gt] = val;
        gt--;
      } else {
        i++;
      }
    }

    if (kTarget < lt) {
      right = lt - 1;
    } else if (kTarget > gt) {
      left = gt + 1;
    } else {
      return pivot;
    }
  }

  return arr[left];
}

function estimateNoiseSigmaFromHH(
  subHH: Float32Array,
  subW: number,
  subH: number,
  madScratch: Float32Array
): number {
  const count = subW * subH;
  if (count <= 0) return 0.0;

  let sumAbs = 0.0;
  for (let i = 0; i < count; i++) {
    const v = subHH[i];
    const absV = v < 0.0 ? -v : v;
    madScratch[i] = absV;
    sumAbs += absV;
  }

  const medianAbs = quickselectMedian(madScratch, count);
  const madSigma = medianAbs / 0.6745;
  if (madSigma > 1e-5) {
    return madSigma;
  }

  return (sumAbs / count) * 0.5;
}

function reflectSubbandCoord(idx: number, limit: number): number {
  let r = idx;
  if (r < 0) r = -r;
  else if (r >= limit) r = limit - 1 - (r - limit);
  return r < 0 ? 0 : r;
}

function applySubbandWiener5x5(
  subband: Float32Array,
  subW: number,
  subH: number,
  sigmaNSq: number,
  hSumScratch: Float32Array
): { sumOrigPost: number; sumOrigSq: number; sumPostSq: number } {
  // Pass 1: separable 5-tap horizontal sum of squared coefficients
  for (let y = 0; y < subH; y++) {
    const rowOff = y * subW;
    if (subW >= 5) {
      const c0 = subband[rowOff];
      const c1 = subband[rowOff + 1];
      const c2 = subband[rowOff + 2];
      const c3 = subband[rowOff + 3];
      const s0 = c0 * c0;
      const s1 = c1 * c1;
      const s2 = c2 * c2;
      const s3 = c3 * c3;

      hSumScratch[rowOff] = s2 + s1 + s0 + s1 + s2;
      hSumScratch[rowOff + 1] = s1 + s0 + s1 + s2 + s3;

      let prev2 = s0;
      let prev1 = s1;
      let curr = s2;
      let next1 = s3;

      const limit = subW - 2;
      for (let x = 2; x < limit; x++) {
        const cn = subband[rowOff + x + 2];
        const next2 = cn * cn;
        hSumScratch[rowOff + x] = prev2 + prev1 + curr + next1 + next2;
        prev2 = prev1;
        prev1 = curr;
        curr = next1;
        next1 = next2;
      }

      // Mirror reflections at right boundary (x = subW - 2 and x = subW - 1)
      hSumScratch[rowOff + subW - 2] = prev2 + prev1 + curr + next1 + next1;
      hSumScratch[rowOff + subW - 1] = prev1 + curr + next1 + curr + prev1;
    } else {
      for (let x = 0; x < subW; x++) {
        let sum = 0.0;
        for (let dx = -2; dx <= 2; dx++) {
          const nx = reflectSubbandCoord(x + dx, subW);
          const v = subband[rowOff + nx];
          sum += v * v;
        }
        hSumScratch[rowOff + x] = sum;
      }
    }
  }

  // Pass 2: vertical 5-row sum with precomputed row offsets and zero inner-loop branches
  let sumOrigPost = 0.0;
  let sumOrigSq = 0.0;
  let sumPostSq = 0.0;
  const invWindowArea = 0.04;

  for (let y = 0; y < subH; y++) {
    const r0 = reflectSubbandCoord(y - 2, subH) * subW;
    const r1 = reflectSubbandCoord(y - 1, subH) * subW;
    const r2 = y * subW;
    const r3 = reflectSubbandCoord(y + 1, subH) * subW;
    const r4 = reflectSubbandCoord(y + 2, subH) * subW;

    for (let x = 0; x < subW; x++) {
      const winSumSq =
        hSumScratch[r0 + x] +
        hSumScratch[r1 + x] +
        hSumScratch[r2 + x] +
        hSumScratch[r3 + x] +
        hSumScratch[r4 + x];

      const sigmaLSq = winSumSq * invWindowArea;
      const idx = r2 + x;
      const origC = subband[idx];
      const numer = sigmaLSq - sigmaNSq;
      const denom = sigmaLSq > 1e-6 ? sigmaLSq : 1e-6;
      const gain = numer > 0.0 ? numer / denom : 0.0;
      const postC = origC * gain;

      subband[idx] = postC;
      sumOrigPost += origC * postC;
      sumOrigSq += origC * origC;
      sumPostSq += postC * postC;
    }
  }

  return { sumOrigPost, sumOrigSq, sumPostSq };
}

function forwardColumnDwtBlocked(
  rowMat: Float32Array,
  maxSubW: number,
  patchH: number,
  subW: number,
  useHaar: boolean,
  ws: WaveletTileWorkspace,
  outLoSub: Float32Array,
  outHiSub: Float32Array
): number {
  let subH = 0;
  for (let sxBase = 0; sxBase < subW; sxBase += TRANSPOSE_BLOCK) {
    const sxLimit = Math.min(subW, sxBase + TRANSPOSE_BLOCK);
    for (let sx = sxBase; sx < sxLimit; sx++) {
      for (let py = 0; py < patchH; py++) {
        ws.colIn1D[py] = rowMat[py * maxSubW + sx];
      }
      subH = dwt1D(
        ws.colIn1D,
        0,
        patchH,
        useHaar,
        ws.ext1D,
        ws.colLo1D,
        0,
        ws.colHi1D,
        0
      );
      for (let sy = 0; sy < subH; sy++) {
        const subIdx = sy * subW + sx;
        outLoSub[subIdx] = ws.colLo1D[sy];
        outHiSub[subIdx] = ws.colHi1D[sy];
      }
    }
  }
  return subH;
}

function inverseColumnIdwtBlocked(
  inLoSub: Float32Array,
  inHiSub: Float32Array,
  subW: number,
  subH: number,
  patchH: number,
  maxSubW: number,
  useHaar: boolean,
  ws: WaveletTileWorkspace,
  rowMatOut: Float32Array
): void {
  for (let sxBase = 0; sxBase < subW; sxBase += TRANSPOSE_BLOCK) {
    const sxLimit = Math.min(subW, sxBase + TRANSPOSE_BLOCK);
    for (let sx = sxBase; sx < sxLimit; sx++) {
      for (let sy = 0; sy < subH; sy++) {
        const subIdx = sy * subW + sx;
        ws.colLo1D[sy] = inLoSub[subIdx];
        ws.colHi1D[sy] = inHiSub[subIdx];
      }
      idwt1D(
        ws.colLo1D,
        0,
        ws.colHi1D,
        0,
        patchH,
        useHaar,
        ws.ext1D,
        ws.colOut1D,
        0
      );
      for (let py = 0; py < patchH; py++) {
        rowMatOut[py * maxSubW + sx] = ws.colOut1D[py];
      }
    }
  }
}

function applyBicubicMicroAffine(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  thetaRad: number,
  sx: number,
  sy: number,
  hasAlpha: boolean
): void {
  if (width > MAX_TILE_DIMENSION || height > MAX_TILE_DIMENSION) {
    throw new RangeError(`Tile dimension (${width}x${height}) exceeds MAX_TILE_DIMENSION bounds.`);
  }

  const cosT = Math.cos(thetaRad);
  const sinT = Math.sin(thetaRad);

  const invSx = 1.0 / (sx !== 0.0 ? sx : 1.0);
  const invSy = 1.0 / (sy !== 0.0 ? sy : 1.0);

  const m00 = cosT * invSx;
  const m01 = sinT * invSx;
  const m10 = -sinT * invSy;
  const m11 = cosT * invSy;

  const cx = (width - 1) * 0.5;
  const cy = (height - 1) * 0.5;
  const maxX = width - 1;
  const maxY = height - 1;

  // Maximum backward vertical lookbehind is bounded by |m10|*cx + |m11 - 1|*cy + 4 rows
  const maxBackY = Math.ceil(Math.abs(m10) * cx + Math.abs(m11 - 1.0) * cy) + 6;
  let ringRows = 16;
  while (ringRows < maxBackY) {
    ringRows <<= 1;
  }
  if (ringRows > MAX_TILE_DIMENSION) {
    ringRows = MAX_TILE_DIMENSION;
  }
  const ringMask = ringRows - 1;
  const rowStride = width << 2;
  const ringBuf = new Uint8Array(ringRows * rowStride);

  try {
    for (let y = 0; y < height; y++) {
      // Save untouched row y into circular ring buffer before modifying row y in-place
      const srcRowByteOffset = y * rowStride;
      const ringSlotOffset = (y & ringMask) * rowStride;
      ringBuf.set(data.subarray(srcRowByteOffset, srcRowByteOffset + rowStride), ringSlotOffset);

      const dy = y - cy;
      const baseSrcX = cx + m01 * dy - m00 * cx;
      const baseSrcY = cy + m11 * dy - m10 * cx;

      for (let x = 0; x < width; x++) {
        const srcX = baseSrcX + m00 * x;
        const srcY = baseSrcY + m10 * x;

        const ix = Math.floor(srcX);
        const iy = Math.floor(srcY);
        const fx = srcX - ix;
        const fy = srcY - iy;

        // Keys cubic kernel (a = -0.5) polynomials evaluated via Horner's method for t in [0, 1)
        const wx0 = fx * (-0.5 + fx * (1.0 - 0.5 * fx));
        const wx1 = 1.0 + fx * fx * (1.5 * fx - 2.5);
        const wx2 = fx * (0.5 + fx * (2.0 - 1.5 * fx));
        const wx3 = 0.5 * fx * fx * (fx - 1.0);

        const wy0 = fy * (-0.5 + fy * (1.0 - 0.5 * fy));
        const wy1 = 1.0 + fy * fy * (1.5 * fy - 2.5);
        const wy2 = fy * (0.5 + fy * (2.0 - 1.5 * fy));
        const wy3 = 0.5 * fy * fy * (fy - 1.0);

        let x0 = ix - 1;
        let x1 = ix;
        let x2 = ix + 1;
        let x3 = ix + 2;
        if (x0 < 0) x0 = 0; else if (x0 > maxX) x0 = maxX;
        if (x1 < 0) x1 = 0; else if (x1 > maxX) x1 = maxX;
        if (x2 < 0) x2 = 0; else if (x2 > maxX) x2 = maxX;
        if (x3 < 0) x3 = 0; else if (x3 > maxX) x3 = maxX;

        const o0 = x0 << 2;
        const o1 = x1 << 2;
        const o2 = x2 << 2;
        const o3 = x3 << 2;

        let rAcc = 0.0;
        let gAcc = 0.0;
        let bAcc = 0.0;
        let aAcc = 0.0;

        for (let j = 0; j < 4; j++) {
          let syIdx = iy - 1 + j;
          if (syIdx < 0) syIdx = 0;
          else if (syIdx > maxY) syIdx = maxY;

          const wyJ = j === 0 ? wy0 : j === 1 ? wy1 : j === 2 ? wy2 : wy3;
          // Rows <= y are read from the unmodified ring buffer; rows > y are still unmodified in data
          const useRing = syIdx <= y && y - syIdx < ringRows;
          const srcBuf = useRing ? ringBuf : data;
          const rowOff = useRing ? (syIdx & ringMask) * rowStride : syIdx * rowStride;

          const p0 = rowOff + o0;
          const p1 = rowOff + o1;
          const p2 = rowOff + o2;
          const p3 = rowOff + o3;

          rAcc += wyJ * (srcBuf[p0] * wx0 + srcBuf[p1] * wx1 + srcBuf[p2] * wx2 + srcBuf[p3] * wx3);
          gAcc += wyJ * (srcBuf[p0 + 1] * wx0 + srcBuf[p1 + 1] * wx1 + srcBuf[p2 + 1] * wx2 + srcBuf[p3 + 1] * wx3);
          bAcc += wyJ * (srcBuf[p0 + 2] * wx0 + srcBuf[p1 + 2] * wx1 + srcBuf[p2 + 2] * wx2 + srcBuf[p3 + 2] * wx3);
          if (hasAlpha) {
            aAcc += wyJ * (srcBuf[p0 + 3] * wx0 + srcBuf[p1 + 3] * wx1 + srcBuf[p2 + 3] * wx2 + srcBuf[p3 + 3] * wx3);
          }
        }

        const dstIdx = srcRowByteOffset + (x << 2);
        data[dstIdx] = clamp8((rAcc + 0.5) | 0);
        data[dstIdx + 1] = clamp8((gAcc + 0.5) | 0);
        data[dstIdx + 2] = clamp8((bAcc + 0.5) | 0);
        data[dstIdx + 3] = hasAlpha ? clamp8((aAcc + 0.5) | 0) : 255;
      }
    }
  } finally {
    ringBuf.fill(0);
  }
}

function injectStochasticCamouflageNoise(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  noiseIntensity: number,
  hasAlpha: boolean
): void {
  if (noiseIntensity <= 0.0) return;

  const rngChunk = new Uint32Array(new ArrayBuffer(1024 * 4), 0, 1024);
  const clampedIntensity = noiseIntensity > 2.2 ? 2.2 : noiseIntensity;
  const invMaxUint32 = 1.0 / 4294967295.0;

  try {
    const totalPixels = width * height;
    let rngCursor = rngChunk.length;

    for (let p = 0; p < totalPixels; p++) {
      if (rngCursor + 2 >= rngChunk.length) {
        fillSecureRandomUint32(rngChunk);
        rngCursor = 0;
      }

      const u1 = rngChunk[rngCursor++] * invMaxUint32;
      const u2 = rngChunk[rngCursor++] * invMaxUint32;
      const delta = (u1 - u2) * clampedIntensity;

      const idx = p << 2;
      data[idx] = clamp8((data[idx] + delta + 0.5) | 0);
      data[idx + 1] = clamp8((data[idx + 1] + delta + 0.5) | 0);
      data[idx + 2] = clamp8((data[idx + 2] + delta + 0.5) | 0);
      if (!hasAlpha) {
        data[idx + 3] = 255;
      }
    }
  } finally {
    rngChunk.fill(0);
  }
}

export function calculateAntiPrnuConfig(
  level: DefenseLevel,
  skipNoise = false
): PrnuTransformConfig {
  if (level === 'standard') {
    return {
      theta: 0,
      sx: 1.0,
      sy: 1.0,
      noiseIntensity: 0,
    };
  }

  const rngBuf = new Uint32Array(new ArrayBuffer(16), 0, 4);

  try {
    fillSecureRandomUint32(rngBuf);

    const invMax = 1.0 / 4294967295.0;
    const u0 = rngBuf[0] * invMax;
    const u1 = rngBuf[1] * invMax;
    const u2 = rngBuf[2] * invMax;
    const u3 = rngBuf[3] * invMax;

    const noiseIntensity = skipNoise ? 0 : 2;

    const thetaDeg = 0.1 + u0 * 0.2;
    const signTheta = u3 >= 0.5 ? 1.0 : -1.0;
    const theta = (signTheta * thetaDeg * Math.PI) / 180.0;

    const sx = 0.995 + u1 * 0.004;
    let sy = 0.995 + u2 * 0.004;
    const diff = sx - sy;
    if ((diff < 0.0 ? -diff : diff) < 0.0005) {
      sy = sx < 0.997 ? sx + 0.0006 : sx - 0.0006;
    }

    return {
      theta,
      sx,
      sy,
      noiseIntensity,
    };
  } finally {
    rngBuf.fill(0);
  }
}

export function applyWaveletPRNUAttenuation(
  data: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  kernel: WaveletKernel = 'db4',
  strength = 1.0
): PRNUDefenseMetrics {
  if (width <= 0 || height <= 0 || data.length === 0) {
    return {
      normalizedCrossCorrelation: 0,
      psnrDb: 100,
      ssim: 1,
      residualNoiseRms: 0,
    };
  }

  const totalPixels = width * height;
  const stride =
    data.length >= totalPixels * 4
      ? 4
      : data.length >= totalPixels * 3
        ? 3
        : 1;

  const useHaar = kernel === 'haar';
  const effStrength = strength < 0.0 ? 0.0 : strength;

  const maxActiveTileW = Math.min(width, ACTIVE_TILE_SIZE);
  const maxActiveTileH = Math.min(height, ACTIVE_TILE_SIZE);
  const maxPatchW = Math.min(maxActiveTileW + TILE_HALO * 2, MAX_TILE_DIMENSION);
  const maxPatchH = Math.min(maxActiveTileH + TILE_HALO * 2, MAX_TILE_DIMENSION);

  const ws = createWaveletTileWorkspace(maxPatchW, maxPatchH);

  try {
    let totalSquaredError = 0.0;
    let totalSamples = 0;
    let totalResidualSq = 0.0;

    let nccSumXY = 0.0;
    let nccSumX2 = 0.0;
    let nccSumY2 = 0.0;

    let ssimAccum = 0.0;
    let ssimWindows = 0;

    // Bounding luma delta to 1.45 guarantees integer channel delta <= 1, so unmasked PSNR >= 48.13 dB and SSIM >= 0.98
    const maxDeltaLuma = 1.45;

    for (let tileY = 0; tileY < height; tileY += ACTIVE_TILE_SIZE) {
      const activeH = Math.min(ACTIVE_TILE_SIZE, height - tileY);
      const haloTop = Math.min(TILE_HALO, tileY);
      const haloBottom = Math.min(TILE_HALO, height - (tileY + activeH));
      const patchH = activeH + haloTop + haloBottom;
      const patchStartY = tileY - haloTop;

      for (let tileX = 0; tileX < width; tileX += ACTIVE_TILE_SIZE) {
        const activeW = Math.min(ACTIVE_TILE_SIZE, width - tileX);
        const haloLeft = Math.min(TILE_HALO, tileX);
        const haloRight = Math.min(TILE_HALO, width - (tileX + activeW));
        const patchW = activeW + haloLeft + haloRight;
        const patchStartX = tileX - haloLeft;

        // 1. Fused row luma extraction + Forward 1D row DWT
        let subW = 0;
        for (let py = 0; py < patchH; py++) {
          const imgY = patchStartY + py;
          const imgRowBase = imgY * width * stride;

          if (stride >= 3) {
            for (let px = 0; px < patchW; px++) {
              const pIdx = imgRowBase + (patchStartX + px) * stride;
              ws.rowBuf1D[px] =
                0.299 * data[pIdx] +
                0.587 * data[pIdx + 1] +
                0.114 * data[pIdx + 2];
            }
          } else {
            for (let px = 0; px < patchW; px++) {
              ws.rowBuf1D[px] = data[imgRowBase + patchStartX + px];
            }
          }

          const outOff = py * ws.maxSubW;
          subW = dwt1D(
            ws.rowBuf1D,
            0,
            patchW,
            useHaar,
            ws.ext1D,
            ws.rowLo,
            outOff,
            ws.rowHi,
            outOff
          );
        }

        // 2. High-pass column branch: rowHi -> subBand0 (HL) and subBand1 (HH)
        const subH = forwardColumnDwtBlocked(
          ws.rowHi,
          ws.maxSubW,
          patchH,
          subW,
          useHaar,
          ws,
          ws.subBand0,
          ws.subBand1
        );

        const rawSigmaN = estimateNoiseSigmaFromHH(
          ws.subBand1,
          subW,
          subH,
          ws.subScratch
        );
        const effectiveSigma = rawSigmaN * effStrength;
        const sigmaNSq = effectiveSigma * effectiveSigma;

        if (sigmaNSq > 0.0) {
          const statsHL = applySubbandWiener5x5(
            ws.subBand0,
            subW,
            subH,
            sigmaNSq,
            ws.subScratch
          );
          const statsHH = applySubbandWiener5x5(
            ws.subBand1,
            subW,
            subH,
            sigmaNSq,
            ws.subScratch
          );
          nccSumXY += statsHL.sumOrigPost + statsHH.sumOrigPost;
          nccSumX2 += statsHL.sumOrigSq + statsHH.sumOrigSq;
          nccSumY2 += statsHL.sumPostSq + statsHH.sumPostSq;
        }

        // Synthesize filtered HL and HH back into rowHi before reusing subBand0/subBand1
        inverseColumnIdwtBlocked(
          ws.subBand0,
          ws.subBand1,
          subW,
          subH,
          patchH,
          ws.maxSubW,
          useHaar,
          ws,
          ws.rowHi
        );

        // 3. Low-pass column branch: rowLo -> subBand0 (LL) and subBand1 (LH)
        forwardColumnDwtBlocked(
          ws.rowLo,
          ws.maxSubW,
          patchH,
          subW,
          useHaar,
          ws,
          ws.subBand0,
          ws.subBand1
        );

        if (sigmaNSq > 0.0) {
          const statsLH = applySubbandWiener5x5(
            ws.subBand1,
            subW,
            subH,
            sigmaNSq,
            ws.subScratch
          );
          nccSumXY += statsLH.sumOrigPost;
          nccSumX2 += statsLH.sumOrigSq;
          nccSumY2 += statsLH.sumPostSq;
        }

        // Synthesize untouched LL and filtered LH back into rowLo
        inverseColumnIdwtBlocked(
          ws.subBand0,
          ws.subBand1,
          subW,
          subH,
          patchH,
          ws.maxSubW,
          useHaar,
          ws,
          ws.rowLo
        );

        // 4. Fused row IDWT + bounded luma update + shifted single-pass SSIM accumulation
        const activeCount = activeW * activeH;
        let sumX = 0.0;
        let sumY = 0.0;
        let sumDx2 = 0.0;
        let sumDy2 = 0.0;
        let sumDxDy = 0.0;
        let refLuma = 0.0;
        let refInitialized = false;

        for (let ay = 0; ay < activeH; ay++) {
          const py = haloTop + ay;
          const inOff = py * ws.maxSubW;
          idwt1D(
            ws.rowLo,
            inOff,
            ws.rowHi,
            inOff,
            patchW,
            useHaar,
            ws.ext1D,
            ws.rowBuf1D,
            0
          );

          const imgY = tileY + ay;
          const imgRow = imgY * width * stride;

          for (let ax = 0; ax < activeW; ax++) {
            const reconY = ws.rowBuf1D[haloLeft + ax];
            const idx = imgRow + (tileX + ax) * stride;

            let origY: number;
            let postY: number;

            if (stride >= 3) {
              const r0 = data[idx];
              const g0 = data[idx + 1];
              const b0 = data[idx + 2];
              origY = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;

              let deltaY = reconY - origY;
              if (deltaY > maxDeltaLuma) deltaY = maxDeltaLuma;
              else if (deltaY < -maxDeltaLuma) deltaY = -maxDeltaLuma;

              const r1 = clamp8((r0 + deltaY + 0.5) | 0);
              const g1 = clamp8((g0 + deltaY + 0.5) | 0);
              const b1 = clamp8((b0 + deltaY + 0.5) | 0);

              data[idx] = r1;
              data[idx + 1] = g1;
              data[idx + 2] = b1;

              const dr = r1 - r0;
              const dg = g1 - g0;
              const db = b1 - b0;
              totalSquaredError += dr * dr + dg * dg + db * db;
              totalSamples += 3;

              postY = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
            } else {
              const y0 = data[idx];
              origY = y0;

              let deltaY = reconY - origY;
              if (deltaY > maxDeltaLuma) deltaY = maxDeltaLuma;
              else if (deltaY < -maxDeltaLuma) deltaY = -maxDeltaLuma;

              const y1 = clamp8((y0 + deltaY + 0.5) | 0);
              data[idx] = y1;

              const dy = y1 - y0;
              totalSquaredError += dy * dy;
              totalSamples += 1;

              postY = y1;
            }

            const actualDeltaY = postY - origY;
            totalResidualSq += actualDeltaY * actualDeltaY;

            if (!refInitialized) {
              refLuma = origY;
              refInitialized = true;
            }
            const dx = origY - refLuma;
            const dy = postY - refLuma;
            sumX += dx;
            sumY += dy;
            sumDx2 += dx * dx;
            sumDy2 += dy * dy;
            sumDxDy += dx * dy;
          }
        }

        if (activeCount > 0) {
          const invN = 1.0 / activeCount;
          const meanDx = sumX * invN;
          const meanDy = sumY * invN;
          const muX = refLuma + meanDx;
          const muY = refLuma + meanDy;
          const varX = Math.max(0.0, sumDx2 * invN - meanDx * meanDx);
          const varY = Math.max(0.0, sumDy2 * invN - meanDy * meanDy);
          const covXY = sumDxDy * invN - meanDx * meanDy;

          const c1 = 6.5025;
          const c2 = 58.5225;
          const ssimNumer = (2.0 * muX * muY + c1) * (2.0 * covXY + c2);
          const ssimDenom = (muX * muX + muY * muY + c1) * (varX + varY + c2);
          ssimAccum += ssimDenom > 0.0 ? ssimNumer / ssimDenom : 1.0;
          ssimWindows++;
        }
      }
    }

    const mse = totalSamples > 0 ? totalSquaredError / totalSamples : 0.0;
    const psnrDb =
      mse <= 1e-9
        ? 99.99
        : 10.0 * Math.log10((255.0 * 255.0) / mse);

    const rawSsim = ssimWindows > 0 ? ssimAccum / ssimWindows : 1.0;
    const ssim = Math.min(1.0, rawSsim);

    const residualNoiseRms = Math.sqrt(totalResidualSq / totalPixels);

    const nccDenom = Math.sqrt(nccSumX2 * nccSumY2);
    const normalizedCrossCorrelation =
      nccDenom > 1e-9 ? Math.max(0.0, Math.min(1.0, nccSumXY / nccDenom)) : 0.0;

    return {
      normalizedCrossCorrelation,
      psnrDb,
      ssim,
      residualNoiseRms,
    };
  } finally {
    zeroWaveletTileWorkspace(ws);
  }
}

export function applyPrnuDefense(
  sourceImage: ImageBitmap | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement | OffscreenCanvas,
  level: DefenseLevel,
  hasAlpha = true,
  skipNoise = false
): void {
  const width = sourceImage.width;
  const height = sourceImage.height;
  if (width <= 0 || height <= 0) {
    return;
  }

  if (targetCanvas.width !== width) {
    targetCanvas.width = width;
  }
  if (targetCanvas.height !== height) {
    targetCanvas.height = height;
  }

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true, alpha: hasAlpha }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (!ctx) {
    throw new Error('Failed to acquire 2D rendering context on targetCanvas.');
  }

  if (level === 'standard') {
    ctx.drawImage(sourceImage, 0, 0);
    return;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(sourceImage, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  let committed = false;

  try {
    const config = calculateAntiPrnuConfig(level, skipNoise);

    applyBicubicMicroAffine(
      pixels,
      width,
      height,
      config.theta,
      config.sx,
      config.sy,
      hasAlpha
    );

    const waveletKernel: WaveletKernel = 'db4';
    const waveletStrength = level === 'paranoid' ? 1.25 : 1.0;

    applyWaveletPRNUAttenuation(
      pixels,
      width,
      height,
      waveletKernel,
      waveletStrength
    );

    if (!skipNoise && config.noiseIntensity > 0) {
      injectStochasticCamouflageNoise(
        pixels,
        width,
        height,
        config.noiseIntensity,
        hasAlpha
      );
    } else if (!hasAlpha) {
      const totalBytes = width * height * 4;
      for (let i = 3; i < totalBytes; i += 4) {
        pixels[i] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    committed = true;
  } finally {
    if (!committed) {
      pixels.fill(0);
    }
  }
}
