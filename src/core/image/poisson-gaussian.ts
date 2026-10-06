export const DEFAULT_SHOT_NOISE_GAIN = 0.02;
export const DEFAULT_READ_NOISE_FLOOR = 1.0;

export function calculatePoissonGaussianSigma(
  luminance: number,
  a: number = DEFAULT_SHOT_NOISE_GAIN,
  b: number = DEFAULT_READ_NOISE_FLOOR
): number {
  const variance = a * Math.max(0, luminance) + b;
  return Math.sqrt(variance);
}

export function computePixelLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function applyPoissonGaussianNoise(
  data: Uint8ClampedArray | Uint8Array,
  a: number = DEFAULT_SHOT_NOISE_GAIN,
  b: number = DEFAULT_READ_NOISE_FLOOR
): void {
  const TWO_PI = 2 * Math.PI;
  const INV_U32 = 1 / 4294967296;
  const randWords = new Uint32Array(16384);
  let randIdx = 16384; 

  function nextU32(): number {
    if (randIdx >= 16384) {
      crypto.getRandomValues(randWords);
      randIdx = 0;
    }
    return randWords[randIdx++];
  }

  const limit = data.length - 7;
  let i = 0;
  for (; i < limit; i += 8) {
    const r1 = data[i], g1 = data[i + 1], b1 = data[i + 2];
    const r2 = data[i + 4], g2 = data[i + 5], b2 = data[i + 6];

    const u1 = (nextU32() + 1) * INV_U32;
    const u2 = (nextU32() + 1) * INV_U32;
    const u3 = (nextU32() + 1) * INV_U32;
    const u4 = (nextU32() + 1) * INV_U32;
    const u5 = (nextU32() + 1) * INV_U32;
    const u6 = (nextU32() + 1) * INV_U32;

    const mag1 = Math.sqrt(-2 * Math.log(u1));
    const mag2 = Math.sqrt(-2 * Math.log(u3));
    const mag3 = Math.sqrt(-2 * Math.log(u5));

    const zR1 = mag1 * Math.cos(TWO_PI * u2);
    const zG1 = mag1 * Math.sin(TWO_PI * u2);

    const zB1 = mag2 * Math.cos(TWO_PI * u4);
    const zR2 = mag2 * Math.sin(TWO_PI * u4);

    const zG2 = mag3 * Math.cos(TWO_PI * u6);
    const zB2 = mag3 * Math.sin(TWO_PI * u6);

    const s1 = Math.sqrt(a * (0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1) + b);
    const s2 = Math.sqrt(a * (0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2) + b);

    const nr1 = r1 + Math.round(zR1 * s1);
    const ng1 = g1 + Math.round(zG1 * s1);
    const nb1 = b1 + Math.round(zB1 * s1);
    data[i]     = nr1 < 0 ? 0 : (nr1 > 255 ? 255 : nr1);
    data[i + 1] = ng1 < 0 ? 0 : (ng1 > 255 ? 255 : ng1);
    data[i + 2] = nb1 < 0 ? 0 : (nb1 > 255 ? 255 : nb1);

    const nr2 = r2 + Math.round(zR2 * s2);
    const ng2 = g2 + Math.round(zG2 * s2);
    const nb2 = b2 + Math.round(zB2 * s2);
    data[i + 4] = nr2 < 0 ? 0 : (nr2 > 255 ? 255 : nr2);
    data[i + 5] = ng2 < 0 ? 0 : (ng2 > 255 ? 255 : ng2);
    data[i + 6] = nb2 < 0 ? 0 : (nb2 > 255 ? 255 : nb2);
  }

  if (i < data.length) {
    const r = data[i], g = data[i + 1], bChannel = data[i + 2];
    const u1 = (nextU32() + 1) * INV_U32;
    const u2 = (nextU32() + 1) * INV_U32;
    const u3 = (nextU32() + 1) * INV_U32;
    const u4 = (nextU32() + 1) * INV_U32;
    const mag1 = Math.sqrt(-2 * Math.log(u1));
    const mag2 = Math.sqrt(-2 * Math.log(u3));
    const zR = mag1 * Math.cos(TWO_PI * u2);
    const zG = mag1 * Math.sin(TWO_PI * u2);
    const zB = mag2 * Math.cos(TWO_PI * u4);
    const s = Math.sqrt(a * (0.2126 * r + 0.7152 * g + 0.0722 * bChannel) + b);
    const nr = r + Math.round(zR * s);
    const ng = g + Math.round(zG * s);
    const nb = bChannel + Math.round(zB * s);
    data[i]     = nr < 0 ? 0 : (nr > 255 ? 255 : nr);
    data[i + 1] = ng < 0 ? 0 : (ng > 255 ? 255 : ng);
    data[i + 2] = nb < 0 ? 0 : (nb > 255 ? 255 : nb);
  }
}
