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
  
  const numStages = freqs.length;
  const b0 = new Float64Array(numStages);
  const b1 = new Float64Array(numStages);
  const b2 = new Float64Array(numStages);
  const a1 = new Float64Array(numStages);
  const a2 = new Float64Array(numStages);
  const x1 = new Float64Array(numStages);
  const x2 = new Float64Array(numStages);
  const y1 = new Float64Array(numStages);
  const y2 = new Float64Array(numStages);

  for (let s = 0; s < numStages; s++) {
    const coeffs = createNotchCoeffs(freqs[s], sampleRate, 10);
    b0[s] = coeffs.b0;
    b1[s] = coeffs.b1;
    b2[s] = coeffs.b2;
    a1[s] = coeffs.a1;
    a2[s] = coeffs.a2;
  }

  for (let i = 0; i < len; i++) {
    let val = channel[i];
    for (let s = 0; s < numStages; s++) {
      const y0 = b0[s] * val + b1[s] * x1[s] + b2[s] * x2[s] - a1[s] * y1[s] - a2[s] * y2[s];
      x2[s] = x1[s];
      x1[s] = val;
      y2[s] = y1[s];
      y1[s] = y0;
      val = y0;
    }
    channel[i] = val;
  }
}

export function applyEnfToAudioChannels(channels: Float32Array[], sampleRate: number): Float32Array[] {
  for (let ch = 0; ch < channels.length; ch++) {
    filterChannelInPlace(channels[ch], sampleRate);
  }
  return channels;
}
