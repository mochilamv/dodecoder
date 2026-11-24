import test from 'node:test';
import assert from 'node:assert/strict';

interface GlCall {
  method: string;
  args: unknown[];
}

function createRecordingWebGLFake(options?: {
  failVertexCompile?: boolean;
  failFragmentCompile?: boolean;
  failLink?: boolean;
  throwOnDraw?: boolean;
}) {
  const calls: GlCall[] = [];
  const createdTextures: object[] = [];
  const deletedTextures: object[] = [];
  const createdBuffers: object[] = [];
  const deletedBuffers: object[] = [];
  const createdShaders: object[] = [];
  const deletedShaders: object[] = [];
  const createdPrograms: object[] = [];
  const deletedPrograms: object[] = [];
  const createdFramebuffers: object[] = [];
  const deletedFramebuffers: object[] = [];
  let loseContextCalled = 0;

  const gl: Record<string, unknown> = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TEXTURE_2D: 0x0de1,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    CLAMP_TO_EDGE: 0x812f,
    NEAREST: 0x2600,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    TRIANGLES: 0x0004,
    FRAMEBUFFER: 0x8d40,
    COLOR_BUFFER_BIT: 0x4000,
    NONE: 0,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
    UNPACK_COLORSPACE_CONVERSION_WEBGL: 0x9243,

    createShader(type: number) {
      const s = { kind: 'shader', type };
      createdShaders.push(s);
      calls.push({ method: 'createShader', args: [type] });
      return s;
    },
    shaderSource(shader: object, src: string) {
      calls.push({ method: 'shaderSource', args: [shader, src] });
    },
    compileShader(shader: object) {
      calls.push({ method: 'compileShader', args: [shader] });
    },
    getShaderParameter(shader: { type?: number }, pname: number) {
      calls.push({ method: 'getShaderParameter', args: [shader, pname] });
      if (pname === 0x8b81) {
        if (options?.failVertexCompile && shader.type === 0x8b31) return false;
        if (options?.failFragmentCompile && shader.type === 0x8b30) return false;
        return true;
      }
      return true;
    },
    getShaderInfoLog(shader: object) {
      calls.push({ method: 'getShaderInfoLog', args: [shader] });
      return 'mock shader compile error';
    },
    createProgram() {
      const p = { kind: 'program' };
      createdPrograms.push(p);
      calls.push({ method: 'createProgram', args: [] });
      return p;
    },
    attachShader(program: object, shader: object) {
      calls.push({ method: 'attachShader', args: [program, shader] });
    },
    detachShader(program: object, shader: object) {
      calls.push({ method: 'detachShader', args: [program, shader] });
    },
    linkProgram(program: object) {
      calls.push({ method: 'linkProgram', args: [program] });
    },
    getProgramParameter(program: object, pname: number) {
      calls.push({ method: 'getProgramParameter', args: [program, pname] });
      if (pname === 0x8b82 && options?.failLink) return false;
      return true;
    },
    getProgramInfoLog(program: object) {
      calls.push({ method: 'getProgramInfoLog', args: [program] });
      return 'mock program link error';
    },
    useProgram(program: object | null) {
      calls.push({ method: 'useProgram', args: [program] });
    },
    createBuffer() {
      const b = { kind: 'buffer' };
      createdBuffers.push(b);
      calls.push({ method: 'createBuffer', args: [] });
      return b;
    },
    bindBuffer(target: number, buffer: object | null) {
      calls.push({ method: 'bindBuffer', args: [target, buffer] });
    },
    bufferData(target: number, data: unknown, usage: number) {
      calls.push({ method: 'bufferData', args: [target, data, usage] });
    },
    getAttribLocation(program: object, name: string) {
      calls.push({ method: 'getAttribLocation', args: [program, name] });
      return 0;
    },
    enableVertexAttribArray(loc: number) {
      calls.push({ method: 'enableVertexAttribArray', args: [loc] });
    },
    vertexAttribPointer(...args: unknown[]) {
      calls.push({ method: 'vertexAttribPointer', args });
    },
    getUniformLocation(program: object, name: string) {
      calls.push({ method: 'getUniformLocation', args: [program, name] });
      return { name };
    },
    uniform2f(...args: unknown[]) {
      calls.push({ method: 'uniform2f', args });
    },
    uniform1i(...args: unknown[]) {
      calls.push({ method: 'uniform1i', args });
    },
    createTexture() {
      const t = { kind: 'texture' };
      createdTextures.push(t);
      calls.push({ method: 'createTexture', args: [] });
      return t;
    },
    bindTexture(target: number, texture: object | null) {
      calls.push({ method: 'bindTexture', args: [target, texture] });
    },
    texParameteri(...args: unknown[]) {
      calls.push({ method: 'texParameteri', args });
    },
    pixelStorei(pname: number, param: number | boolean) {
      calls.push({ method: 'pixelStorei', args: [pname, param] });
    },
    texImage2D(...args: unknown[]) {
      calls.push({ method: 'texImage2D', args });
    },
    createFramebuffer() {
      const fb = { kind: 'framebuffer' };
      createdFramebuffers.push(fb);
      calls.push({ method: 'createFramebuffer', args: [] });
      return fb;
    },
    bindFramebuffer(target: number, fb: object | null) {
      calls.push({ method: 'bindFramebuffer', args: [target, fb] });
    },
    clearColor(...args: unknown[]) {
      calls.push({ method: 'clearColor', args });
    },
    clear(mask: number) {
      calls.push({ method: 'clear', args: [mask] });
    },
    viewport(...args: unknown[]) {
      calls.push({ method: 'viewport', args });
    },
    drawArrays(...args: unknown[]) {
      calls.push({ method: 'drawArrays', args });
      if (options?.throwOnDraw) throw new Error('MOCK_GL_DRAW_FAIL');
    },
    deleteTexture(t: object | null) {
      if (t) deletedTextures.push(t);
      calls.push({ method: 'deleteTexture', args: [t] });
    },
    deleteBuffer(b: object | null) {
      if (b) deletedBuffers.push(b);
      calls.push({ method: 'deleteBuffer', args: [b] });
    },
    deleteProgram(p: object | null) {
      if (p) deletedPrograms.push(p);
      calls.push({ method: 'deleteProgram', args: [p] });
    },
    deleteShader(s: object | null) {
      if (s) deletedShaders.push(s);
      calls.push({ method: 'deleteShader', args: [s] });
    },
    deleteFramebuffer(fb: object | null) {
      if (fb) deletedFramebuffers.push(fb);
      calls.push({ method: 'deleteFramebuffer', args: [fb] });
    },
    getExtension(name: string) {
      calls.push({ method: 'getExtension', args: [name] });
      if (name === 'WEBGL_lose_context') {
        return {
          loseContext() {
            loseContextCalled++;
            calls.push({ method: 'WEBGL_lose_context.loseContext', args: [] });
          },
        };
      }
      return null;
    },
  };

  return {
    gl,
    calls,
    createdTextures,
    deletedTextures,
    createdBuffers,
    deletedBuffers,
    createdShaders,
    deletedShaders,
    createdPrograms,
    deletedPrograms,
    createdFramebuffers,
    deletedFramebuffers,
    getLoseContextCalls: () => loseContextCalled,
  };
}

test('AUD-01 [MOCK-CONTRACT]: WebGL median sets explicit pixelStorei, checks shader/link status, and frees all GPU resources', async () => {
  const { applyMedianFilter3x3 } = await import('../src/core/image/decontamination');

  const fakeGl = createRecordingWebGLFake();
  let capturedContextAttrs: Record<string, unknown> | undefined;
  let createdOffscreen: { width: number; height: number } | null = null;
  const ctx2dCalls: string[] = [];

  const origOffscreen = (globalThis as Record<string, unknown>).OffscreenCanvas;
  (globalThis as Record<string, unknown>).OffscreenCanvas = class MockOffscreenCanvas {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      createdOffscreen = this;
    }
    getContext(kind: string, attrs?: Record<string, unknown>) {
      if (kind === 'webgl') {
        capturedContextAttrs = attrs;
        return fakeGl.gl;
      }
      return null;
    }
  };

  const pixels = new Uint8ClampedArray(8 * 8 * 4).fill(128);
  const fakeSourceCanvas = {
    width: 8,
    height: 8,
    getContext(kind: string) {
      if (kind !== '2d') return null;
      return {
        getImageData: () => ({ data: pixels, width: 8, height: 8 }),
        putImageData: () => {
          ctx2dCalls.push('putImageData');
        },
        clearRect: () => {
          ctx2dCalls.push('clearRect');
        },
        drawImage: () => {
          ctx2dCalls.push('drawImage');
        },
      };
    },
  };

  try {
    applyMedianFilter3x3(fakeSourceCanvas as unknown as HTMLCanvasElement);

    // Context attributes must disable premultiplied alpha explicitly
    assert.ok(capturedContextAttrs, 'webgl context must receive explicit attributes');
    assert.equal(capturedContextAttrs.premultipliedAlpha, false, 'premultipliedAlpha must be false');

    // Canvas source honors pixelStorei: flip-Y, premultiply-alpha, colorspace conversion must be explicit before texImage2D
    const pixelStoreCalls = fakeGl.calls.filter(c => c.method === 'pixelStorei');
    const texImageIdx = fakeGl.calls.findIndex(c => c.method === 'texImage2D');
    assert.ok(texImageIdx > 0, 'texImage2D must be called');
    assert.ok(
      pixelStoreCalls.some(c => c.args[0] === 0x9240 && (c.args[1] === true || c.args[1] === 1)),
      'UNPACK_FLIP_Y_WEBGL must be explicitly enabled for canvas texture uploads'
    );
    assert.ok(
      pixelStoreCalls.some(c => c.args[0] === 0x9241 && (c.args[1] === false || c.args[1] === 0)),
      'UNPACK_PREMULTIPLY_ALPHA_WEBGL must be explicitly false'
    );
    assert.ok(
      pixelStoreCalls.some(c => c.args[0] === 0x9243 && c.args[1] === 0),
      'UNPACK_COLORSPACE_CONVERSION_WEBGL must be explicitly NONE'
    );
    for (let i = 0; i < fakeGl.calls.length; i++) {
      if (fakeGl.calls[i].method === 'pixelStorei') {
        assert.ok(i < texImageIdx, 'pixelStorei must precede texImage2D');
      }
    }

    // Shader compile and program link status checks must run
    const shaderChecks = fakeGl.calls.filter(c => c.method === 'getShaderParameter');
    const linkChecks = fakeGl.calls.filter(c => c.method === 'getProgramParameter');
    assert.equal(shaderChecks.length, 2, 'Both vertex and fragment COMPILE_STATUS must be checked');
    assert.equal(linkChecks.length, 1, 'Program LINK_STATUS must be checked');

    // All allocated GPU resources must be deleted and context lost
    assert.equal(fakeGl.deletedTextures.length, fakeGl.createdTextures.length);
    assert.ok(fakeGl.createdTextures.length >= 1);
    assert.equal(fakeGl.deletedBuffers.length, fakeGl.createdBuffers.length);
    assert.ok(fakeGl.createdBuffers.length >= 1);
    assert.equal(fakeGl.deletedShaders.length, fakeGl.createdShaders.length);
    assert.equal(fakeGl.createdShaders.length, 2);
    assert.equal(fakeGl.deletedPrograms.length, fakeGl.createdPrograms.length);
    assert.equal(fakeGl.createdPrograms.length, 1);
    assert.equal(fakeGl.deletedFramebuffers.length, fakeGl.createdFramebuffers.length);
    assert.equal(fakeGl.getLoseContextCalls(), 1, 'WEBGL_lose_context.loseContext() must be called once');

    // Offscreen canvas dimensions must be reset to 0
    assert.ok(createdOffscreen, 'OffscreenCanvas must be created');
    assert.equal((createdOffscreen as { width: number; height: number }).width, 0);
    assert.equal((createdOffscreen as { width: number; height: number }).height, 0);

    // 2D target must clear before drawImage to avoid double alpha compositing
    assert.deepEqual(ctx2dCalls, ['clearRect', 'drawImage']);
  } finally {
    if (origOffscreen === undefined) {
      delete (globalThis as Record<string, unknown>).OffscreenCanvas;
    } else {
      (globalThis as Record<string, unknown>).OffscreenCanvas = origOffscreen;
    }
  }
});

test('AUD-01 [MOCK-CONTRACT]: WebGL compile/link/draw failures clean up GPU resources and fall back to CPU median', async () => {
  const { applyMedianFilter3x3 } = await import('../src/core/image/decontamination');

  const scenarios: Array<{
    name: string;
    opts: Parameters<typeof createRecordingWebGLFake>[0];
  }> = [
    { name: 'vertex shader compile error', opts: { failVertexCompile: true } },
    { name: 'fragment shader compile error', opts: { failFragmentCompile: true } },
    { name: 'program link error', opts: { failLink: true } },
    { name: 'drawArrays throw', opts: { throwOnDraw: true } },
  ];

  const origOffscreen = (globalThis as Record<string, unknown>).OffscreenCanvas;

  try {
    for (const sc of scenarios) {
      const fakeGl = createRecordingWebGLFake(sc.opts);
      let createdOffscreen: { width: number; height: number } | null = null;
      let putImageDataCalls = 0;

      (globalThis as Record<string, unknown>).OffscreenCanvas = class MockOffscreenCanvas {
        width: number;
        height: number;
        constructor(w: number, h: number) {
          this.width = w;
          this.height = h;
          createdOffscreen = this;
        }
        getContext(kind: string) {
          return kind === 'webgl' ? fakeGl.gl : null;
        }
      };

      const pixels = new Uint8ClampedArray(3 * 3 * 4);
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = 40;
        pixels[i + 1] = 40;
        pixels[i + 2] = 40;
        pixels[i + 3] = 255;
      }
      // Inject center spike to confirm CPU fallback actually executes
      const center = (1 * 3 + 1) * 4;
      pixels[center] = 250;
      pixels[center + 1] = 250;
      pixels[center + 2] = 250;

      const fakeCanvas = {
        width: 3,
        height: 3,
        getContext(kind: string) {
          if (kind !== '2d') return null;
          return {
            getImageData: () => ({ data: pixels, width: 3, height: 3 }),
            putImageData: () => {
              putImageDataCalls++;
            },
            clearRect: () => {},
            drawImage: () => {
              assert.fail(`drawImage must not run on ${sc.name}`);
            },
          };
        },
      };

      applyMedianFilter3x3(fakeCanvas as unknown as HTMLCanvasElement, false);

      assert.equal(putImageDataCalls, 1, `CPU fallback putImageData must run on ${sc.name}`);
      assert.equal(pixels[center], 40, `CPU median fallback must remove impulse on ${sc.name}`);
      assert.equal(fakeGl.deletedTextures.length, fakeGl.createdTextures.length, `textures freed on ${sc.name}`);
      assert.equal(fakeGl.deletedBuffers.length, fakeGl.createdBuffers.length, `buffers freed on ${sc.name}`);
      assert.equal(fakeGl.deletedShaders.length, fakeGl.createdShaders.length, `shaders freed on ${sc.name}`);
      assert.equal(fakeGl.deletedPrograms.length, fakeGl.createdPrograms.length, `programs freed on ${sc.name}`);
      assert.equal(fakeGl.deletedFramebuffers.length, fakeGl.createdFramebuffers.length, `framebuffers freed on ${sc.name}`);
      assert.equal(fakeGl.getLoseContextCalls(), 1, `loseContext called on ${sc.name}`);
      assert.equal((createdOffscreen as { width: number; height: number } | null)?.width, 0);
      assert.equal((createdOffscreen as { width: number; height: number } | null)?.height, 0);
    }
  } finally {
    if (origOffscreen === undefined) {
      delete (globalThis as Record<string, unknown>).OffscreenCanvas;
    } else {
      (globalThis as Record<string, unknown>).OffscreenCanvas = origOffscreen;
    }
  }
});

test('AUD-01 [NODE-VERIFIED CPU / BROWSER-UNVERIFIED WebGL]: asymmetric orientation self-test pattern preserves top-left marker and detects Y-flip', async () => {
  const {
    applyMedianFilterCpu,
    createMedianOrientationTestPattern,
    verifyMedianOrientationTestPattern,
  } = await import('../src/core/image/decontamination');

  const w = 8;
  const h = 8;
  const pattern = createMedianOrientationTestPattern(w, h);
  applyMedianFilterCpu(pattern, w, h);

  const checkOk = verifyMedianOrientationTestPattern(pattern, w, h);
  assert.equal(checkOk.ok, true, 'CPU median must preserve asymmetric quadrant orientation');
  assert.deepEqual(checkOk.topLeft, [255, 0, 0, 255]);

  // Simulate vertical flip and assert verifier catches it
  const flipped = new Uint8ClampedArray(pattern.length);
  const rowBytes = w * 4;
  for (let y = 0; y < h; y++) {
    const srcOff = y * rowBytes;
    const dstOff = (h - 1 - y) * rowBytes;
    flipped.set(pattern.subarray(srcOff, srcOff + rowBytes), dstOff);
  }
  const checkFlipped = verifyMedianOrientationTestPattern(flipped, w, h);
  assert.equal(checkFlipped.ok, false, 'Verifier must reject vertically flipped output');
  assert.match(checkFlipped.failureReason || '', /Vertical flip/i);
});

interface ParsedRiffChunk {
  fourCC: string;
  size: number;
  offset: number;
  payload: Uint8Array;
  padByte: number | null;
}

function walkStrictWebpRiff(bytes: Uint8Array): {
  riffSize: number;
  chunks: ParsedRiffChunk[];
  endOffset: number;
} {
  assert.ok(bytes.length >= 12, 'WebP must be at least 12 bytes');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  assert.equal(riff, 'RIFF', 'Missing RIFF signature');
  assert.equal(webp, 'WEBP', 'Missing WEBP signature');

  const riffSize = dv.getUint32(4, true);
  assert.equal(riffSize % 2, 0, 'RIFF size must be even');
  assert.equal(riffSize + 8, bytes.length, 'RIFF size + 8 must equal exact output byte length');

  const chunks: ParsedRiffChunk[] = [];
  let pos = 12;
  while (pos < bytes.length) {
    assert.ok(pos + 8 <= bytes.length, `Truncated chunk header at offset ${pos}`);
    const fourCC = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
    const size = dv.getUint32(pos + 4, true);
    const payloadStart = pos + 8;
    const payloadEnd = payloadStart + size;
    assert.ok(payloadEnd <= bytes.length, `Chunk ${fourCC} payload overflows EOF`);
    const payload = bytes.slice(payloadStart, payloadEnd);
    let padByte: number | null = null;
    let nextPos = payloadEnd;
    if ((size & 1) === 1) {
      assert.ok(payloadEnd < bytes.length, `Odd chunk ${fourCC} missing mandatory zero pad byte`);
      padByte = bytes[payloadEnd];
      assert.equal(padByte, 0x00, `Odd chunk ${fourCC} pad byte must be 0x00`);
      nextPos = payloadEnd + 1;
    }
    chunks.push({ fourCC, size, offset: pos, payload, padByte });
    pos = nextPos;
  }

  return { riffSize, chunks, endOffset: pos };
}

function buildWebpChunk(fourCC: string, payload: Uint8Array, padByte?: number): Uint8Array {
  const includePad = (payload.length & 1) === 1 && padByte !== undefined;
  const out = new Uint8Array(8 + payload.length + (includePad ? 1 : 0));
  for (let i = 0; i < 4; i++) out[i] = fourCC.charCodeAt(i);
  new DataView(out.buffer).setUint32(4, payload.length, true);
  out.set(payload, 8);
  if (includePad) out[8 + payload.length] = padByte!;
  return out;
}

function buildWebpContainer(chunks: Uint8Array[], opts?: { riffSizeOverride?: number; trailingGarbage?: Uint8Array }): Uint8Array {
  const chunkTotal = chunks.reduce((acc, c) => acc + c.length, 0);
  const garbageLen = opts?.trailingGarbage?.length ?? 0;
  const out = new Uint8Array(12 + chunkTotal + garbageLen);
  out.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  const riffSize = opts?.riffSizeOverride ?? (chunkTotal + 4);
  new DataView(out.buffer).setUint32(4, riffSize, true);
  out.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
  let off = 12;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  if (opts?.trailingGarbage) {
    out.set(opts.trailingGarbage, off);
  }
  return out;
}

test('AUD-02 [NODE-VERIFIED]: WebP RIFF handles odd VP8 payload with/without EOF pad byte, strips ICCP/EXIF/XMP/unknown/garbage, and enforces VP8X flag consistency (container structure only)', async () => {
  const { stripDisplayColorProfiles } = await import('../src/core/image/icc-sanitizer');

  // Case 1: Odd VP8 payload (3 bytes) WITHOUT trailing pad byte at EOF
  const oddVp8Payload = new Uint8Array([0x30, 0x01, 0x9d]);
  const noPadInput = buildWebpContainer([buildWebpChunk('VP8 ', oddVp8Payload)]); // 23 bytes total
  assert.equal(noPadInput.length, 23);

  const noPadOut = stripDisplayColorProfiles(noPadInput, 'image/webp');
  const parsedNoPad = walkStrictWebpRiff(noPadOut);
  assert.equal(parsedNoPad.endOffset, noPadOut.length, 'Chunk walk must terminate at exact EOF');
  assert.equal(parsedNoPad.riffSize, 16, 'RIFF size must be 4 + (8 + 3 + 1) = 16 (even)');
  assert.equal(parsedNoPad.chunks.length, 1);
  assert.equal(parsedNoPad.chunks[0].fourCC, 'VP8 ');
  assert.equal(parsedNoPad.chunks[0].size, 3, 'Chunk size field must exclude pad byte');
  assert.deepEqual(parsedNoPad.chunks[0].payload, oddVp8Payload);
  assert.equal(parsedNoPad.chunks[0].padByte, 0x00);

  // Case 2: Odd VP8 payload WITH dirty trailing pad byte + ICCP + EXIF + XMP + ALPH (odd) + unknown C2PA + trailing garbage
  const vp8xPayload = new Uint8Array([0x3c, 0xaa, 0xbb, 0xcc, 0x0f, 0x00, 0x00, 0x0f, 0x00, 0x00]); // ICC|ALPH|EXIF|XMP + dirty reserved
  const alphPayload = new Uint8Array([0x00, 0x7f, 0xff]); // odd 3 bytes
  const iccpPayload = new Uint8Array([0x49, 0x43, 0x43, 0x50, 0x01]); // odd 5 bytes
  const exifPayload = new Uint8Array([0x49, 0x49, 0x2a, 0x00]);
  const xmpPayload = new Uint8Array([0x3c, 0x78, 0x3e]);
  const c2paPayload = new Uint8Array([0x43, 0x32, 0x50, 0x41]);
  const trailingGarbage = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x56, 0x50, 0x38, 0x20, 0x01, 0x00, 0x00, 0x00, 0x99]);

  const complexInput = buildWebpContainer(
    [
      buildWebpChunk('VP8X', vp8xPayload),
      buildWebpChunk('ICCP', iccpPayload, 0x00),
      buildWebpChunk('ALPH', alphPayload, 0xff), // dirty non-zero pad byte must be normalized to 0x00
      buildWebpChunk('VP8 ', oddVp8Payload, 0xee), // dirty non-zero pad byte must be normalized to 0x00
      buildWebpChunk('EXIF', exifPayload),
      buildWebpChunk('XMP ', xmpPayload, 0x00),
      buildWebpChunk('C2PA', c2paPayload),
    ],
    { trailingGarbage }
  );

  const complexOut = stripDisplayColorProfiles(complexInput, 'image/webp');
  const parsedComplex = walkStrictWebpRiff(complexOut);
  assert.equal(parsedComplex.endOffset, complexOut.length);
  assert.deepEqual(
    parsedComplex.chunks.map(c => c.fourCC),
    ['VP8X', 'ALPH', 'VP8 '],
    'Only VP8X, ALPH, and VP8 must remain; ICCP/EXIF/XMP/C2PA/garbage must be stripped'
  );
  // Check exact VP8X flags: Alpha (0x10) only; ICC (0x20), EXIF (0x08), XMP (0x04), Anim (0x02) must all be 0
  const outVp8x = parsedComplex.chunks[0].payload;
  assert.equal(outVp8x.length, 10);
  assert.equal(outVp8x[0], 0x10, 'VP8X flags must match remaining chunks strictly (ALPH only)');
  assert.deepEqual(Array.from(outVp8x.subarray(1, 4)), [0, 0, 0], 'VP8X reserved bytes must be zeroed');
  assert.deepEqual(Array.from(outVp8x.subarray(4, 10)), [0x0f, 0x00, 0x00, 0x0f, 0x00, 0x00], 'VP8X canvas dimensions must be preserved');
  assert.equal(parsedComplex.chunks[1].size, 3);
  assert.equal(parsedComplex.chunks[1].padByte, 0x00);
  assert.equal(parsedComplex.chunks[2].size, 3);
  assert.equal(parsedComplex.chunks[2].padByte, 0x00);
  // Exact backing buffer length check (no unclipped trailing zeros)
  assert.equal(complexOut.buffer.byteLength, complexOut.byteLength);

  // Case 3: Odd VP8 with declared RIFF size counting the omitted pad byte (24 vs 23 actual bytes)
  const truncatedPadInput = buildWebpContainer([buildWebpChunk('VP8 ', oddVp8Payload)], { riffSizeOverride: 16 });
  assert.equal(truncatedPadInput.length, 23);
  const truncatedPadOut = stripDisplayColorProfiles(truncatedPadInput, 'image/webp');
  const parsedTruncated = walkStrictWebpRiff(truncatedPadOut);
  assert.equal(parsedTruncated.endOffset, truncatedPadOut.length);
  assert.equal(parsedTruncated.chunks.length, 1);
  assert.deepEqual(parsedTruncated.chunks[0].payload, oddVp8Payload);

  // Case 4: Trailing garbage inside declared RIFF size (< 8 leftover bytes) + non-zero Uint8Array byteOffset view
  const innerGarbage = new Uint8Array([0xfe, 0xed, 0xfa, 0xce, 0x01]);
  const withInnerGarbage = buildWebpContainer(
    [buildWebpChunk('VP8 ', oddVp8Payload, 0x00)],
    { riffSizeOverride: 4 + 12 + innerGarbage.length, trailingGarbage: innerGarbage }
  );
  const paddedBacking = new Uint8Array(withInnerGarbage.length + 17);
  paddedBacking.fill(0xaa);
  paddedBacking.set(withInnerGarbage, 9);
  const slicedView = paddedBacking.subarray(9, 9 + withInnerGarbage.length);
  const viewOut = stripDisplayColorProfiles(slicedView, 'image/webp');
  const parsedView = walkStrictWebpRiff(viewOut);
  assert.equal(parsedView.endOffset, viewOut.length);
  assert.equal(parsedView.chunks.length, 1);
  assert.deepEqual(parsedView.chunks[0].payload, oddVp8Payload);
});

interface SpyBitmap {
  id: number;
  width: number;
  height: number;
  closeCalls: number;
  close(): void;
}

function installImagePipelineDomMocks(opts: {
  width: number;
  height: number;
  throwOnDrawCall?: number;
  encodeMime?: string;
}) {
  const createdBitmaps: SpyBitmap[] = [];
  let drawCount = 0;

  const origCreateImageBitmap = (globalThis as Record<string, unknown>).createImageBitmap;
  const origDocument = (globalThis as Record<string, unknown>).document;
  const origOffscreen = (globalThis as Record<string, unknown>).OffscreenCanvas;

  (globalThis as Record<string, unknown>).createImageBitmap = async (
    _src: unknown,
    _sx?: number,
    _sy?: number,
    sw?: number,
    sh?: number
  ) => {
    const bm: SpyBitmap = {
      id: createdBitmaps.length + 1,
      width: sw ?? opts.width,
      height: sh ?? opts.height,
      closeCalls: 0,
      close() {
        this.closeCalls++;
      },
    };
    createdBitmaps.push(bm);
    return bm;
  };

  const makeMockCanvas = (initialW = 0, initialH = 0) => {
    const canvas = {
      width: initialW,
      height: initialH,
      _pixels: new Uint8ClampedArray(Math.max(1, initialW * initialH * 4)),
      getContext(kind: string) {
        if (kind !== '2d') return null;
        return {
          clearRect: () => {},
          drawImage: () => {
            drawCount++;
            if (opts.throwOnDrawCall !== undefined && drawCount === opts.throwOnDrawCall) {
              throw new Error(`MOCK_DRAW_FAILURE_${drawCount}`);
            }
          },
          createImageData: (w: number, h: number) => ({
            data: new Uint8ClampedArray(w * h * 4),
            width: w,
            height: h,
          }),
          getImageData: (_x: number, _y: number, w: number, h: number) => {
            if (canvas._pixels.length !== w * h * 4) {
              canvas._pixels = new Uint8ClampedArray(w * h * 4).fill(128);
            }
            return { data: canvas._pixels, width: w, height: h };
          },
          putImageData: (img: { data: Uint8ClampedArray }) => {
            canvas._pixels = new Uint8ClampedArray(img.data);
          },
        };
      },
      toBlob(cb: (b: Blob | null) => void, mime: string) {
        const effectiveType = opts.encodeMime ?? mime;
        const vp8Chunk = buildWebpChunk('VP8 ', new Uint8Array([0x30, 0x01, 0x00, 0x9d]));
        const webpBytes = buildWebpContainer([vp8Chunk]);
        cb(new Blob([webpBytes], { type: effectiveType }));
      },
      async convertToBlob(cfg?: { type?: string }) {
        const effectiveType = opts.encodeMime ?? cfg?.type ?? 'image/webp';
        const vp8Chunk = buildWebpChunk('VP8 ', new Uint8Array([0x30, 0x01, 0x00, 0x9d]));
        const webpBytes = buildWebpContainer([vp8Chunk]);
        return new Blob([webpBytes], { type: effectiveType });
      },
    };
    return canvas;
  };

  (globalThis as Record<string, unknown>).document = {
    createElement(tag: string) {
      if (tag === 'canvas') return makeMockCanvas();
      throw new Error(`Unexpected tag: ${tag}`);
    },
  };

  (globalThis as Record<string, unknown>).OffscreenCanvas = class MockOffscreen {
    width: number;
    height: number;
    _inner: ReturnType<typeof makeMockCanvas>;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this._inner = makeMockCanvas(w, h);
    }
    getContext(kind: string) {
      this._inner.width = this.width;
      this._inner.height = this.height;
      return this._inner.getContext(kind);
    }
    convertToBlob(cfg?: { type?: string }) {
      return this._inner.convertToBlob(cfg);
    }
  };

  const restore = () => {
    if (origCreateImageBitmap === undefined) {
      delete (globalThis as Record<string, unknown>).createImageBitmap;
    } else {
      (globalThis as Record<string, unknown>).createImageBitmap = origCreateImageBitmap;
    }
    if (origDocument === undefined) {
      delete (globalThis as Record<string, unknown>).document;
    } else {
      (globalThis as Record<string, unknown>).document = origDocument;
    }
    if (origOffscreen === undefined) {
      delete (globalThis as Record<string, unknown>).OffscreenCanvas;
    } else {
      (globalThis as Record<string, unknown>).OffscreenCanvas = origOffscreen;
    }
  };

  return { createdBitmaps, restore };
}

function makeValidMinimalJpeg(width: number, height: number): Uint8Array {
  return new Uint8Array([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00,
    0xff, 0xd9,
  ]);
}

test('AUD-03 [MOCK-CONTRACT]: sanitizeImage closes every created ImageBitmap exactly once even when drawImage throws', async () => {
  const { sanitizeImage } = await import('../src/core/image/image-sanitizer');
  const mocks = installImagePipelineDomMocks({
    width: 16,
    height: 16,
    throwOnDrawCall: 1, // Fail inside applyPrnuDefense drawImage while bitmap is live
  });

  try {
    const file = new File([makeValidMinimalJpeg(16, 16)], 'sample.jpg', { type: 'image/jpeg' });
    await assert.rejects(
      () => sanitizeImage(file, { defenseLevel: 'paranoid' }),
      /MOCK_DRAW_FAILURE_1/
    );

    assert.equal(mocks.createdBitmaps.length, 1, 'Expected single-pass decoded bitmap to be created');
    for (const bm of mocks.createdBitmaps) {
      assert.equal(bm.closeCalls, 1, `Bitmap #${bm.id} leaked: close() called ${bm.closeCalls} times`);
    }
  } finally {
    mocks.restore();
  }
});

test('AUD-03 [MOCK-CONTRACT]: ImageBitmap.close() covers success, downscale-throw, early-return, abort, and transferred ownership across worker & main-thread', async () => {
  const { sanitizeImage, withManagedImageBitmap } = await import('../src/core/image/image-sanitizer');
  const { processImageWorkerJob } = await import('../src/core/workers/image.worker');

  // 1. Success path with downscale (>1920px creates 1 bitmap in single-pass AUD-04 pipeline)
  {
    const mocks = installImagePipelineDomMocks({ width: 2400, height: 1200 });
    try {
      const workerOut = await processImageWorkerJob({
        buffer: makeValidMinimalJpeg(2400, 1200).buffer,
        mimeType: 'image/jpeg',
        options: { defenseLevel: 'hardened' },
        needsAlpha: false,
      });
      assert.ok(workerOut.buffer.byteLength >= 12);
      assert.equal(mocks.createdBitmaps.length, 1, 'Worker single-pass downscale path creates 1 bitmap');
      for (const bm of mocks.createdBitmaps) {
        assert.equal(bm.closeCalls, 1, `Worker success bitmap #${bm.id} must close exactly once`);
      }
    } finally {
      mocks.restore();
    }
  }

  // 2. Throw during downscale drawImage in worker closes the single decoded bitmap
  {
    const mocks = installImagePipelineDomMocks({ width: 2400, height: 1200, throwOnDrawCall: 1 });
    try {
      await assert.rejects(
        () => processImageWorkerJob({
          buffer: makeValidMinimalJpeg(2400, 1200).buffer,
          mimeType: 'image/jpeg',
          options: { defenseLevel: 'hardened' },
          needsAlpha: false,
        }),
        /MOCK_DRAW_FAILURE_1/
      );
      assert.equal(mocks.createdBitmaps.length, 1, 'Decoded bitmap created before downscale failure');
      for (const bm of mocks.createdBitmaps) {
        assert.equal(bm.closeCalls, 1, `Worker downscale-throw bitmap #${bm.id} must close exactly once`);
      }
    } finally {
      mocks.restore();
    }
  }

  // 3. Early return path & zero-dimension exit path close bitmap exactly once
  {
    let earlyCloseCount = 0;
    const fakeBitmap = {
      width: 10,
      height: 10,
      close() {
        earlyCloseCount++;
      },
    } as unknown as ImageBitmap;

    const earlyVal = await withManagedImageBitmap(
      async () => fakeBitmap,
      () => 'EARLY_RETURN'
    );
    assert.equal(earlyVal, 'EARLY_RETURN');
    assert.equal(earlyCloseCount, 1, 'Early return must close bitmap exactly once');

    const zeroMocks = installImagePipelineDomMocks({ width: 0, height: 0 });
    try {
      await assert.rejects(
        () => processImageWorkerJob({
          buffer: makeValidMinimalJpeg(16, 16).buffer,
          mimeType: 'image/jpeg',
          options: { defenseLevel: 'hardened' },
          needsAlpha: false,
        }),
        /INVALID_IMAGE_DIMENSIONS/
      );
      assert.equal(zeroMocks.createdBitmaps.length, 1);
      assert.equal(zeroMocks.createdBitmaps[0].closeCalls, 1);
    } finally {
      zeroMocks.restore();
    }
  }

  // 4. Abort path: pre-aborted creates 0 bitmaps; mid-flight abort closes just-created bitmap once
  {
    const acPre = new AbortController();
    acPre.abort('already-cancelled');
    let factoryCalls = 0;
    await assert.rejects(
      () => withManagedImageBitmap(
        async () => {
          factoryCalls++;
          return { width: 4, height: 4, close() {} } as unknown as ImageBitmap;
        },
        () => 'unreachable',
        acPre.signal
      ),
      (err: Error) => err.name === 'AbortError'
    );
    assert.equal(factoryCalls, 0, 'Pre-aborted signal must not create any ImageBitmap');

    const acMid = new AbortController();
    let midCloseCount = 0;
    await assert.rejects(
      () => withManagedImageBitmap(
        async () => {
          acMid.abort('aborted-during-decode');
          return {
            width: 4,
            height: 4,
            close() {
              midCloseCount++;
            },
          } as unknown as ImageBitmap;
        },
        () => 'unreachable',
        acMid.signal
      ),
      (err: Error) => err.name === 'AbortError'
    );
    assert.equal(midCloseCount, 1, 'Mid-flight abort must still close created bitmap exactly once');
  }

  // 5. Transferred / still-referenced bitmap must NOT be closed
  {
    let transferredCloseCount = 0;
    const fakeTransferred = {
      width: 16,
      height: 16,
      close() {
        transferredCloseCount++;
      },
    } as unknown as ImageBitmap;

    const retained = await withManagedImageBitmap(
      async () => fakeTransferred,
      (handle) => handle.releaseOwnership()
    );
    assert.equal(retained, fakeTransferred);
    assert.equal(transferredCloseCount, 0, 'Transferred/referenced bitmap must never be closed by finally');
  }

  // 6. WEBP_ENCODE_UNSUPPORTED from Worker must not fall back to re-running main-thread DSP
  {
    const mocks = installImagePipelineDomMocks({ width: 16, height: 16 });
    const origWorker = (globalThis as Record<string, unknown>).Worker;
    let terminated = 0;
    (globalThis as Record<string, unknown>).Worker = class MockWorker {
      onmessage: ((e: { data: unknown }) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      postMessage() {
        queueMicrotask(() => {
          this.onmessage?.({ data: { error: 'WEBP_ENCODE_UNSUPPORTED' } });
        });
      }
      terminate() {
        terminated++;
      }
    };
    try {
      const file = new File([makeValidMinimalJpeg(16, 16)], 'sample.jpg', { type: 'image/jpeg' });
      await assert.rejects(
        () => sanitizeImage(file, { defenseLevel: 'paranoid' }),
        /WEBP_ENCODE_UNSUPPORTED/
      );
      assert.equal(terminated, 1);
      assert.equal(mocks.createdBitmaps.length, 0, 'Must not fall back to main-thread createImageBitmap on WEBP_ENCODE_UNSUPPORTED');
    } finally {
      if (origWorker === undefined) {
        delete (globalThis as Record<string, unknown>).Worker;
      } else {
        (globalThis as Record<string, unknown>).Worker = origWorker;
      }
      mocks.restore();
    }
  }
});

// =============================================================================
// AUD-05 (Report AUD-05 + AUD-06): Empirical PRNU maxDeltaLuma calibration,
// 0/255 clipping symmetry, and CSPRNG visibility dithering.
//
// Pre-measurement pass targets (documented before sweep selection):
// Synthetic detector protocol:
// - 128x128 flat (I=128), full-range gradient (0..255), and multi-frequency
//   textured images with zero-mean multiplicative PRNU K (sigma_K = 0.025).
// - Fixed simple denoiser residual: W = Y - Gaussian3x3(Y).
// - Detector metric: zero-mean normalized cross-correlation NCC(W, K * Y).
// Targets at paranoid strength (1.25):
// - flat relative correlation drop >= 45% (vs 0.6% with hardcoded 1.45)
// - grad relative correlation drop >= 14% (vs 0.7% with hardcoded 1.45)
// - tex  relative correlation drop >= 35% (vs 12.7% with hardcoded 1.45)
// - PSNR vs fingerprinted input >= 38.0 dB across all three image classes
// - PSNR vs clean image improves over unsanitized fingerprinted input
// - Exact 0/255 mirror symmetry: out(255 - I) === 255 - out(I) (0 asymmetric px)
// - Default visibility dithering calls crypto.getRandomValues in <= 65536B chunks
//   and two runs diverge with channel Hamming rate within 6 sigma of 0.75.
// =============================================================================

function makeDeterministicPrng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function buildPrnuSyntheticSuite(w: number, h: number) {
  const flat = new Uint8ClampedArray(w * h * 4);
  const grad = new Uint8ClampedArray(w * h * 4);
  const tex = new Uint8ClampedArray(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) << 2;
      flat[idx] = 128;
      flat[idx + 1] = 128;
      flat[idx + 2] = 128;
      flat[idx + 3] = 255;

      const gv = Math.round(((x + y) / (w + h - 2)) * 255);
      grad[idx] = gv;
      grad[idx + 1] = gv;
      grad[idx + 2] = gv;
      grad[idx + 3] = 255;

      const tv = Math.max(
        10,
        Math.min(
          245,
          Math.round(
            128 +
              45 * Math.sin((2 * Math.PI * x) / 23) * Math.cos((2 * Math.PI * y) / 19) +
              30 * Math.sin((2 * Math.PI * (x + y)) / 37) +
              25 * ((x >> 4) % 2 === (y >> 4) % 2 ? 1 : -1)
          )
        )
      );
      tex[idx] = tv;
      tex[idx + 1] = tv;
      tex[idx + 2] = tv;
      tex[idx + 3] = 255;
    }
  }

  const rng = makeDeterministicPrng(0x1337beef);
  const K = new Float64Array(w * h);
  let meanK = 0;
  for (let i = 0; i < K.length; i++) {
    const u1 = Math.max(1e-12, rng());
    const u2 = rng();
    K[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.025;
    meanK += K[i];
  }
  meanK /= K.length;
  for (let i = 0; i < K.length; i++) K[i] -= meanK;

  const embed = (clean: Uint8ClampedArray): Uint8ClampedArray => {
    const out = new Uint8ClampedArray(clean.length);
    for (let p = 0; p < K.length; p++) {
      const idx = p << 2;
      const factor = 1 + K[p];
      for (let c = 0; c < 3; c++) {
        const v = Math.round(clean[idx + c] * factor);
        out[idx + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      out[idx + 3] = clean[idx + 3];
    }
    return out;
  };

  return {
    K,
    images: {
      flat: { clean: flat, fp: embed(flat) },
      grad: { clean: grad, fp: embed(grad) },
      tex: { clean: tex, fp: embed(tex) },
    },
  };
}

function measureSyntheticPrnuCorr(rgba: Uint8ClampedArray, K: Float64Array, w: number, h: number): number {
  const n = w * h;
  const Y = new Float64Array(n);
  for (let p = 0; p < n; p++) {
    const i = p << 2;
    Y[p] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  const W = new Float64Array(n);
  for (let y = 0; y < h; y++) {
    const y0 = y > 0 ? y - 1 : 0;
    const y2 = y < h - 1 ? y + 1 : h - 1;
    for (let x = 0; x < w; x++) {
      const x0 = x > 0 ? x - 1 : 0;
      const x2 = x < w - 1 ? x + 1 : w - 1;
      const smooth =
        (Y[y0 * w + x0] + 2 * Y[y0 * w + x] + Y[y0 * w + x2] +
          2 * Y[y * w + x0] + 4 * Y[y * w + x] + 2 * Y[y * w + x2] +
          Y[y2 * w + x0] + 2 * Y[y2 * w + x] + Y[y2 * w + x2]) /
        16.0;
      W[y * w + x] = Y[y * w + x] - smooth;
    }
  }
  const KI = new Float64Array(n);
  let meanW = 0;
  let meanKI = 0;
  for (let i = 0; i < n; i++) {
    KI[i] = K[i] * Y[i];
    meanW += W[i];
    meanKI += KI[i];
  }
  meanW /= n;
  meanKI /= n;
  let num = 0;
  let dw = 0;
  let dk = 0;
  for (let i = 0; i < n; i++) {
    const a = W[i] - meanW;
    const b = KI[i] - meanKI;
    num += a * b;
    dw += a * a;
    dk += b * b;
  }
  return dw > 0 && dk > 0 ? num / Math.sqrt(dw * dk) : 0;
}

function computeRgbPsnr(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
  let se = 0;
  let samples = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const d = a[i + c] - b[i + c];
      se += d * d;
      samples++;
    }
  }
  return se === 0 ? 99.99 : 10 * Math.log10((255 * 255) / (se / samples));
}

test('AUD-05 [NODE-VERIFIED]: calibrated maxDeltaLuma meets empirical PRNU suppression targets and preserves 0/255 mirror symmetry', async () => {
  const { applyWaveletPRNUAttenuation } = await import('../src/core/image/prnu-defense');
  const W = 128;
  const H = 128;
  const suite = buildPrnuSyntheticSuite(W, H);

  const targets: Record<'flat' | 'grad' | 'tex', { minDropPct: number; minPsnrFp: number }> = {
    flat: { minDropPct: 45, minPsnrFp: 38.0 },
    grad: { minDropPct: 14, minPsnrFp: 38.0 },
    tex: { minDropPct: 35, minPsnrFp: 38.0 },
  };

  for (const key of ['flat', 'grad', 'tex'] as const) {
    const { clean, fp } = suite.images[key];
    const baseCorr = measureSyntheticPrnuCorr(fp, suite.K, W, H);
    const unsanitizedPsnrClean = computeRgbPsnr(clean, fp);

    const sanitized = new Uint8ClampedArray(fp);
    applyWaveletPRNUAttenuation(sanitized, W, H, 'db4', 1.25);

    const postCorr = measureSyntheticPrnuCorr(sanitized, suite.K, W, H);
    const dropPct = ((baseCorr - postCorr) / baseCorr) * 100;
    const psnrFp = computeRgbPsnr(fp, sanitized);
    const psnrClean = computeRgbPsnr(clean, sanitized);

    let maxObservedDelta = 0;
    for (let i = 0; i < sanitized.length; i += 4) {
      const d = Math.abs(sanitized[i] - fp[i]);
      if (d > maxObservedDelta) maxObservedDelta = d;
    }

    assert.ok(
      dropPct >= targets[key].minDropPct,
      `${key}: correlation drop ${dropPct.toFixed(1)}% below target ${targets[key].minDropPct}%`
    );
    assert.ok(
      psnrFp >= targets[key].minPsnrFp,
      `${key}: PSNR vs fingerprinted ${psnrFp.toFixed(2)} dB below ${targets[key].minPsnrFp} dB`
    );
    assert.ok(
      psnrClean > unsanitizedPsnrClean,
      `${key}: PSNR vs clean (${psnrClean.toFixed(2)} dB) should improve over unsanitized (${unsanitizedPsnrClean.toFixed(2)} dB)`
    );
    assert.ok(maxObservedDelta >= 2, `${key}: max |delta| (${maxObservedDelta}) must exceed legacy +-1 clamp`);
  }

  // Exact 0/255 mirror clipping symmetry check: out(255 - I) === 255 - out(I)
  const nearDark = new Uint8ClampedArray(64 * 64 * 4);
  const nearBright = new Uint8ClampedArray(64 * 64 * 4);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) << 2;
      const v = Math.max(0, Math.min(255, 2 + ((x + y) % 2 === 0 ? 3 : -3)));
      nearDark[i] = v;
      nearDark[i + 1] = v;
      nearDark[i + 2] = v;
      nearDark[i + 3] = 255;
      nearBright[i] = 255 - v;
      nearBright[i + 1] = 255 - v;
      nearBright[i + 2] = 255 - v;
      nearBright[i + 3] = 255;
    }
  }
  applyWaveletPRNUAttenuation(nearDark, 64, 64, 'db4', 1.25);
  applyWaveletPRNUAttenuation(nearBright, 64, 64, 'db4', 1.25);
  let asymPixels = 0;
  for (let i = 0; i < nearDark.length; i += 4) {
    if (255 - nearDark[i] !== nearBright[i]) asymPixels++;
  }
  assert.equal(asymPixels, 0, `0/255 mirror clipping asymmetry detected on ${asymPixels} pixels`);
});

test('AUD-05 (Report AUD-06) [NODE-VERIFIED]: default visibility dithering uses chunked crypto.getRandomValues (<=65536B) and diverges statistically', async () => {
  const { applyVisibilityDithering } = await import('../src/core/image/decontamination');

  // 1. Spy on crypto.getRandomValues to confirm default path uses CSPRNG and chunks to <= 65536 bytes
  const chunkSizes: number[] = [];
  const origGetRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
  const cryptoDesc = Object.getOwnPropertyDescriptor(globalThis.crypto, 'getRandomValues');
  (globalThis.crypto as unknown as Record<string, unknown>).getRandomValues = <T extends ArrayBufferView>(arr: T): T => {
    chunkSizes.push(arr.byteLength);
    return origGetRandomValues(arr);
  };

  try {
    // 70,000 pixels > 65,536 bytes -> forces multi-chunk CSPRNG calls
    const largeBuf = new Uint8ClampedArray(70000 * 4);
    for (let i = 0; i < largeBuf.length; i += 4) {
      largeBuf[i] = 128;
      largeBuf[i + 1] = 128;
      largeBuf[i + 2] = 128;
      largeBuf[i + 3] = 255;
    }
    applyVisibilityDithering(largeBuf);
  } finally {
    if (cryptoDesc) {
      Object.defineProperty(globalThis.crypto, 'getRandomValues', cryptoDesc);
    } else {
      (globalThis.crypto as unknown as Record<string, unknown>).getRandomValues = origGetRandomValues;
    }
  }

  assert.ok(chunkSizes.length >= 2, `Expected >= 2 chunked CSPRNG calls for 70k pixels, got ${chunkSizes.length}`);
  for (const sz of chunkSizes) {
    assert.ok(sz > 0 && sz <= 65536, `CSPRNG chunk byteLength ${sz} violates <= 65536 limit`);
  }

  // 2. Statistical Hamming distance between two independent default runs over N = 16384 pixels (49152 RGB channels)
  const N = 16384;
  const runA = new Uint8ClampedArray(N * 4);
  const runB = new Uint8ClampedArray(N * 4);
  for (let i = 0; i < N * 4; i += 4) {
    runA[i] = runB[i] = 128;
    runA[i + 1] = runB[i + 1] = 128;
    runA[i + 2] = runB[i + 2] = 128;
    runA[i + 3] = runB[i + 3] = 255;
  }
  applyVisibilityDithering(runA);
  applyVisibilityDithering(runB);

  let diffChannels = 0;
  const totalChannels = N * 3;
  for (let i = 0; i < N * 4; i += 4) {
    if (runA[i] !== runB[i]) diffChannels++;
    if (runA[i + 1] !== runB[i + 1]) diffChannels++;
    if (runA[i + 2] !== runB[i + 2]) diffChannels++;
  }
  const hammingRate = diffChannels / totalChannels;
  const expected = 0.75; // 4 equiprobable offsets {-2,-1,+1,+2} => P(X != Y) = 3/4
  const sigma = Math.sqrt((expected * (1 - expected)) / totalChannels);
  assert.ok(
    Math.abs(hammingRate - expected) <= 6 * sigma,
    `Two default dithering runs channel Hamming rate ${hammingRate.toFixed(5)} outside 6-sigma of ${expected}`
  );

  // 3. Injectable RNG deterministic distribution test: exact uniform {-2, -1, +1, +2} coverage
  const detPixels = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < detPixels.length; i += 4) {
    detPixels[i] = 100;
    detPixels[i + 1] = 100;
    detPixels[i + 2] = 100;
    detPixels[i + 3] = 255;
  }
  applyVisibilityDithering(detPixels, (target) => {
    for (let i = 0; i < target.length; i++) target[i] = i & 0xff;
    return target;
  });
  const counts: Record<number, number> = { [-2]: 0, [-1]: 0, 1: 0, 2: 0 };
  for (let i = 0; i < detPixels.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const d = detPixels[i + c] - 100;
      assert.ok(d in counts, `Unexpected dither delta ${d}`);
      counts[d]++;
    }
    assert.equal(detPixels[i + 3], 255);
  }
  assert.equal(counts[-2], 192);
  assert.equal(counts[-1], 192);
  assert.equal(counts[1], 192);
  assert.equal(counts[2], 192);
});

test('AUD-05 [NODE-VERIFIED]: empirical maxDeltaLuma sweep curve validates selection of CALIBRATED_MAX_DELTA_LUMA', async () => {
  const { applyWaveletPRNUAttenuation, CALIBRATED_MAX_DELTA_LUMA } = await import('../src/core/image/prnu-defense');
  const W = 128;
  const H = 128;
  const suite = buildPrnuSyntheticSuite(W, H);
  const sweepValues = [1.0, 1.45, 2.0, 4.0, 6.0, CALIBRATED_MAX_DELTA_LUMA, 12.0];

  const flatDrops: number[] = [];
  for (const mdl of sweepValues) {
    const buf = new Uint8ClampedArray(suite.images.flat.fp);
    const baseCorr = measureSyntheticPrnuCorr(buf, suite.K, W, H);
    applyWaveletPRNUAttenuation(buf, W, H, 'db4', 1.25, mdl);
    const postCorr = measureSyntheticPrnuCorr(buf, suite.K, W, H);
    const dropPct = ((baseCorr - postCorr) / baseCorr) * 100;
    const psnrFp = computeRgbPsnr(suite.images.flat.fp, buf);
    flatDrops.push(dropPct);
    assert.ok(psnrFp >= 38.0, `Sweep mdl=${mdl} dropped PSNR below 38 dB: ${psnrFp.toFixed(2)}`);
  }

  // Monotonic non-decreasing PRNU suppression as maxDeltaLuma increases
  for (let i = 1; i < flatDrops.length; i++) {
    assert.ok(
      flatDrops[i] + 1e-6 >= flatDrops[i - 1],
      `Expected monotonic drop curve: mdl[${i}]=${flatDrops[i].toFixed(2)}% < mdl[${i - 1}]=${flatDrops[i - 1].toFixed(2)}%`
    );
  }
  // Calibrated value must capture >= 98% of the unconstrained (mdl=12.0) ceiling
  const calibratedDrop = flatDrops[sweepValues.indexOf(CALIBRATED_MAX_DELTA_LUMA)];
  const ceilingDrop = flatDrops[flatDrops.length - 1];
  assert.ok(
    calibratedDrop >= ceilingDrop * 0.98,
    `Calibrated mdl=${CALIBRATED_MAX_DELTA_LUMA} drop ${calibratedDrop.toFixed(2)}% < 98% of ceiling ${ceilingDrop.toFixed(2)}%`
  );
});

// =============================================================================
// AUD-06 (Report AUD-07): Alpha channel anti-steganography (vectors a, b, c)
// and premultiplied alpha resampling consistency.
// =============================================================================

function makeFake2DCanvas(pixels: Uint8ClampedArray, width: number, height: number) {
  let buf = new Uint8ClampedArray(pixels);
  return {
    width,
    height,
    getPixels: () => buf,
    getContext(kind: string) {
      if (kind !== '2d') return null;
      return {
        clearRect: () => {
          buf.fill(0);
        },
        drawImage: (src: { _pixels?: Uint8ClampedArray; getPixels?: () => Uint8ClampedArray; width: number; height: number }, _dx: number, _dy: number, dw?: number, dh?: number) => {
          const srcPixels = src.getPixels ? src.getPixels() : src._pixels;
          if (!srcPixels) return;
          const tw = dw ?? width;
          const th = dh ?? height;
          if (tw === src.width && th === src.height) {
            buf = new Uint8ClampedArray(srcPixels);
          } else {
            // Simple nearest-neighbor downscale for Node mock canvas
            const out = new Uint8ClampedArray(tw * th * 4);
            for (let y = 0; y < th; y++) {
              const sy = Math.min(src.height - 1, Math.floor((y * src.height) / th));
              for (let x = 0; x < tw; x++) {
                const sx = Math.min(src.width - 1, Math.floor((x * src.width) / tw));
                const sIdx = (sy * src.width + sx) << 2;
                const dIdx = (y * tw + x) << 2;
                out[dIdx] = srcPixels[sIdx];
                out[dIdx + 1] = srcPixels[sIdx + 1];
                out[dIdx + 2] = srcPixels[sIdx + 2];
                out[dIdx + 3] = srcPixels[sIdx + 3];
              }
            }
            buf = out;
          }
        },
        createImageData: (w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4),
          width: w,
          height: h,
        }),
        getImageData: () => ({ data: new Uint8ClampedArray(buf), width, height }),
        putImageData: (img: { data: Uint8ClampedArray }) => {
          buf = new Uint8ClampedArray(img.data);
        },
      };
    },
  };
}

test('AUD-06 (Report AUD-07) [NODE-VERIFIED]: mitigates alpha steganography vectors (a) near-opaque LSB, (b) real transparency LSB, and (c) hidden RGB under alpha=0 with premultiplied resampling', async () => {
  const { applyDeepDecontamination, resampleBicubic } = await import('../src/core/image/decontamination');

  const W = 128;
  const H = 64;
  const N = W * H; // 8192 bits >= 4096 bits
  const sigma = 0.5 / Math.sqrt(N); // ~0.005524
  const tolSigma = 5; // >= 4 sigma binomial tolerance around 0.5
  const maxDeltaAlphaBound = 3;

  const prng = makeDeterministicPrng(0xdeadcafe);
  const payloadBits = new Uint8Array(N);
  for (let i = 0; i < N; i++) payloadBits[i] = prng() >= 0.5 ? 1 : 0;

  // Stub minimal OffscreenCanvas for applySpatialMicroResampling downCanvas (returns null for webgl so CPU median runs)
  const origOffscreen = (globalThis as Record<string, unknown>).OffscreenCanvas;
  (globalThis as Record<string, unknown>).OffscreenCanvas = class Mock2DOffscreen {
    width: number;
    height: number;
    _inner: ReturnType<typeof makeFake2DCanvas>;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this._inner = makeFake2DCanvas(new Uint8ClampedArray(w * h * 4), w, h);
    }
    getContext(kind: string) {
      return kind === '2d' ? this._inner.getContext('2d') : null;
    }
  };

  try {
    // Vector (a): Visually opaque image carrying 8192-bit LSB payload in alpha (254/255)
    const vecAPixels = new Uint8ClampedArray(N * 4);
    for (let i = 0; i < N; i++) {
      const idx = i << 2;
      vecAPixels[idx] = 120;
      vecAPixels[idx + 1] = 140;
      vecAPixels[idx + 2] = 160;
      vecAPixels[idx + 3] = 254 | payloadBits[i];
    }
    const canvasA = makeFake2DCanvas(vecAPixels, W, H);
    applyDeepDecontamination(canvasA as unknown as HTMLCanvasElement, true);
    const outA = canvasA.getPixels();

    let errorsA = 0;
    let maxDeltaA = 0;
    for (let i = 0; i < N; i++) {
      const a = outA[(i << 2) + 3];
      assert.equal(a, 255, `Vector (a) visually opaque pixel #${i} must snap to 255, got ${a}`);
      const d = Math.abs(a - vecAPixels[(i << 2) + 3]);
      if (d > maxDeltaA) maxDeltaA = d;
      if ((a & 1) !== payloadBits[i]) errorsA++;
    }
    const berA = errorsA / N;
    assert.ok(maxDeltaA <= maxDeltaAlphaBound, `Vector (a) |delta alpha| ${maxDeltaA} exceeded ${maxDeltaAlphaBound}`);
    assert.ok(
      Math.abs(berA - 0.5) <= tolSigma * sigma,
      `Vector (a) BER ${berA.toFixed(4)} outside ${tolSigma}-sigma tolerance of 0.5`
    );

    // Vector (b): Real semi-transparent image (alpha in [20..235]) carrying 8192-bit payload in bit 0
    const vecBPixels = new Uint8ClampedArray(N * 4);
    for (let i = 0; i < N; i++) {
      const idx = i << 2;
      vecBPixels[idx] = 80;
      vecBPixels[idx + 1] = 160;
      vecBPixels[idx + 2] = 200;
      const baseAlpha = 20 + ((i % 108) * 2); // even values in [20..234]
      vecBPixels[idx + 3] = baseAlpha | payloadBits[i];
    }
    const canvasB = makeFake2DCanvas(vecBPixels, W, H);
    applyDeepDecontamination(canvasB as unknown as HTMLCanvasElement, true);
    const outB = canvasB.getPixels();

    let errorsB = 0;
    let maxDeltaB = 0;
    for (let i = 0; i < N; i++) {
      const a = outB[(i << 2) + 3];
      const origA = vecBPixels[(i << 2) + 3];
      assert.ok(a >= 4 && a <= 251, `Vector (b) real transparency pixel #${i} should stay semi-transparent, got ${a}`);
      if ((a & 1) !== payloadBits[i]) errorsB++;
      const d = Math.abs(a - origA);
      if (d > maxDeltaB) maxDeltaB = d;
    }
    const berB = errorsB / N;
    assert.ok(
      Math.abs(berB - 0.5) <= tolSigma * sigma,
      `Vector (b) BER ${berB.toFixed(4)} outside ${tolSigma}-sigma tolerance of 0.5`
    );

    // Vector (c): RGB payload hidden under alpha = 0
    const vecCPixels = new Uint8ClampedArray(N * 4);
    for (let i = 0; i < N; i++) {
      const idx = i << 2;
      vecCPixels[idx] = 180 | payloadBits[i];
      vecCPixels[idx + 1] = 90 | payloadBits[i];
      vecCPixels[idx + 2] = 44 | payloadBits[i];
      vecCPixels[idx + 3] = 0;
    }
    const canvasC = makeFake2DCanvas(vecCPixels, W, H);
    applyDeepDecontamination(canvasC as unknown as HTMLCanvasElement, true);
    const outC = canvasC.getPixels();

    let errorsC = 0;
    let nonZeroHiddenRgb = 0;
    for (let i = 0; i < N; i++) {
      const idx = i << 2;
      assert.equal(outC[idx + 3], 0, 'Transparent pixel alpha must remain 0');
      if (outC[idx] !== 0 || outC[idx + 1] !== 0 || outC[idx + 2] !== 0) nonZeroHiddenRgb++;
      if ((outC[idx] & 1) !== payloadBits[i]) errorsC++;
    }
    const berC = errorsC / N;
    assert.equal(nonZeroHiddenRgb, 0, `Vector (c) left ${nonZeroHiddenRgb} non-zero RGB pixels under alpha=0`);
    assert.ok(
      Math.abs(berC - 0.5) <= tolSigma * sigma,
      `Vector (c) BER ${berC.toFixed(4)} outside ${tolSigma}-sigma tolerance of 0.5`
    );

    // Vector (c) premultiplication invariance in resampleBicubic:
    // Visible edge pixels must be identical whether adjacent alpha=0 pixels carry (0,0,0) or secret RGB (255,128,64)
    const srcZero = new Uint32Array(4 * 4);
    const srcSecret = new Uint32Array(4 * 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const p = y * 4 + x;
        if (x < 2) {
          // Opaque red left half: R=255, G=0, B=0, A=255
          srcZero[p] = 0xff0000ff;
          srcSecret[p] = 0xff0000ff;
        } else {
          // Fully transparent right half
          srcZero[p] = 0x00000000;
          srcSecret[p] = 0x004080ff; // A=0, hidden R=255, G=128, B=64
        }
      }
    }
    const dstZero = new Uint32Array(8 * 8);
    const dstSecret = new Uint32Array(8 * 8);
    resampleBicubic(srcZero, 4, 4, dstZero, 8, 8, true);
    resampleBicubic(srcSecret, 4, 4, dstSecret, 8, 8, true);
    assert.deepEqual(dstSecret, dstZero, 'Premultiplied resampleBicubic must never leak hidden RGB from alpha=0 pixels');

    // Opaque images must remain strictly opaque (alpha === 255 everywhere)
    const opaquePixels = new Uint8ClampedArray(16 * 16 * 4);
    for (let i = 0; i < opaquePixels.length; i += 4) {
      opaquePixels[i] = 100;
      opaquePixels[i + 1] = 150;
      opaquePixels[i + 2] = 200;
      opaquePixels[i + 3] = 255;
    }
    const canvasOpaque = makeFake2DCanvas(opaquePixels, 16, 16);
    applyDeepDecontamination(canvasOpaque as unknown as HTMLCanvasElement, true);
    const outOpaque = canvasOpaque.getPixels();
    for (let i = 3; i < outOpaque.length; i += 4) {
      assert.equal(outOpaque[i], 255, 'Opaque image must remain strictly opaque');
    }
  } finally {
    if (origOffscreen === undefined) {
      delete (globalThis as Record<string, unknown>).OffscreenCanvas;
    } else {
      (globalThis as Record<string, unknown>).OffscreenCanvas = origOffscreen;
    }
  }
});

test('AUD-06 (Report AUD-07) [NODE-VERIFIED]: sanitizeAlphaChannel enforces |delta alpha| <= 3, 2-bit LSB BER within 5-sigma of 0.5, and Poisson-Gaussian preserves zero RGB under alpha=0', async () => {
  const { sanitizeAlphaChannel, MAX_ALPHA_SANITIZATION_DELTA } = await import('../src/core/image/decontamination');
  const { applyPoissonGaussianNoise } = await import('../src/core/image/poisson-gaussian');

  const N = 8192; // >= 4096 bits per bit-plane (16384 bits across 2 LSB planes)
  const sigma = 0.5 / Math.sqrt(N);
  const tolSigma = 5;
  const prng = makeDeterministicPrng(0x5150abcd);
  const bit0 = new Uint8Array(N);
  const bit1 = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    bit0[i] = prng() >= 0.5 ? 1 : 0;
    bit1[i] = prng() >= 0.5 ? 1 : 0;
  }

  // Vector (b): Real transparency in [4..251] with 2-bit LSB payload
  const semi = new Uint8ClampedArray(N * 4);
  const semiOrigAlpha = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const idx = i << 2;
    semi[idx] = 100;
    semi[idx + 1] = 120;
    semi[idx + 2] = 140;
    const base4 = 4 + ((i % 62) * 4); // 4, 8, ..., 248 (always in [4..251])
    const a = base4 | (bit1[i] << 1) | bit0[i];
    semi[idx + 3] = a;
    semiOrigAlpha[i] = a;
  }

  const reportB = sanitizeAlphaChannel(semi, true);
  assert.equal(reportB.hasTransparency, true);
  assert.equal(reportB.pixelsDitheredAlpha, N);
  assert.ok(
    reportB.maxAbsAlphaDelta <= MAX_ALPHA_SANITIZATION_DELTA,
    `|delta alpha| ${reportB.maxAbsAlphaDelta} exceeded ${MAX_ALPHA_SANITIZATION_DELTA}`
  );

  let err0 = 0;
  let err1 = 0;
  for (let i = 0; i < N; i++) {
    const a = semi[(i << 2) + 3];
    assert.ok(a >= 4 && a <= 251);
    assert.ok(Math.abs(a - semiOrigAlpha[i]) <= MAX_ALPHA_SANITIZATION_DELTA);
    if ((a & 1) !== bit0[i]) err0++;
    if (((a >>> 1) & 1) !== bit1[i]) err1++;
  }
  const ber0 = err0 / N;
  const ber1 = err1 / N;
  assert.ok(Math.abs(ber0 - 0.5) <= tolSigma * sigma, `Bit-0 BER ${ber0.toFixed(4)} outside 5-sigma of 0.5`);
  assert.ok(Math.abs(ber1 - 0.5) <= tolSigma * sigma, `Bit-1 BER ${ber1.toFixed(4)} outside 5-sigma of 0.5`);

  // Vector (a): Visually opaque near-255 alpha (252..255) snaps cleanly to 255 with hasTransparency=false
  const nearOpaque = new Uint8ClampedArray(N * 4);
  for (let i = 0; i < N; i++) {
    const idx = i << 2;
    nearOpaque[idx] = 60;
    nearOpaque[idx + 1] = 70;
    nearOpaque[idx + 2] = 80;
    nearOpaque[idx + 3] = 252 | (bit1[i] << 1) | bit0[i];
  }
  const reportA = sanitizeAlphaChannel(nearOpaque, true);
  assert.equal(reportA.hasTransparency, false, 'Snapped visually opaque image should report hasTransparency=false');
  assert.ok(reportA.maxAbsAlphaDelta <= MAX_ALPHA_SANITIZATION_DELTA);
  for (let i = 3; i < nearOpaque.length; i += 4) {
    assert.equal(nearOpaque[i], 255);
  }

  // Vector (c): Near-transparent [0..3] snaps to 0 and zeros RGB; Poisson-Gaussian must not re-contaminate alpha=0
  const transparent = new Uint8ClampedArray(64 * 4);
  for (let i = 0; i < 64; i++) {
    const idx = i << 2;
    transparent[idx] = 200;
    transparent[idx + 1] = 150;
    transparent[idx + 2] = 100;
    transparent[idx + 3] = i % 4; // 0, 1, 2, 3
  }
  const reportC = sanitizeAlphaChannel(transparent, true);
  assert.equal(reportC.hasTransparency, true);
  assert.equal(reportC.pixelsZeroedRgb, 64);
  assert.ok(reportC.maxAbsAlphaDelta <= MAX_ALPHA_SANITIZATION_DELTA);

  applyPoissonGaussianNoise(transparent);
  for (let i = 0; i < transparent.length; i += 4) {
    assert.equal(transparent[i], 0);
    assert.equal(transparent[i + 1], 0);
    assert.equal(transparent[i + 2], 0);
    assert.equal(transparent[i + 3], 0);
  }
});

// =============================================================================
// AUD-16: Single finalization function so sha256, sanitizedName, sanitizedSize,
// and auditAfter derive from the exact final delivered bytes object.
// =============================================================================

test('AUD-16 [NODE-VERIFIED / MOCK-CONTRACT]: container-changing pipeline (PNG in -> RFC 9649 WebP out) derives sha256, sanitizedName, sanitizedSize, and auditAfter strictly from final delivered bytes', async () => {
  const { processMediaFile } = await import('../src/core/pipeline');
  const { computeSha256 } = await import('../src/core/forensic/hash-naming');

  const mocks = installImagePipelineDomMocks({ width: 16, height: 16 });
  try {
    // Minimal synthetic PNG input header -> pipeline re-synthesizes to unpadded RFC 9649 WebP
    const syntheticPng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00,
      0x1f, 0xf3, 0xff, 0x61,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const pngFile = new File([syntheticPng], 'input_photo.png', { type: 'image/png' });

    const result = await processMediaFile(pngFile, { defenseLevel: 'paranoid' });
    const deliveredBytes = new Uint8Array(await result.blob.arrayBuffer());
    const expectedSha256 = await computeSha256(deliveredBytes);

    assert.equal(result.format, 'image/webp', 'Output format must reflect delivered WebP container');
    assert.ok(result.sanitizedName.endsWith('.webp'), `Output extension must be .webp, got ${result.sanitizedName}`);
    assert.equal(result.sanitizedSize, deliveredBytes.byteLength, 'sanitizedSize must equal exact final delivered byteLength');
    assert.equal(result.sha256, expectedSha256, 'result.sha256 must match exact final delivered bytes');
    assert.equal(result.sanitizedName, `${expectedSha256.slice(0, 32)}.webp`, 'sanitizedName must derive from final delivered SHA-256');
    assert.equal(result.auditAfter.sha256, expectedSha256, 'auditAfter.sha256 must match final delivered bytes');
    assert.equal(result.auditAfter.fileSize, deliveredBytes.byteLength, 'auditAfter.fileSize must match final delivered byteLength');
    assert.equal(result.auditAfter.fileName, result.sanitizedName, 'auditAfter.fileName must match final sanitizedName');
    assert.equal(result.auditAfter.mimeType, 'image/webp', 'auditAfter.mimeType must reflect output WebP container');
    assert.ok(
      result.auditAfter.markers.some(m => m.marker === 'VP8'),
      'auditAfter.markers must inspect the final WebP output, not PNG input'
    );
  } finally {
    mocks.restore();
  }
});

test('AUD-16 [NODE-VERIFIED]: finalizeSanitizedOutput hashes exact non-zero byteOffset Uint8Array view and remains immutable against post-finalize source mutation', async () => {
  const { finalizeSanitizedOutput } = await import('../src/core/pipeline');
  const { computeSha256 } = await import('../src/core/forensic/hash-naming');

  const webpPayload = buildWebpContainer([
    buildWebpChunk('VP8 ', new Uint8Array([0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a])),
  ]);
  const expectedCopy = new Uint8Array(webpPayload); // Independent reference copy

  // Embed WebP bytes inside a larger backing buffer at non-zero offset with canary prefix/suffix
  const offset = 19;
  const backing = new Uint8Array(offset + webpPayload.length + 23);
  backing.fill(0xee);
  backing.set(webpPayload, offset);
  const view = backing.subarray(offset, offset + webpPayload.length);
  assert.equal(view.byteOffset, offset, 'Precondition: view must have non-zero byteOffset');
  assert.ok(view.buffer.byteLength > view.byteLength, 'Precondition: backing buffer larger than view');

  // Deliberately pass mismatched declaredMime ('image/png') to prove magic bytes win
  const finalized = await finalizeSanitizedOutput(view, 'image/png');

  const expectedViewSha = await computeSha256(expectedCopy);
  const fullBackingSha = await computeSha256(backing);
  assert.notEqual(expectedViewSha, fullBackingSha);

  assert.equal(finalized.sha256, expectedViewSha, 'Hash must cover view bytes only, never view.buffer');
  assert.equal(finalized.sanitizedSize, expectedCopy.byteLength);
  assert.equal(finalized.format, 'image/webp', 'Delivered container magic bytes must override stale declaredMime');
  assert.equal(finalized.sanitizedName, `${expectedViewSha.slice(0, 32)}.webp`);
  assert.equal(finalized.auditAfter.sha256, expectedViewSha);
  assert.equal(finalized.auditAfter.fileSize, expectedCopy.byteLength);
  assert.equal(finalized.auditAfter.fileName, finalized.sanitizedName);
  assert.equal(finalized.auditAfter.mimeType, 'image/webp');

  // Post-finalize immutability check: overwrite source view and backing buffer completely
  view.fill(0x00);
  backing.fill(0xff);

  const deliveredAfterMutation = new Uint8Array(await finalized.blob.arrayBuffer());
  assert.deepEqual(
    deliveredAfterMutation,
    expectedCopy,
    'Delivered blob bytes must remain identical to pre-mutation copy after caller mutates input buffer'
  );
  assert.equal(await computeSha256(deliveredAfterMutation), finalized.sha256);
  assert.equal(Object.isFrozen(finalized), true, 'Finalized metadata object must be frozen');
  assert.equal(Object.isFrozen(finalized.auditAfter), true, 'auditAfter report must be frozen');
});







