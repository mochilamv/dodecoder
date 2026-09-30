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

      // Unrolled 16-tap sampling
      if (wy0 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro0 + cx0]; const w = wx0 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro0 + cx1]; const w = wx1 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro0 + cx2]; const w = wx2 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro0 + cx3]; const w = wx3 * wy0; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
      }
      if (wy1 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro1 + cx0]; const w = wx0 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro1 + cx1]; const w = wx1 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro1 + cx2]; const w = wx2 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro1 + cx3]; const w = wx3 * wy1; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
      }
      if (wy2 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro2 + cx0]; const w = wx0 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro2 + cx1]; const w = wx1 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro2 + cx2]; const w = wx2 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro2 + cx3]; const w = wx3 * wy2; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
      }
      if (wy3 !== 0) {
        if (wx0 !== 0) { const p = srcData[ro3 + cx0]; const w = wx0 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx1 !== 0) { const p = srcData[ro3 + cx1]; const w = wx1 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx2 !== 0) { const p = srcData[ro3 + cx2]; const w = wx2 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
        if (wx3 !== 0) { const p = srcData[ro3 + cx3]; const w = wx3 * wy3; r += (p & 0xFF) * w; g += ((p >> 8) & 0xFF) * w; b += ((p >> 16) & 0xFF) * w; a += ((p >>> 24) & 0xFF) * w; }
      }

      const outR = r < 0 ? 0 : r >= 255.5 ? 255 : (r + 0.5) | 0;
      const outG = g < 0 ? 0 : g >= 255.5 ? 255 : (g + 0.5) | 0;
      const outB = b < 0 ? 0 : b >= 255.5 ? 255 : (b + 0.5) | 0;
      const outA = hasAlpha ? (a < 0 ? 0 : a >= 255.5 ? 255 : (a + 0.5) | 0) : 255;

      destData[destIdx++] = outR | (outG << 8) | (outB << 16) | (outA << 24);
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

      sort9(r);
      sort9(g);
      sort9(b);

      const outPos = (rowBase + x) << 2;
      output[outPos] = r[4];
      output[outPos + 1] = g[4];
      output[outPos + 2] = b[4];
    }
  }
  data.set(output);
}

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
    const imgData = ctx2d.getImageData(0, 0, w, h);
    applyMedianFilterCpu(imgData.data, w, h);
    ctx2d.putImageData(imgData, 0, 0);
  }
}

export function applyVisibilityDithering(
  data: Uint8ClampedArray | Uint8Array,
  seed: number = 0x5f3759df
): void {
  let state = seed || 0x12345678;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;

    const rSign = (state & 1) === 0 ? 1 : -1;
    const rMag = ((state >>> 1) & 1) + 1;
    const rOffset = rSign * rMag;

    const gSign = ((state >>> 2) & 1) === 0 ? 1 : -1;
    const gMag = ((state >>> 3) & 1) + 1;
    const gOffset = gSign * gMag;

    const bSign = ((state >>> 4) & 1) === 0 ? 1 : -1;
    const bMag = ((state >>> 5) & 1) + 1;
    const bOffset = bSign * bMag;

    let nr = data[i] + rOffset;
    let ng = data[i + 1] + gOffset;
    let nb = data[i + 2] + bOffset;

    data[i]     = nr < 0 ? 0 : nr > 255 ? 255 : nr;
    data[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
    data[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
  }
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
      let count = 1;

      const r0 = data[idx0];
      const g0 = data[idx0 + 1];
      const b0 = data[idx0 + 2];
      
      const y0 = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
      let sumCb = -0.168736 * r0 - 0.331264 * g0 + 0.5 * b0 + 128;
      let sumCr = 0.5 * r0 - 0.418688 * g0 - 0.081312 * b0 + 128;

      let y1 = 0, y2 = 0, y3 = 0;
      let idx1 = 0, idx2 = 0, idx3 = 0;

      if (hasNextCol) {
        idx1 = idx0 + 4;
        const r = data[idx1], g = data[idx1 + 1], b = data[idx1 + 2];
        y1 = 0.299 * r + 0.587 * g + 0.114 * b;
        sumCb += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        sumCr += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        count++;
      }
      if (hasNextRow) {
        idx2 = (rowOffset1 + bx) << 2;
        const r = data[idx2], g = data[idx2 + 1], b = data[idx2 + 2];
        y2 = 0.299 * r + 0.587 * g + 0.114 * b;
        sumCb += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        sumCr += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        count++;
      }
      if (hasNextRow && hasNextCol) {
        idx3 = idx2 + 4;
        const r = data[idx3], g = data[idx3 + 1], b = data[idx3 + 2];
        y3 = 0.299 * r + 0.587 * g + 0.114 * b;
        sumCb += -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        sumCr += 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        count++;
      }

      const cbShift = (sumCb / count) - 128;
      const crShift = (sumCr / count) - 128;

      data[idx0]     = y0 + 1.402 * crShift;
      data[idx0 + 1] = y0 - 0.344136 * cbShift - 0.714136 * crShift;
      data[idx0 + 2] = y0 + 1.772 * cbShift;

      if (hasNextCol) {
        data[idx1]     = y1 + 1.402 * crShift;
        data[idx1 + 1] = y1 - 0.344136 * cbShift - 0.714136 * crShift;
        data[idx1 + 2] = y1 + 1.772 * cbShift;
      }
      if (hasNextRow) {
        data[idx2]     = y2 + 1.402 * crShift;
        data[idx2 + 1] = y2 - 0.344136 * cbShift - 0.714136 * crShift;
        data[idx2 + 2] = y2 + 1.772 * cbShift;
      }
      if (hasNextRow && hasNextCol) {
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
  applySpatialMicroResampling(canvas, hasAlpha);
  applyMedianFilter3x3(canvas);
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
