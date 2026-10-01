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
  const numPixels = data.length >> 2;
  const randWords = new Uint32Array(numPixels * 4);
  crypto.getRandomValues(randWords);

  let randIdx = 0;
  const TWO_PI = 2 * Math.PI;
  const INV_U32 = 1 / 4294967296;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const bChannel = data[i + 2];

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * bChannel;
    const sigma = Math.sqrt(a * luminance + b);

    // Box-Muller transform for R and G
    const u1 = (randWords[randIdx++] + 1) * INV_U32;
    const u2 = (randWords[randIdx++] + 1) * INV_U32;
    const mag1 = Math.sqrt(-2 * Math.log(u1));
    const zR = mag1 * Math.cos(TWO_PI * u2);
    const zG = mag1 * Math.sin(TWO_PI * u2);

    // Box-Muller transform for B
    const u3 = (randWords[randIdx++] + 1) * INV_U32;
    const u4 = (randWords[randIdx++] + 1) * INV_U32;
    const mag2 = Math.sqrt(-2 * Math.log(u3));
    const zB = mag2 * Math.cos(TWO_PI * u4);

    const newR = r + Math.round(zR * sigma);
    const newG = g + Math.round(zG * sigma);
    const newB = bChannel + Math.round(zB * sigma);

    data[i] = newR < 0 ? 0 : newR > 255 ? 255 : newR;
    data[i + 1] = newG < 0 ? 0 : newG > 255 ? 255 : newG;
    data[i + 2] = newB < 0 ? 0 : newB > 255 ? 255 : newB;
    // Alpha channel preserved
  }
}
