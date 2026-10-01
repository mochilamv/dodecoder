export interface BiquadCoeffs {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export interface BiquadState {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export function createNotchCoeffs(f0: number, fs: number, q: number = 10): BiquadCoeffs {
  const w0 = (2 * Math.PI * f0) / fs;
  const alpha = Math.sin(w0) / (2 * q);
  const cosW0 = Math.cos(w0);

  const a0 = 1 + alpha;
  const b0 = 1 / a0;
  const b1 = (-2 * cosW0) / a0;
  const b2 = 1 / a0;
  const a1 = (-2 * cosW0) / a0;
  const a2 = (1 - alpha) / a0;

  return { b0, b1, b2, a1, a2 };
}

export function getEnfTargetFrequencies(sampleRate: number, maxFreq: number = 1200): number[] {
  const freqs = new Set<number>();
  const nyquist = sampleRate / 2;
  const limit = Math.min(nyquist * 0.95, maxFreq);

  for (let f = 50; f <= limit; f += 50) {
    freqs.add(f);
  }
  for (let f = 60; f <= limit; f += 60) {
    freqs.add(f);
  }

  return Array.from(freqs).sort((a, b) => a - b);
}

export function filterChannelInPlace(channel: Float32Array, sampleRate: number, maxFreq: number = 1200): void {
  const freqs = getEnfTargetFrequencies(sampleRate, maxFreq);
  const len = channel.length;

  for (const f0 of freqs) {
    const { b0, b1, b2, a1, a2 } = createNotchCoeffs(f0, sampleRate, 10);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    for (let i = 0; i < len; i++) {
      const x0 = channel[i];
      const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;

      channel[i] = y0;
    }
  }
}

export function applyEnfToAudioChannels(channels: Float32Array[], sampleRate: number): Float32Array[] {
  for (let ch = 0; ch < channels.length; ch++) {
    filterChannelInPlace(channels[ch], sampleRate);
  }
  return channels;
}
