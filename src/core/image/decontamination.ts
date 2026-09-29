/**
 * Anti-Steganography Deep Decontamination Pipeline
 *
 * Disrupts sub-perceptual spatial watermarks, UID markers, and carrier signals:
 * 1. Spatial Micro-Resampling: 99.5% downscale and 100% Catmull-Rom bicubic reconstruction.
 * 2. Hardware-Accelerated 3x3 Median Filter: WebGL fragment shader with deterministic CPU fallback.
 * 3. Visibility-Threshold Dithering: Deterministic discrete level modulation across RGB channels.
 */

// Catmull-Rom cubic weight calculation with alpha = -0.5
function cubicWeight(x: number): number {
  const absX = Math.abs(x);
  if (absX <= 1.0) {
    return 1.5 * absX * absX * absX - 2.5 * absX * absX + 1.0;
  } else if (absX < 2.0) {
    return -0.5 * absX * absX * absX + 2.5 * absX * absX - 4.0 * absX + 2.0;
  }
  return 0.0;
}

/**
 * Resamples an image buffer to original dimensions using 16-tap Catmull-Rom bicubic interpolation.
 */
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

  for (let y = 0; y < destH; y++) {
    const srcY = (y + 0.5) * scaleY - 0.5;
    const iy = Math.floor(srcY);
    const py = srcY - iy;

    const wy0 = cubicWeight(py + 1);
    const wy1 = cubicWeight(py);
    const wy2 = cubicWeight(py - 1);
    const wy3 = cubicWeight(py - 2);

    for (let x = 0; x < destW; x++) {
      const srcX = (x + 0.5) * scaleX - 0.5;
      const ix = Math.floor(srcX);
      const px = srcX - ix;

      const wx0 = cubicWeight(px + 1);
      const wx1 = cubicWeight(px);
      const wx2 = cubicWeight(px - 1);
      const wx3 = cubicWeight(px - 2);

      let r = 0, g = 0, b = 0, a = 0;

      for (let m = -1; m <= 2; m++) {
        let wy = 0;
        if (m === -1) wy = wy0;
        else if (m === 0) wy = wy1;
        else if (m === 1) wy = wy2;
        else wy = wy3;
        if (wy === 0) continue;

        let cy = iy + m;
        if (cy < 0) cy = 0;
        else if (cy >= srcH) cy = srcH - 1;
        const rowOffset = cy * srcW;

        for (let n = -1; n <= 2; n++) {
          let wx = 0;
          if (n === -1) wx = wx0;
          else if (n === 0) wx = wx1;
          else if (n === 1) wx = wx2;
          else wx = wx3;
          if (wx === 0) continue;

          let cx = ix + n;
          if (cx < 0) cx = 0;
          else if (cx >= srcW) cx = srcW - 1;

          const w = wx * wy;
          const pixel = srcData[rowOffset + cx];

          r += (pixel & 0xFF) * w;
          g += ((pixel >> 8) & 0xFF) * w;
          b += ((pixel >> 16) & 0xFF) * w;
          a += ((pixel >> 24) & 0xFF) * w;
        }
      }

      const outR = Math.min(255, Math.max(0, Math.round(r)));
      const outG = Math.min(255, Math.max(0, Math.round(g)));
      const outB = Math.min(255, Math.max(0, Math.round(b)));
      const outA = hasAlpha ? Math.min(255, Math.max(0, Math.round(a))) : 255;

      destData[y * destW + x] = outR | (outG << 8) | (outB << 16) | (outA << 24);
    }
  }
}

/**
 * Step 1: Spatial Micro-Resampling
 * Scales canvas to 99.5%, then resamples back to 100% via bicubic interpolation,
 * recalculating weighted pixel averages across the raster.
 */
export function applySpatialMicroResampling(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  hasAlpha: boolean = true
): void {
  const origW = canvas.width;
  const origH = canvas.height;
  if (origW < 4 || origH < 4) return;

  const downW = Math.max(2, Math.round(origW * 0.995));
  const downH = Math.max(2, Math.round(origH * 0.995));

  // 1. Downscale to 99.5%
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

  // 2. Resample back to original dimensions using bicubic interpolation
  const destCtx = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  const destImgData = destCtx.createImageData(origW, origH);
  const destData = new Uint32Array(destImgData.data.buffer);

  resampleBicubic(downData, downW, downH, destData, origW, origH, hasAlpha);
  destCtx.putImageData(destImgData, 0, 0);
}

/**
 * Insertion sort for 9 elements. Fast, deterministic, zero allocation.
 */
function sort9(arr: Uint8Array): void {
  for (let i = 1; i < 9; i++) {
    const val = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > val) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = val;
  }
}

/**
 * Deterministic CPU 3x3 Median Filter fallback.
 */
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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let idx = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = Math.min(height - 1, Math.max(0, y + dy));
        const row = ny * width;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const p = (row + nx) * 4;
          r[idx] = data[p];
          g[idx] = data[p + 1];
          b[idx] = data[p + 2];
          idx++;
        }
      }

      sort9(r);
      sort9(g);
      sort9(b);

      const outPos = (y * width + x) * 4;
      output[outPos] = r[4];
      output[outPos + 1] = g[4];
      output[outPos + 2] = b[4];
      // Keep alpha channel intact
    }
  }

  data.set(output);
}

/**
 * Step 2: Hardware-Accelerated 3x3 Median Filter
 * Uses WebGL fragment shader with fallback to CPU.
 */
export function applyMedianFilter3x3(
  canvas: HTMLCanvasElement | OffscreenCanvas
): void {
  const w = canvas.width;
  const h = canvas.height;
  if (w < 3 || h < 3) return;

  const ctx2d = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (!ctx2d) return;

  // Try WebGL path
  let glCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  let gl: WebGLRenderingContext | null = null;

  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      glCanvas = new OffscreenCanvas(w, h);
    } else {
      glCanvas = document.createElement('canvas');
      glCanvas.width = w;
      glCanvas.height = h;
    }
    gl = glCanvas.getContext('webgl') as WebGLRenderingContext | null;
  } catch {
    gl = null;
  }

  if (!gl) {
    // Transparent CPU fallback
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
        gl_FragColor = vec4(r[4], g[4], b[4], a);
      }
    `;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(uRes, w, h);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas as any);

    gl.viewport(0, 0, w, h);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    ctx2d.drawImage(glCanvas as any, 0, 0);
  } catch {
    // If WebGL pipeline fails at runtime, fallback to CPU
    const imgData = ctx2d.getImageData(0, 0, w, h);
    applyMedianFilterCpu(imgData.data, w, h);
    ctx2d.putImageData(imgData, 0, 0);
  }
}

/**
 * Step 3: Visibility-Threshold Dithering
 * Injects deterministic discrete level offsets in range [-2, 2] across RGB channels,
 * breaking steganographic parity checks while remaining imperceptible to the human eye.
 */
export function applyVisibilityDithering(
  data: Uint8ClampedArray | Uint8Array,
  seed: number = 0x5f3759df
): void {
  let state = seed || 0x12345678;

  for (let i = 0; i < data.length; i += 4) {
    // XorShift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;

    // Discrete offset in {-2, -1, 1, 2}
    const rSign = (state & 1) === 0 ? 1 : -1;
    const rMag = ((state >> 1) & 1) + 1;
    const rOffset = rSign * rMag;

    const gSign = ((state >> 2) & 1) === 0 ? 1 : -1;
    const gMag = ((state >> 3) & 1) + 1;
    const gOffset = gSign * gMag;

    const bSign = ((state >> 4) & 1) === 0 ? 1 : -1;
    const bMag = ((state >> 5) & 1) + 1;
    const bOffset = bSign * bMag;

    data[i] = Math.min(255, Math.max(0, data[i] + rOffset));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + gOffset));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bOffset));
  }
}

/**
 * Step 4: Forced YUV 4:2:0 Chroma Subsampling
 * Averages chroma (Cb, Cr) across 2x2 pixel blocks while preserving full-resolution Luma (Y),
 * destroying color-channel anchored steganographic payloads and PRNU carrier patterns.
 */
export function applyYuv420ChromaSubsampling(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  for (let by = 0; by < height; by += 2) {
    const hasNextRow = by + 1 < height;
    for (let bx = 0; bx < width; bx += 2) {
      const hasNextCol = bx + 1 < width;

      // 2x2 block pixel coordinates
      const coords: Array<[number, number]> = [[bx, by]];
      if (hasNextCol) coords.push([bx + 1, by]);
      if (hasNextRow) coords.push([bx, by + 1]);
      if (hasNextRow && hasNextCol) coords.push([bx + 1, by + 1]);

      let sumCb = 0;
      let sumCr = 0;
      const yValues: number[] = [];

      for (const [x, y] of coords) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Standard ITU-R BT.601 conversion
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

        yValues.push(luma);
        sumCb += cb;
        sumCr += cr;
      }

      const avgCb = sumCb / coords.length;
      const avgCr = sumCr / coords.length;

      // Reconstruct RGB for each pixel using individual Luma and block-averaged Chroma
      for (let i = 0; i < coords.length; i++) {
        const [x, y] = coords[i];
        const idx = (y * width + x) * 4;
        const luma = yValues[i];

        const cbShift = avgCb - 128;
        const crShift = avgCr - 128;

        const r = luma + 1.402 * crShift;
        const g = luma - 0.344136 * cbShift - 0.714136 * crShift;
        const b = luma + 1.772 * cbShift;

        data[idx] = Math.min(255, Math.max(0, Math.round(r)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
        data[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      }
    }
  }
}

/**
 * Executes the complete Deep Decontamination Pipeline on a canvas.
 */
export function applyDeepDecontamination(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  hasAlpha: boolean = true
): void {
  // 1. Spatial Micro-Resampling
  applySpatialMicroResampling(canvas, hasAlpha);

  // 2. Hardware-Accelerated 3x3 Median Filter
  applyMedianFilter3x3(canvas);

  // 3. Visibility-Threshold Dithering & YUV 4:2:0 Chroma Subsampling
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;

  if (ctx) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyYuv420ChromaSubsampling(imgData.data, canvas.width, canvas.height);
    applyVisibilityDithering(imgData.data);
    ctx.putImageData(imgData, 0, 0);
  }
}
