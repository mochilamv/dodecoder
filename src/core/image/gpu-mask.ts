import { applyPoissonGaussianNoise } from './poisson-gaussian';

export function applyGpuBitwiseMask(data: Uint8ClampedArray): void {
  applyPoissonGaussianNoise(data);
}

export function injectCryptoNoise(data: Uint8ClampedArray): void {
  applyPoissonGaussianNoise(data);
}

export function applyAntiGpuFingerprint(data: Uint8ClampedArray): void {
  applyPoissonGaussianNoise(data);
}
