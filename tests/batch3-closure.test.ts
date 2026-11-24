import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(process.cwd());

function makeDeterministicPrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

// =============================================================================
// AUD-04: Remove dead 2048px tiling / intermediate PNG round-trip; raise
// internal DWT TILE_HALO from 8 to 16 and verify seam discontinuity reduction.
// =============================================================================

test('AUD-04 [NODE-VERIFIED]: DWT+Wiener seam discontinuity across x=511..512 is eliminated/reduced with TILE_HALO=16', async () => {
  const { applyWaveletPRNUAttenuation, CALIBRATED_MAX_DELTA_LUMA } = await import('../src/core/image/prnu-defense');

  // Deterministic 1024x64 RGBA image (two internal 512px tiles along X).
  // Places high-contrast checkerboard texture in x in [496..503] and [520..526]
  // (9..15 px from the x=511..512 tile seam: outside TILE_HALO=8, inside TILE_HALO=16),
  // plus tile-periodic deterministic noise so MAD sigma is identical across tiles and
  // the centered single-tile 512x64 reference (columns 256..767 -> seam at local x=255..256).
  const width = 1024;
  const height = 64;
  const tileNoise = new Int16Array(512 * height);
  const prng = makeDeterministicPrng(0x12345678);
  for (let i = 0; i < tileNoise.length; i++) {
    tileNoise[i] = Math.round((prng() - 0.5) * 20);
  }

  const fullImage = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inOuterBand = (x >= 520 && x <= 526) || (x >= 496 && x <= 503);
      const base = inOuterBand ? ((x + y) % 2 === 0 ? 255 : 0) : 128;
      const val = Math.max(0, Math.min(255, base + tileNoise[y * 512 + (x % 512)]));
      const idx = (y * width + x) * 4;
      fullImage[idx] = val;
      fullImage[idx + 1] = val;
      fullImage[idx + 2] = val;
      fullImage[idx + 3] = 255;
    }
  }

  // Centered single-tile reference: columns [256 .. 768), width = 512 (no internal X seam)
  const refW = 512;
  const refCrop = new Uint8ClampedArray(refW * height * 4);
  for (let y = 0; y < height; y++) {
    for (let rx = 0; rx < refW; rx++) {
      const srcIdx = (y * width + (256 + rx)) * 4;
      const dstIdx = (y * refW + rx) * 4;
      refCrop[dstIdx] = fullImage[srcIdx];
      refCrop[dstIdx + 1] = fullImage[srcIdx + 1];
      refCrop[dstIdx + 2] = fullImage[srcIdx + 2];
      refCrop[dstIdx + 3] = 255;
    }
  }

  const tiledOut = new Uint8ClampedArray(fullImage);
  const refOut = new Uint8ClampedArray(refCrop);

  applyWaveletPRNUAttenuation(tiledOut, width, height, 'db4', 1.25, CALIBRATED_MAX_DELTA_LUMA);
  applyWaveletPRNUAttenuation(refOut, refW, height, 'db4', 1.25, CALIBRATED_MAX_DELTA_LUMA);

  // Measure seam discrepancy across x = 511..512 on interior rows y in [16..48)
  let maxSeamError = 0;
  let sumAbsSeamError = 0;
  let seamSamples = 0;
  let mismatchedSeamPixels = 0;

  for (let y = 16; y < height - 16; y++) {
    for (let x = 511; x <= 512; x++) {
      const tiledIdx = (y * width + x) * 4;
      const refIdx = (y * refW + (x - 256)) * 4;
      const diff = Math.abs(tiledOut[tiledIdx] - refOut[refIdx]);
      if (diff > maxSeamError) maxSeamError = diff;
      if (diff > 0) mismatchedSeamPixels++;
      sumAbsSeamError += diff;
      seamSamples++;
    }
  }

  const meanSeamError = sumAbsSeamError / seamSamples;
  assert.ok(
    maxSeamError <= 1 && meanSeamError <= 0.1 && mismatchedSeamPixels <= 4,
    `DWT tile seam discontinuity across x=511..512 too large: maxErr=${maxSeamError}, meanErr=${meanSeamError.toFixed(6)}, mismatched=${mismatchedSeamPixels}/${seamSamples}`
  );
});

test('AUD-04 [NODE-VERIFIED]: dead 2048px outer tile loop and intermediate PNG round-trip are removed from image.worker.ts and image-sanitizer.ts', () => {
  const workerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'core', 'workers', 'image.worker.ts'), 'utf8');
  const sanitizerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'core', 'image', 'image-sanitizer.ts'), 'utf8');

  assert.equal(workerSrc.includes('TILE_SIZE = 2048'), false, 'image.worker.ts must not retain dead TILE_SIZE = 2048');
  assert.equal(sanitizerSrc.includes('TILE_SIZE = 2048'), false, 'image-sanitizer.ts must not retain dead TILE_SIZE = 2048');
  assert.equal(workerSrc.includes("type: 'image/png'"), false, 'image.worker.ts must not perform intermediate PNG encode/decode');
  assert.equal(sanitizerSrc.includes("'image/png'"), false, 'image-sanitizer.ts must not perform intermediate PNG encode/decode');
  assert.equal(workerSrc.includes('tileCanvas'), false, 'image.worker.ts must not allocate redundant tileCanvas');
  assert.equal(sanitizerSrc.includes('tileCanvas'), false, 'image-sanitizer.ts must not allocate redundant tileCanvas');
});

// =============================================================================
// AUD-18: Remove JUNK chunk and Padme-H container padding across WebP and
// MP4/MOV pipelines; delete src/core/forensic/crypto-padding.ts.
// =============================================================================

function walkSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkSourceFiles(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function buildMinimalValidMp4(): Uint8Array {
  return new Uint8Array([
    // ftyp (16 bytes)
    0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    // moov (88 bytes: 8 header + 80 trak)
    0x00, 0x00, 0x00, 0x58, 0x6d, 0x6f, 0x6f, 0x76,
    // trak (80 bytes: 8 header + 72 mdia)
    0x00, 0x00, 0x00, 0x50, 0x74, 0x72, 0x61, 0x6b,
    // mdia (72 bytes: 8 header + 32 mdhd + 32 hdlr)
    0x00, 0x00, 0x00, 0x48, 0x6d, 0x64, 0x69, 0x61,
    // mdhd (32 bytes, v0)
    0x00, 0x00, 0x00, 0x20, 0x6d, 0x64, 0x68, 0x64, 0x00, 0x00, 0x00, 0x00,
    0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
    0x00, 0x00, 0x03, 0xe8, 0x00, 0x00, 0x00, 0x64, 0x00, 0x01, 0x00, 0x00,
    // hdlr (32 bytes, vide)
    0x00, 0x00, 0x00, 0x20, 0x68, 0x64, 0x6c, 0x72, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x76, 0x69, 0x64, 0x65, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // mdat (16 bytes)
    0x00, 0x00, 0x00, 0x10, 0x6d, 0x64, 0x61, 0x74,
    0x00, 0x00, 0x00, 0x04, 0x65, 0x88, 0x84, 0x00,
  ]);
}

test('AUD-18 [NODE-VERIFIED]: crypto-padding.ts and all Padme-H references are deleted from src/', () => {
  const paddingPath = path.join(REPO_ROOT, 'src', 'core', 'forensic', 'crypto-padding.ts');
  assert.equal(fs.existsSync(paddingPath), false, 'src/core/forensic/crypto-padding.ts must be deleted');

  const srcFiles = walkSourceFiles(path.join(REPO_ROOT, 'src'));
  const badRefs: string[] = [];
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('crypto-padding') || content.includes('applyCryptographicPadding') || content.includes('computeDynamicPaddedSize')) {
      badRefs.push(path.relative(REPO_ROOT, file));
    }
  }
  assert.deepEqual(badRefs, [], `Found stale crypto-padding references in src/: ${badRefs.join(', ')}`);
});

test('AUD-18 [NODE-VERIFIED / MOCK-CONTRACT]: WebP output strictly conforms to RFC 9649 (zero JUNK chunk) and MP4 emits no artificial padding box', async () => {
  const { processMediaFile } = await import('../src/core/pipeline');
  const { computeSha256 } = await import('../src/core/forensic/hash-naming');

  // 1. MP4: must preserve exact byte size with zero appended Padme-H free box
  const mp4Bytes = buildMinimalValidMp4();
  const mp4File = new File([mp4Bytes], 'clip.mp4', { type: 'video/mp4' });
  const mp4Result = await processMediaFile(mp4File, { defenseLevel: 'paranoid' });
  const deliveredMp4 = new Uint8Array(await mp4Result.blob.arrayBuffer());
  assert.equal(deliveredMp4.byteLength, mp4Bytes.byteLength, 'MP4 must not append Padme-H padding box');
  assert.equal(mp4Result.sanitizedSize, deliveredMp4.byteLength);
  assert.equal(mp4Result.sha256, await computeSha256(deliveredMp4));

  // 2. WebP via image pipeline (mock DOM): zero JUNK chunk, RFC 9649 RIFF size exact, finalization exact
  const origCreateImageBitmap = (globalThis as Record<string, unknown>).createImageBitmap;
  const origDocument = (globalThis as Record<string, unknown>).document;
  const origOffscreen = (globalThis as Record<string, unknown>).OffscreenCanvas;

  const vp8Payload = new Uint8Array([0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x10, 0x00, 0x10, 0x00]);
  const rawWebp = new Uint8Array(12 + 8 + vp8Payload.length);
  const rv = new DataView(rawWebp.buffer);
  rawWebp.set([0x52, 0x49, 0x46, 0x46], 0);
  rv.setUint32(4, 4 + 8 + vp8Payload.length, true);
  rawWebp.set([0x57, 0x45, 0x42, 0x50], 8);
  rawWebp.set([0x56, 0x50, 0x38, 0x20], 12);
  rv.setUint32(16, vp8Payload.length, true);
  rawWebp.set(vp8Payload, 20);

  const makeMockCanvas = (w = 16, h = 16) => {
    const buf = new Uint8ClampedArray(w * h * 4).fill(128);
    const canvas: any = {
      width: w,
      height: h,
      getContext(kind: string) {
        if (kind === 'webgl2' || kind === 'webgl' || kind === 'experimental-webgl') return null;
        return {
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
          clearRect() {},
          drawImage() {},
          getImageData: (_x: number, _y: number, gw: number, gh: number) => ({
            width: gw,
            height: gh,
            data: new Uint8ClampedArray(gw * gh * 4).fill(128),
          }),
          createImageData: (gw: number, gh: number) => ({
            width: gw,
            height: gh,
            data: new Uint8ClampedArray(gw * gh * 4),
          }),
          putImageData() {},
        };
      },
      toBlob(cb: (b: Blob | null) => void, mime: string) {
        cb(new Blob([rawWebp], { type: mime }));
      },
      async convertToBlob(cfg?: { type?: string }) {
        return new Blob([rawWebp], { type: cfg?.type ?? 'image/webp' });
      },
    };
    void buf;
    return canvas;
  };

  (globalThis as Record<string, unknown>).createImageBitmap = async () => ({
    width: 16,
    height: 16,
    close() {},
  });
  (globalThis as Record<string, unknown>).document = {
    createElement: () => makeMockCanvas(16, 16),
  };
  (globalThis as Record<string, unknown>).OffscreenCanvas = class {
    width: number;
    height: number;
    _c: any;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this._c = makeMockCanvas(w, h);
    }
    getContext(k: string) { return this._c.getContext(k); }
    convertToBlob(cfg?: { type?: string }) { return this._c.convertToBlob(cfg); }
  };

  try {
    const syntheticPng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00,
      0x1f, 0xf3, 0xff, 0x61,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const pngFile = new File([syntheticPng], 'photo.png', { type: 'image/png' });
    const imgResult = await processMediaFile(pngFile, { defenseLevel: 'paranoid' });
    const deliveredWebp = new Uint8Array(await imgResult.blob.arrayBuffer());

    // Strict RFC 9649 Simple WebP: RIFF + WEBP + VP8 only, zero JUNK chunk
    assert.equal(deliveredWebp.byteLength, rawWebp.byteLength, 'Simple WebP must have exact unpadded RFC 9649 byte length');
    const dv = new DataView(deliveredWebp.buffer, deliveredWebp.byteOffset, deliveredWebp.byteLength);
    assert.equal(dv.getUint32(4, true), deliveredWebp.byteLength - 8, 'RIFF chunk size must equal totalLength - 8');
    const ascii = new TextDecoder().decode(deliveredWebp);
    assert.equal(ascii.includes('JUNK'), false, 'WebP output must never contain a JUNK chunk');

    const expectedSha = await computeSha256(deliveredWebp);
    assert.equal(imgResult.sha256, expectedSha);
    assert.equal(imgResult.sanitizedSize, deliveredWebp.byteLength);
    assert.equal(imgResult.sanitizedName, `${expectedSha.slice(0, 32)}.webp`);
    assert.equal(imgResult.auditAfter.sha256, expectedSha);
    assert.equal(imgResult.auditAfter.fileSize, deliveredWebp.byteLength);
    assert.deepEqual(imgResult.auditAfter.markers.map(m => m.marker), ['VP8']);
  } finally {
    if (origCreateImageBitmap === undefined) delete (globalThis as Record<string, unknown>).createImageBitmap;
    else (globalThis as Record<string, unknown>).createImageBitmap = origCreateImageBitmap;
    if (origDocument === undefined) delete (globalThis as Record<string, unknown>).document;
    else (globalThis as Record<string, unknown>).document = origDocument;
    if (origOffscreen === undefined) delete (globalThis as Record<string, unknown>).OffscreenCanvas;
    else (globalThis as Record<string, unknown>).OffscreenCanvas = origOffscreen;
  }
});

// =============================================================================
// IMAGE_PARSER_AND_CLEANUP:
// 1. Remove dead wasmEncoded property
// 2. Harden marker-parser.ts (JPEG standalone/fill/stuffing, MP4 boxSize 0/1/invalid/moov)
// 3. Fail-closed pre-decode image header dimension parser & decompression-bomb guard
// 4. ZIP cascading filename deduplication before assertZipFits
// =============================================================================

test('IMAGE_PARSER_AND_CLEANUP [NODE-VERIFIED]: dead wasmEncoded property is removed from src/ and types', () => {
  const srcFiles = walkSourceFiles(path.join(REPO_ROOT, 'src'));
  const refs: string[] = [];
  for (const file of srcFiles) {
    if (fs.readFileSync(file, 'utf8').includes('wasmEncoded')) {
      refs.push(path.relative(REPO_ROOT, file));
    }
  }
  assert.deepEqual(refs, [], `Found stale wasmEncoded references in src/: ${refs.join(', ')}`);
});

test('IMAGE_PARSER_AND_CLEANUP [NODE-VERIFIED]: marker-parser handles JPEG standalone markers, fill bytes, SOS byte-stuffing/RST, and MP4 boxSize 0/1/invalid/moov', async () => {
  const { inspectBinaryMarkers } = await import('../src/core/forensic/marker-parser');

  // 1. JPEG with repeated 0xFF fill bytes, TEM (0xFF01), APP1 EXIF, SOS with length header + 0xFF00 byte-stuffing + RST0..RST7 + 0xFF fill + EOI
  const jpegBytes = new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xff, 0xff, 0x01, // fill bytes + TEM (standalone, lengthless)
    0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // APP1 Exif (len=8)
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, // SOS (header len=8)
    // Entropy-coded scan data with 0xFF00 stuffing, RST0 (0xFFD0), RST7 (0xFFD7), fill 0xFF 0xFF 0xD1 (RST1)
    0xaa, 0xff, 0x00, 0xbb, 0xff, 0xd0, 0xcc, 0xff, 0xd7, 0xff, 0xff, 0xd1, 0xdd,
    // EOI preceded by fill byte
    0xff, 0xff, 0xd9,
  ]);
  const jpegMarkers = inspectBinaryMarkers(jpegBytes.buffer);
  assert.ok(jpegMarkers.some(m => m.marker === '0xFFD8'), 'SOI detected');
  assert.ok(jpegMarkers.some(m => m.marker === '0xFFE1'), 'APP1 after TEM + fill bytes must be detected');
  assert.ok(jpegMarkers.some(m => m.marker === '0xFFDA'), 'SOS detected');
  assert.ok(jpegMarkers.some(m => m.marker === '0xFFD9'), 'EOI after RST0/RST7/0xFF00 scan data must be detected');
  // Must NOT misinterpret RST0/RST1/RST7 or 0xFF00 inside entropy scan as length-bearing segments
  assert.equal(jpegMarkers.some(m => m.marker === '0xFFD0' || m.marker === '0xFFD7' || m.marker === '0xFFD1'), false, 'RST markers inside SOS scan must not emit spurious segments');

  // 2. MP4 with boxSize === 1 (64-bit largesize ftyp), moov containing nested udta + meta, and boxSize === 0 (mdat to EOF)
  const mp4 = new Uint8Array(24 + 40 + 16);
  const mv = new DataView(mp4.buffer);
  // Box 0: ftyp with boxSize === 1, 64-bit largesize = 24
  mv.setUint32(0, 1, false);
  mp4.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
  mv.setBigUint64(8, 24n, false);
  mp4.set([0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00], 16);
  // Box 1: moov (40 bytes: 8 header + 16 udta + 16 meta)
  mv.setUint32(24, 40, false);
  mp4.set([0x6d, 0x6f, 0x6f, 0x76], 28); // moov
  mv.setUint32(32, 16, false);
  mp4.set([0x75, 0x64, 0x74, 0x61], 36); // udta inside moov
  mv.setUint32(48, 16, false);
  mp4.set([0x6d, 0x65, 0x74, 0x61], 52); // meta inside moov
  // Box 2: mdat with boxSize === 0 (extends to EOF)
  mv.setUint32(64, 0, false);
  mp4.set([0x6d, 0x64, 0x61, 0x74], 68); // mdat

  const mp4Markers = inspectBinaryMarkers(mp4.buffer);
  assert.ok(mp4Markers.some(m => m.marker === 'ftyp' && m.length === 24), '64-bit largesize ftyp must be parsed');
  assert.ok(mp4Markers.some(m => m.marker === 'moov'), 'moov after 64-bit ftyp must be parsed');
  assert.ok(mp4Markers.some(m => m.marker === 'udta' && !m.isSanitizedSafe), 'nested udta inside moov must be detected');
  assert.ok(mp4Markers.some(m => m.marker === 'meta' && !m.isSanitizedSafe), 'nested meta inside moov must be detected');
  const mdatMarker = mp4Markers.find(m => m.marker === 'mdat');
  assert.ok(mdatMarker && mdatMarker.length === 16, 'boxSize===0 mdat must resolve length to container EOF without looping');

  // 3. Malformed MP4 with invalid boxSize (2..7), truncated largesize (<16), and huge largesize must terminate safely without throwing
  const malformedBoxes = [
    // invalid boxSize = 4 after valid ftyp
    new Uint8Array([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 0, 0, 0, 0, 0, 4, 0x6d, 0x6f, 0x6f, 0x76]),
    // truncated boxSize = 1 with only 12 bytes remaining
    new Uint8Array([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 0, 0, 0, 0, 0, 1, 0x6d, 0x6f, 0x6f, 0x76, 0, 0, 0, 0]),
    // largesize < 16 (e.g. 8)
    new Uint8Array([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 0, 0, 0, 0, 0, 1, 0x6d, 0x6f, 0x6f, 0x76, 0, 0, 0, 0, 0, 0, 0, 8]),
  ];
  for (const bad of malformedBoxes) {
    assert.doesNotThrow(() => inspectBinaryMarkers(bad.buffer));
  }
});

test('IMAGE_PARSER_AND_CLEANUP [NODE-VERIFIED / MOCK-CONTRACT]: pre-decode image header parser parses all 6 formats, blocks decompression bombs, and fails closed BEFORE createImageBitmap', async () => {
  const {
    parseImageHeaderDimensions,
    assertSafeImageDimensions,
    ImageDecompressionGuardError,
    MAX_IMAGE_DIMENSION,
    MAX_IMAGE_PIXELS,
  } = await import('../src/core/image/image-header-guard');
  const { processImageWorkerJob } = await import('../src/core/workers/image.worker');
  const { sanitizeImage } = await import('../src/core/image/image-sanitizer');

  assert.ok(Number.isSafeInteger(MAX_IMAGE_DIMENSION) && MAX_IMAGE_DIMENSION >= 4096);
  assert.ok(Number.isSafeInteger(MAX_IMAGE_PIXELS) && MAX_IMAGE_PIXELS >= 16_000_000);

  // Build valid headers for all 6 supported formats: PNG, JPEG, WebP (VP8, VP8L, VP8X), GIF, BMP, TIFF
  const makePngHeader = (w: number, h: number) => {
    const b = new Uint8Array(24);
    b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 0);
    const dv = new DataView(b.buffer);
    dv.setUint32(16, w, false);
    dv.setUint32(20, h, false);
    return b;
  };
  const makeJpegHeader = (w: number, h: number) => {
    const b = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xc0, 0x00, 0x0b, 0x08,
      (h >> 8) & 0xff, h & 0xff,
      (w >> 8) & 0xff, w & 0xff,
      0x01, 0x01, 0x11, 0x00,
      0xff, 0xd9,
    ]);
    return b;
  };
  const makeWebpVp8x = (w: number, h: number) => {
    const b = new Uint8Array(30);
    const dv = new DataView(b.buffer);
    b.set([0x52, 0x49, 0x46, 0x46], 0);
    dv.setUint32(4, 22, true);
    b.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58], 8);
    dv.setUint32(16, 10, true);
    const wm1 = w - 1;
    const hm1 = h - 1;
    b[24] = wm1 & 0xff; b[25] = (wm1 >> 8) & 0xff; b[26] = (wm1 >> 16) & 0xff;
    b[27] = hm1 & 0xff; b[28] = (hm1 >> 8) & 0xff; b[29] = (hm1 >> 16) & 0xff;
    return b;
  };
  const makeWebpVp8 = (w: number, h: number) => {
    const b = new Uint8Array(30);
    const dv = new DataView(b.buffer);
    b.set([0x52, 0x49, 0x46, 0x46], 0);
    dv.setUint32(4, 22, true);
    b.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20], 8);
    dv.setUint32(16, 10, true);
    b[20] = 0x30; b[23] = 0x9d; b[24] = 0x01; b[25] = 0x2a;
    dv.setUint16(26, w & 0x3fff, true);
    dv.setUint16(28, h & 0x3fff, true);
    return b;
  };
  const makeWebpVp8l = (w: number, h: number) => {
    const b = new Uint8Array(25);
    const dv = new DataView(b.buffer);
    b.set([0x52, 0x49, 0x46, 0x46], 0);
    dv.setUint32(4, 17, true);
    b.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4c], 8);
    dv.setUint32(16, 5, true);
    b[20] = 0x2f;
    const bits = (((w - 1) & 0x3fff) | (((h - 1) & 0x3fff) << 14)) >>> 0;
    dv.setUint32(21, bits, true);
    return b;
  };
  const makeGifHeader = (w: number, h: number) => {
    const b = new Uint8Array(10);
    b.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 0);
    const dv = new DataView(b.buffer);
    dv.setUint16(6, w, true);
    dv.setUint16(8, h, true);
    return b;
  };
  const makeBmpHeader = (w: number, h: number) => {
    const b = new Uint8Array(26);
    const dv = new DataView(b.buffer);
    b[0] = 0x42; b[1] = 0x4d;
    dv.setUint32(14, 40, true);
    dv.setInt32(18, w, true);
    dv.setInt32(22, -h, true); // top-down negative height
    return b;
  };
  const makeTiffHeader = (w: number, h: number) => {
    const b = new Uint8Array(8 + 2 + 24 + 4);
    const dv = new DataView(b.buffer);
    b.set([0x49, 0x49, 0x2a, 0x00], 0); // II little-endian
    dv.setUint32(4, 8, true); // IFD0 at offset 8
    dv.setUint16(8, 2, true); // 2 entries
    // Entry 0: ImageWidth (0x0100), LONG (4), count 1, value w
    dv.setUint16(10, 0x0100, true); dv.setUint16(12, 4, true); dv.setUint32(14, 1, true); dv.setUint32(18, w, true);
    // Entry 1: ImageLength (0x0101), LONG (4), count 1, value h
    dv.setUint16(22, 0x0101, true); dv.setUint16(24, 4, true); dv.setUint32(26, 1, true); dv.setUint32(30, h, true);
    return b;
  };

  assert.deepEqual(parseImageHeaderDimensions(makePngHeader(800, 600)), { format: 'png', width: 800, height: 600 });
  assert.deepEqual(parseImageHeaderDimensions(makeJpegHeader(1200, 900)), { format: 'jpeg', width: 1200, height: 900 });
  assert.deepEqual(parseImageHeaderDimensions(makeWebpVp8x(640, 480)), { format: 'webp', width: 640, height: 480 });
  assert.deepEqual(parseImageHeaderDimensions(makeWebpVp8(320, 240)), { format: 'webp', width: 320, height: 240 });
  assert.deepEqual(parseImageHeaderDimensions(makeWebpVp8l(512, 256)), { format: 'webp', width: 512, height: 256 });
  assert.deepEqual(parseImageHeaderDimensions(makeGifHeader(100, 200)), { format: 'gif', width: 100, height: 200 });
  assert.deepEqual(parseImageHeaderDimensions(makeBmpHeader(400, 300)), { format: 'bmp', width: 400, height: 300 });
  assert.deepEqual(parseImageHeaderDimensions(makeTiffHeader(1024, 768)), { format: 'tiff', width: 1024, height: 768 });

  // Bomb rejection: dimension limit and pixel-count limit
  assert.throws(
    () => assertSafeImageDimensions(makePngHeader(MAX_IMAGE_DIMENSION + 1, 10)),
    (err: unknown) => err instanceof ImageDecompressionGuardError && err.code === 'IMAGE_DIMENSION_LIMIT_EXCEEDED'
  );
  assert.throws(
    () => assertSafeImageDimensions(makePngHeader(12000, 12000)),
    (err: unknown) => err instanceof ImageDecompressionGuardError && err.code === 'IMAGE_PIXEL_COUNT_LIMIT_EXCEEDED'
  );
  // Fail-closed on garbage / truncated / unrecognized headers
  assert.throws(
    () => assertSafeImageDimensions(new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0x01, 0x02, 0x03])),
    (err: unknown) => err instanceof ImageDecompressionGuardError && err.code === 'UNSUPPORTED_OR_INVALID_IMAGE_HEADER'
  );
  assert.throws(
    () => assertSafeImageDimensions(new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
    (err: unknown) => err instanceof ImageDecompressionGuardError && err.code === 'UNSUPPORTED_OR_INVALID_IMAGE_HEADER'
  );

  // Verify createImageBitmap is NEVER called in worker or main-thread when bomb or invalid header is submitted
  const origCreateImageBitmap = (globalThis as Record<string, unknown>).createImageBitmap;
  let decodeCalls = 0;
  (globalThis as Record<string, unknown>).createImageBitmap = async () => {
    decodeCalls++;
    return { width: 16, height: 16, close() {} };
  };
  try {
    const bombPng = makePngHeader(30000, 30000);
    await assert.rejects(
      () => processImageWorkerJob({
        buffer: bombPng.buffer.slice(0),
        mimeType: 'image/png',
        options: { defenseLevel: 'paranoid' },
        needsAlpha: true,
      }),
      (err: unknown) => err instanceof ImageDecompressionGuardError
    );
    await assert.rejects(
      () => sanitizeImage(new File([bombPng], 'bomb.png', { type: 'image/png' }), { defenseLevel: 'paranoid', outputFormat: 'image/webp' }),
      (err: unknown) => err instanceof ImageDecompressionGuardError
    );
    await assert.rejects(
      () => sanitizeImage(new File([new Uint8Array([0x01, 0x02, 0x03, 0x04])], 'malformed.jpg', { type: 'image/jpeg' }), { defenseLevel: 'paranoid', outputFormat: 'image/webp' }),
      (err: unknown) => err instanceof ImageDecompressionGuardError
    );
    assert.equal(decodeCalls, 0, 'createImageBitmap must NEVER be invoked on bombs or malformed headers');
  } finally {
    if (origCreateImageBitmap === undefined) delete (globalThis as Record<string, unknown>).createImageBitmap;
    else (globalThis as Record<string, unknown>).createImageBitmap = origCreateImageBitmap;
  }
});

test('IMAGE_PARSER_AND_CLEANUP [NODE-VERIFIED]: ZIP export deduplicates cascading colliding filenames BEFORE assertZipFits', async () => {
  const { deduplicateZipEntryNames, createSanitizedZipBundle, ZipSizeLimitError, ZIP_MAX_FILENAME_LENGTH } = await import('../src/core/utils/zip-export');

  // 1. Cascading collisions must produce strictly distinct names
  const seq1 = deduplicateZipEntryNames(['a.webp', 'a.webp', 'a-2.webp']);
  assert.equal(seq1.length, 3);
  assert.equal(new Set(seq1.map(n => n.toLowerCase())).size, 3, `Expected 3 distinct names, got ${JSON.stringify(seq1)}`);

  const seq2 = deduplicateZipEntryNames(['a-2.webp', 'a.webp', 'a.webp', 'a-3.webp']);
  assert.equal(seq2.length, 4);
  assert.equal(new Set(seq2.map(n => n.toLowerCase())).size, 4, `Expected 4 distinct names, got ${JSON.stringify(seq2)}`);

  // 2. Real ZIP archive contains strictly distinct Central Directory / Local Header filenames
  const dummyAudit = { fileName: '', fileSize: 0, mimeType: 'image/webp', hasExif: false, hasGps: false, hasThumbnail: false, hasMakerNotes: false, tags: [], markers: [], prnuSusceptibility: 'low' as const, sha256: '' };
  const makeItem = (name: string, payload: string) => ({
    blob: new Blob([payload], { type: 'image/webp' }),
    originalName: name,
    sanitizedName: name,
    originalSize: payload.length,
    sanitizedSize: payload.length,
    format: 'image/webp',
    sha256: '0'.repeat(64),
    defenseLevel: 'paranoid' as const,
    auditBefore: dummyAudit,
    auditAfter: dummyAudit,
    processedAt: 0,
  });

  const { zipBlob } = await createSanitizedZipBundle([
    makeItem('dup.webp', 'one'),
    makeItem('dup.webp', 'two'),
    makeItem('dup-2.webp', 'three'),
  ]);
  const zBytes = new Uint8Array(await zipBlob.arrayBuffer());
  const zView = new DataView(zBytes.buffer);
  const extractedNames: string[] = [];
  let pos = 0;
  while (pos + 30 <= zBytes.length && zView.getUint32(pos, true) === 0x04034b50) {
    const nameLen = zView.getUint16(pos + 26, true);
    const extraLen = zView.getUint16(pos + 28, true);
    const dataLen = zView.getUint32(pos + 18, true);
    extractedNames.push(new TextDecoder().decode(zBytes.subarray(pos + 30, pos + 30 + nameLen)));
    pos += 30 + nameLen + extraLen + dataLen;
  }
  assert.equal(extractedNames.length, 3);
  assert.equal(new Set(extractedNames).size, 3, `ZIP local headers must have 3 distinct names, got ${JSON.stringify(extractedNames)}`);

  // 3. Deduplication runs strictly BEFORE assertZipFits: colliding max-length filename expands past 0xFFFF and rejects BEFORE reading blobs
  let blobRead = false;
  const maxName = 'x'.repeat(ZIP_MAX_FILENAME_LENGTH - 5) + '.webp'; // exact 65535 bytes
  const fakeBlob = {
    size: 4,
    type: 'image/webp',
    async arrayBuffer() {
      blobRead = true;
      return new ArrayBuffer(4);
    },
  } as unknown as Blob;
  await assert.rejects(
    () => createSanitizedZipBundle([
      { ...makeItem(maxName, '1'), blob: fakeBlob },
      { ...makeItem(maxName, '2'), blob: fakeBlob },
    ]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'FILENAME_TOO_LONG'
  );
  assert.equal(blobRead, false, 'assertZipFits must reject deduplication-expanded filename BEFORE reading any blob');
});

// =============================================================================
// AUDIO_DEPRECATION: Delete enf-filter.ts and all standalone audio paths;
// explicitly reject MP3, WAV, OGG, FLAC, AAC, M4A at the pipeline/media/UI boundaries.
// =============================================================================

test('AUDIO_DEPRECATION [NODE-VERIFIED]: enf-filter.ts, ID3 stripping, and audio UI acceptance are removed', () => {
  assert.equal(
    fs.existsSync(path.join(REPO_ROOT, 'src', 'core', 'media', 'enf-filter.ts')),
    false,
    'src/core/media/enf-filter.ts must be deleted'
  );

  const srcFiles = walkSourceFiles(path.join(REPO_ROOT, 'src'));
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(content.includes('enf-filter'), false, `${file} must not reference enf-filter`);
    assert.equal(content.includes('sanitizeAudioHeadersZeroCopy'), false, `${file} must not retain ID3 audio stripper`);
    assert.equal(content.includes('enfFiltered'), false, `${file} must not retain enfFiltered`);
  }

  const dropzoneSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'ui', 'components', 'dropzone.ts'), 'utf8');
  assert.equal(dropzoneSrc.includes('audio/*'), false, 'dropzone accept attribute must not include audio/*');
  for (const ext of ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']) {
    assert.equal(dropzoneSrc.toLowerCase().includes(ext), false, `dropzone must not advertise ${ext}`);
  }
  assert.equal(/\baudio\b/i.test(dropzoneSrc), false, 'dropzone copy must not claim standalone audio support');
});

test('AUDIO_DEPRECATION [NODE-VERIFIED]: all 6 standalone audio formats (MP3, WAV, OGG, FLAC, AAC, M4A) are explicitly rejected with typed error', async () => {
  const { processMediaFile } = await import('../src/core/pipeline');
  const { sanitizeMedia, sanitizeMediaWithWorker, UnsupportedMediaFormatError } = await import('../src/core/media/media-sanitizer');

  const audioFixtures = [
    { name: 'voice.mp3', mime: 'audio/mpeg', bytes: new Uint8Array([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xfb, 0x90, 0x00]) },
    { name: 'recording.wav', mime: 'audio/wav', bytes: new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20]) },
    { name: 'clip.ogg', mime: 'audio/ogg', bytes: new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]) },
    { name: 'lossless.flac', mime: 'audio/flac', bytes: new Uint8Array([0x66, 0x4c, 0x61, 0x43, 0x00, 0x00, 0x00, 0x22, 0x10, 0x00, 0x10, 0x00]) },
    { name: 'stream.aac', mime: 'audio/aac', bytes: new Uint8Array([0xff, 0xf1, 0x50, 0x80, 0x02, 0x1f, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00]) },
    { name: 'memo.m4a', mime: 'audio/mp4', bytes: new Uint8Array([0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x34, 0x41, 0x20]) },
  ];

  for (const fx of audioFixtures) {
    const file = new File([fx.bytes], fx.name, { type: fx.mime });
    await assert.rejects(
      () => processMediaFile(file),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'AUDIO_UNSUPPORTED',
      `processMediaFile must reject ${fx.name} (${fx.mime}) with UnsupportedMediaFormatError(AUDIO_UNSUPPORTED)`
    );
    await assert.rejects(
      () => sanitizeMedia(file, { defenseLevel: 'paranoid' }),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'AUDIO_UNSUPPORTED',
      `sanitizeMedia must reject ${fx.name} (${fx.mime}) with UnsupportedMediaFormatError(AUDIO_UNSUPPORTED)`
    );
    await assert.rejects(
      () => sanitizeMediaWithWorker(fx.bytes.buffer.slice(0), fx.mime, fx.name),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'AUDIO_UNSUPPORTED',
      `sanitizeMediaWithWorker must reject ${fx.name} (${fx.mime}) with UnsupportedMediaFormatError(AUDIO_UNSUPPORTED)`
    );

    // Also test empty MIME (extension-only detection)
    const fileNoMime = new File([fx.bytes], fx.name, { type: '' });
    await assert.rejects(
      () => processMediaFile(fileNoMime),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'AUDIO_UNSUPPORTED',
      `processMediaFile must reject ${fx.name} even with empty MIME`
    );
  }
});

// =============================================================================
// VIDEO_SECONDARY (AUD-09, AUD-10, AUD-11, AUD-12, AUD-14, AUD-15, AUD-16):
// Playable in-memory MP4/MOV container metadata sanitization without bitstream
// re-encoding; delete webcodecs-resynthesizer.ts and encrypted-stream.ts;
// explicit MKV/WebM rejection; exact full-file SHA-256; exact worker slice transfer.
// =============================================================================

function makeBox(type: string, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(8 + payload.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, out.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(payload, 8);
  return out;
}

function makeLargeBox(type: string, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(16 + payload.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 1, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  dv.setBigUint64(8, BigInt(out.length), false);
  out.set(payload, 16);
  return out;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

function buildRichMp4Fixture(opts: { version: 0 | 1; mdatSizeZero?: boolean; useLargeMoov?: boolean; mdatPayload?: Uint8Array }): {
  bytes: Uint8Array;
  mdatOffset: number;
  mdatPayload: Uint8Array;
  timescale: number;
  duration: bigint;
  trackId: number;
} {
  const enc = new TextEncoder();
  const timescale = 90000;
  const duration = opts.version === 1 ? 0x00000001_23456789n : 0x000abcden;
  const trackId = 7;

  // mvhd (v0 or v1)
  const mvhdPayload = new Uint8Array(opts.version === 1 ? 108 : 96);
  const mvhdDv = new DataView(mvhdPayload.buffer);
  mvhdPayload[0] = opts.version;
  if (opts.version === 0) {
    mvhdDv.setUint32(4, 0x11223344, false); // creation_time
    mvhdDv.setUint32(8, 0x55667788, false); // modification_time
    mvhdDv.setUint32(12, timescale, false);
    mvhdDv.setUint32(16, Number(duration), false);
  } else {
    mvhdDv.setBigUint64(4, 0x00000001_11223344n, false); // creation_time
    mvhdDv.setBigUint64(12, 0x00000002_55667788n, false); // modification_time
    mvhdDv.setUint32(20, timescale, false);
    mvhdDv.setBigUint64(24, duration, false);
  }
  const mvhd = makeBox('mvhd', mvhdPayload);

  // tkhd (v0 or v1)
  const tkhdPayload = new Uint8Array(opts.version === 1 ? 92 : 80);
  const tkhdDv = new DataView(tkhdPayload.buffer);
  tkhdPayload[0] = opts.version;
  if (opts.version === 0) {
    tkhdDv.setUint32(4, 0xaabbccdd, false);
    tkhdDv.setUint32(8, 0xeeff0011, false);
    tkhdDv.setUint32(12, trackId, false);
    tkhdDv.setUint32(20, Number(duration), false);
  } else {
    tkhdDv.setBigUint64(4, 0x00000003_aabbccddn, false);
    tkhdDv.setBigUint64(12, 0x00000004_eeff0011n, false);
    tkhdDv.setUint32(20, trackId, false);
    tkhdDv.setBigUint64(28, duration, false);
  }
  const tkhd = makeBox('tkhd', tkhdPayload);

  // mdhd (v0 or v1)
  const mdhdPayload = new Uint8Array(opts.version === 1 ? 36 : 24);
  const mdhdDv = new DataView(mdhdPayload.buffer);
  mdhdPayload[0] = opts.version;
  if (opts.version === 0) {
    mdhdDv.setUint32(4, 0x12345678, false);
    mdhdDv.setUint32(8, 0x9abcdef0, false);
    mdhdDv.setUint32(12, timescale, false);
    mdhdDv.setUint32(16, Number(duration), false);
  } else {
    mdhdDv.setBigUint64(4, 0x00000005_12345678n, false);
    mdhdDv.setBigUint64(12, 0x00000006_9abcdef0n, false);
    mdhdDv.setUint32(20, timescale, false);
    mdhdDv.setBigUint64(24, duration, false);
  }
  const mdhd = makeBox('mdhd', mdhdPayload);

  // hdlr with QuickTime component_type ('mhlr'), handler_type ('vide'), component_manufacturer ('appl'), name ("Core Media Video\0")
  const hdlrName = enc.encode('Core Media Video\0');
  const hdlrPayload = new Uint8Array(24 + hdlrName.length);
  hdlrPayload.set(enc.encode('mhlr'), 4);
  hdlrPayload.set(enc.encode('vide'), 8);
  hdlrPayload.set(enc.encode('appl'), 12);
  hdlrPayload.set(hdlrName, 24);
  const hdlr = makeBox('hdlr', hdlrPayload);

  // stco box inside minf -> stbl (will be patched with exact mdat payload offset)
  const stcoPayload = new Uint8Array(12);
  const stcoDv = new DataView(stcoPayload.buffer);
  stcoDv.setUint32(4, 1, false); // entry_count = 1
  const stco = makeBox('stco', stcoPayload);
  const stbl = makeBox('stbl', stco);
  const minf = makeBox('minf', stbl);
  const mdia = makeBox('mdia', concatBytes([mdhd, hdlr, minf]));
  const trak = makeBox('trak', concatBytes([tkhd, mdia]));

  // Metadata boxes to scrub in-place to zero-filled 'free'
  const udta = makeBox('udta', enc.encode('GPS+37.7749-122.4194'));
  const meta = makeBox('meta', enc.encode('\0\0\0\0Lavf60.16.100'));
  const cprt = makeBox('cprt', enc.encode('\0\0\0\0Copyright Secret Studio'));

  const moovChildren = concatBytes([mvhd, trak, udta, meta, cprt]);
  const moov = opts.useLargeMoov ? makeLargeBox('moov', moovChildren) : makeBox('moov', moovChildren);
  const ftyp = makeBox('ftyp', enc.encode('isom\0\0\x02\0isommp41'));

  const mdatPayload = opts.mdatPayload ?? concatBytes([
    new Uint8Array([0x00, 0x00, 0x00, 0x10, 0x06]), // short SEI NAL with x264 banner
    enc.encode('x264 - core 164'),
    new Uint8Array([0x00, 0x00, 0x00, 0x08, 0x65, 0x88, 0x84, 0x21, 0xaa, 0xbb, 0xcc, 0xdd]), // IDR slice that must stay intact!
  ]);

  let mdat: Uint8Array;
  if (opts.mdatSizeZero) {
    mdat = new Uint8Array(8 + mdatPayload.length);
    mdat.set([0, 0, 0, 0, 0x6d, 0x64, 0x61, 0x74], 0);
    mdat.set(mdatPayload, 8);
  } else {
    mdat = makeBox('mdat', mdatPayload);
  }

  const mdatOffset = ftyp.length + moov.length;
  const mdatDataOffset = mdatOffset + 8;

  const bytes = concatBytes([ftyp, moov, mdat]);
  // Patch stco chunk offset to point directly to mdatDataOffset
  const stcoMarkerIdx = bytes.findIndex((_, i) =>
    i + 4 <= bytes.length &&
    bytes[i] === 0x73 && bytes[i + 1] === 0x74 && bytes[i + 2] === 0x63 && bytes[i + 3] === 0x6f
  );
  assert.ok(stcoMarkerIdx > 0);
  new DataView(bytes.buffer).setUint32(stcoMarkerIdx + 12, mdatDataOffset, false);

  return { bytes, mdatOffset, mdatPayload, timescale, duration, trackId };
}

test('VIDEO_SECONDARY AUD-09/AUD-10 [NODE-VERIFIED]: webcodecs-resynthesizer.ts and encrypted-stream.ts are deleted and WebCodecs/OPFS globals never bypass or corrupt MP4 sanitization', async () => {
  assert.equal(
    fs.existsSync(path.join(REPO_ROOT, 'src', 'core', 'media', 'webcodecs-resynthesizer.ts')),
    false,
    'webcodecs-resynthesizer.ts no-op stub must be deleted'
  );
  assert.equal(
    fs.existsSync(path.join(REPO_ROOT, 'src', 'core', 'media', 'encrypted-stream.ts')),
    false,
    'encrypted-stream.ts broken OPFS cipher must be deleted'
  );

  const srcFiles = walkSourceFiles(path.join(REPO_ROOT, 'src'));
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(content.includes('webcodecs-resynthesizer'), false, `${file} must not reference webcodecs-resynthesizer`);
    assert.equal(content.includes('encrypted-stream'), false, `${file} must not reference encrypted-stream`);
    assert.equal(content.includes('getDirectory'), false, `${file} must not use broken OPFS getDirectory path`);
  }

  // Simulate modern browser globals (AudioDecoder + VideoDecoder + OPFS navigator.storage.getDirectory)
  const g = globalThis as Record<string, unknown>;
  const origAudioDecoder = g.AudioDecoder;
  const origVideoDecoder = g.VideoDecoder;
  g.AudioDecoder = class FakeAudioDecoder {};
  g.VideoDecoder = class FakeVideoDecoder {};

  try {
    const { processMediaFile } = await import('../src/core/pipeline');
    const fx = buildRichMp4Fixture({ version: 0 });
    const file = new File([fx.bytes], 'camera_clip.mp4', { type: 'video/mp4' });
    const result = await processMediaFile(file, { defenseLevel: 'paranoid' });
    const out = new Uint8Array(await result.blob.arrayBuffer());
    const outAscii = new TextDecoder().decode(out);

    assert.notEqual(result.blob, file, 'Must never return original file object untouched');
    assert.equal(outAscii.includes('GPS+37.7749'), false, 'udta GPS must be scrubbed even when WebCodecs globals exist');
    assert.equal(outAscii.includes('ftyp'), true, 'Output must remain valid plaintext ISOBMFF (never OPFS ciphertext)');
  } finally {
    if (origAudioDecoder === undefined) delete g.AudioDecoder;
    else g.AudioDecoder = origAudioDecoder;
    if (origVideoDecoder === undefined) delete g.VideoDecoder;
    else g.VideoDecoder = origVideoDecoder;
  }
});

test('VIDEO_SECONDARY AUD-11/AUD-12/AUD-16 [NODE-VERIFIED]: MP4/MOV preserves playable mdat and stco offsets, zeroes v0 & v1 timestamps without corrupting timescale/duration, scrubs udta/meta/cprt/hdlr.name/manufacturer, handles boxSize 0/1, and hashes 100% of bytes', async () => {
  const { processMediaFile } = await import('../src/core/pipeline');
  const { sanitizeMp4InPlaceZeroCopy } = await import('../src/core/media/media-sanitizer');
  const { computeSha256 } = await import('../src/core/forensic/hash-naming');

  for (const version of [0, 1] as const) {
    const fx = buildRichMp4Fixture({ version, mdatSizeZero: version === 1, useLargeMoov: version === 1 });
    const ext = version === 0 ? 'mp4' : 'mov';
    const mime = version === 0 ? 'video/mp4' : 'video/quicktime';
    // Extensionless name for version 1 to also verify no filename leakage into extension
    const inputName = version === 0 ? 'secret_interview.mp4' : 'secret_interview';
    const file = new File([fx.bytes], inputName, { type: mime });
    const result = await processMediaFile(file, { defenseLevel: 'paranoid' });
    const out = new Uint8Array(await result.blob.arrayBuffer());
    const outView = new DataView(out.buffer, out.byteOffset, out.byteLength);
    const outText = new TextDecoder().decode(out);

    // 1. Exact byte length preserved -> stco offsets remain 100% valid
    assert.equal(out.byteLength, fx.bytes.byteLength, `v${version}: exact size preserved for chunk offset validity`);

    // 2. mdat bitstream payload 100% intact (NO blind 256-byte zeroing!)
    const outMdatPayload = out.subarray(fx.mdatOffset + 8, fx.mdatOffset + 8 + fx.mdatPayload.length);
    assert.deepEqual(outMdatPayload, fx.mdatPayload, `v${version}: mdat H.264/H.265 payload must remain byte-for-byte intact`);

    // 3. udta, meta, cprt, hdlr.name, component_manufacturer ('appl') scrubbed
    assert.equal(outText.includes('GPS+37.7749'), false, `v${version}: udta payload must be zeroed`);
    assert.equal(outText.includes('Lavf60.16.100'), false, `v${version}: meta payload must be zeroed`);
    assert.equal(outText.includes('Copyright Secret Studio'), false, `v${version}: cprt payload must be zeroed`);
    assert.equal(outText.includes('Core Media Video'), false, `v${version}: hdlr.name must be zeroed`);
    assert.equal(outText.includes('appl'), false, `v${version}: QuickTime component_manufacturer must be zeroed`);
    assert.equal(outText.includes('vide'), true, `v${version}: hdlr.handler_type 'vide' must be preserved`);

    // 4. mvhd, tkhd, mdhd timestamps zeroed AND timescale/track_ID/duration preserved
    const findFourCC = (tag: string) => {
      const t = [tag.charCodeAt(0), tag.charCodeAt(1), tag.charCodeAt(2), tag.charCodeAt(3)];
      for (let i = 4; i + 4 <= out.length; i++) {
        if (out[i] === t[0] && out[i + 1] === t[1] && out[i + 2] === t[2] && out[i + 3] === t[3]) {
          return i - 4;
        }
      }
      return -1;
    };

    const mvhdPos = findFourCC('mvhd');
    const tkhdPos = findFourCC('tkhd');
    const mdhdPos = findFourCC('mdhd');
    const stcoPos = findFourCC('stco');
    assert.ok(mvhdPos > 0 && tkhdPos > 0 && mdhdPos > 0 && stcoPos > 0);

    if (version === 0) {
      assert.equal(outView.getUint32(mvhdPos + 12, false), 0, 'mvhd v0 creation_time zeroed');
      assert.equal(outView.getUint32(mvhdPos + 16, false), 0, 'mvhd v0 modification_time zeroed');
      assert.equal(outView.getUint32(mvhdPos + 20, false), fx.timescale, 'mvhd v0 timescale preserved');
      assert.equal(BigInt(outView.getUint32(mvhdPos + 24, false)), fx.duration, 'mvhd v0 duration preserved');

      assert.equal(outView.getUint32(tkhdPos + 12, false), 0, 'tkhd v0 creation_time zeroed');
      assert.equal(outView.getUint32(tkhdPos + 16, false), 0, 'tkhd v0 modification_time zeroed');
      assert.equal(outView.getUint32(tkhdPos + 20, false), fx.trackId, 'tkhd v0 track_ID preserved');
      assert.equal(BigInt(outView.getUint32(tkhdPos + 28, false)), fx.duration, 'tkhd v0 duration preserved');

      assert.equal(outView.getUint32(mdhdPos + 12, false), 0, 'mdhd v0 creation_time zeroed');
      assert.equal(outView.getUint32(mdhdPos + 16, false), 0, 'mdhd v0 modification_time zeroed');
      assert.equal(outView.getUint32(mdhdPos + 20, false), fx.timescale, 'mdhd v0 timescale preserved');
      assert.equal(BigInt(outView.getUint32(mdhdPos + 24, false)), fx.duration, 'mdhd v0 duration preserved');
    } else {
      assert.equal(outView.getBigUint64(mvhdPos + 12, false), 0n, 'mvhd v1 creation_time zeroed');
      assert.equal(outView.getBigUint64(mvhdPos + 20, false), 0n, 'mvhd v1 modification_time zeroed');
      assert.equal(outView.getUint32(mvhdPos + 28, false), fx.timescale, 'mvhd v1 timescale preserved');
      assert.equal(outView.getBigUint64(mvhdPos + 32, false), fx.duration, 'mvhd v1 duration preserved');

      assert.equal(outView.getBigUint64(tkhdPos + 12, false), 0n, 'tkhd v1 creation_time zeroed');
      assert.equal(outView.getBigUint64(tkhdPos + 20, false), 0n, 'tkhd v1 modification_time zeroed');
      assert.equal(outView.getUint32(tkhdPos + 28, false), fx.trackId, 'tkhd v1 track_ID preserved');
      assert.equal(outView.getBigUint64(tkhdPos + 36, false), fx.duration, 'tkhd v1 duration preserved');

      assert.equal(outView.getBigUint64(mdhdPos + 12, false), 0n, 'mdhd v1 creation_time zeroed');
      assert.equal(outView.getBigUint64(mdhdPos + 20, false), 0n, 'mdhd v1 modification_time zeroed');
      assert.equal(outView.getUint32(mdhdPos + 28, false), fx.timescale, 'mdhd v1 timescale preserved');
      assert.equal(outView.getBigUint64(mdhdPos + 32, false), fx.duration, 'mdhd v1 duration preserved');
    }

    // 5. stco chunk offset still points directly to mdat payload
    assert.equal(outView.getUint32(stcoPos + 16, false), fx.mdatOffset + 8, `v${version}: stco offset must remain exact`);

    // 6. Full-file SHA-256 finalization (AUD-16) and safe extension (no filename leak)
    const fullSha = await computeSha256(out);
    assert.equal(result.sha256, fullSha);
    assert.equal(result.sanitizedSize, out.byteLength);
    assert.equal(result.sanitizedName, `${fullSha.slice(0, 32)}.${ext}`);
    assert.equal(result.auditAfter.sha256, fullSha);
    assert.equal(result.auditAfter.fileSize, out.byteLength);
    assert.equal(result.auditAfter.fileName, result.sanitizedName);
  }

  // 7. Two MP4s sharing identical first 2048 bytes but differing past byte 2048 MUST produce distinct sanitizedName/SHA-256 (eliminating 1024-byte partial hash)
  const payloadA = new Uint8Array(4096).fill(0x11);
  const payloadB = new Uint8Array(4096).fill(0x11);
  payloadB[3000] = 0x99;
  const mp4A = buildRichMp4Fixture({ version: 0, mdatPayload: payloadA });
  const mp4B = buildRichMp4Fixture({ version: 0, mdatPayload: payloadB });
  const resA = await processMediaFile(new File([mp4A.bytes], 'same_head_a.mp4', { type: 'video/mp4' }));
  const resB = await processMediaFile(new File([mp4B.bytes], 'same_head_b.mp4', { type: 'video/mp4' }));
  assert.notEqual(resA.sanitizedName, resB.sanitizedName, 'Full-file SHA-256 must distinguish MP4s differing past byte 1024');
  assert.notEqual(resA.sha256, resB.sha256);

  // 8. Truncated boxSize === 1 inside trak must NEVER throw RangeError (AUD-12)
  const hostileTrakMp4 = new Uint8Array([
    0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 2, 0,
    0, 0, 0, 28, 0x6d, 0x6f, 0x6f, 0x76,
    0, 0, 0, 20, 0x74, 0x72, 0x61, 0x6b,
    0, 0, 0, 1, 0x6d, 0x64, 0x69, 0x61, 0, 0, 0, 0, // truncated 64-bit box (only 12 bytes, < 16)
  ]);
  assert.doesNotThrow(() => sanitizeMp4InPlaceZeroCopy(hostileTrakMp4));
});

test('VIDEO_SECONDARY AUD-11/AUD-15 [NODE-VERIFIED]: MKV and WebM containers are explicitly rejected with typed error', async () => {
  const { processMediaFile } = await import('../src/core/pipeline');
  const { sanitizeMedia, sanitizeMediaWithWorker, UnsupportedMediaFormatError } = await import('../src/core/media/media-sanitizer');

  const ebmlHeader = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x00, 0x00, 0x00]);
  const fixtures = [
    { name: 'movie.mkv', mime: 'video/x-matroska', bytes: ebmlHeader },
    { name: 'clip.webm', mime: 'video/webm', bytes: ebmlHeader },
    { name: 'renamed_ebml.mp4', mime: 'video/mp4', bytes: ebmlHeader },
  ];

  for (const fx of fixtures) {
    const file = new File([fx.bytes], fx.name, { type: fx.mime });
    await assert.rejects(
      () => processMediaFile(file),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'CONTAINER_UNSUPPORTED',
      `processMediaFile must reject ${fx.name}`
    );
    await assert.rejects(
      () => sanitizeMedia(file, { defenseLevel: 'paranoid' }),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'CONTAINER_UNSUPPORTED',
      `sanitizeMedia must reject ${fx.name}`
    );
    await assert.rejects(
      () => sanitizeMediaWithWorker(fx.bytes.buffer.slice(0), fx.mime, fx.name),
      (err: unknown) => err instanceof UnsupportedMediaFormatError && err.code === 'CONTAINER_UNSUPPORTED',
      `sanitizeMediaWithWorker must reject ${fx.name}`
    );
  }
});

test('VIDEO_SECONDARY AUD-14 [NODE-VERIFIED]: media.worker transfers strictly exact Uint8Array slice (byteOffset===0, byteLength===buffer.byteLength)', async () => {
  const { extractTransferableExactSlice, processMediaWorkerJob } = await import('../src/core/workers/media.worker');

  // 1. Non-zero offset subarray inside larger backing buffer with secret canary prefix/suffix
  const backing = new Uint8Array(64);
  backing.fill(0xee);
  const inner = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  backing.set(inner, 16);
  const sub = backing.subarray(16, 24);
  const transferred = extractTransferableExactSlice(sub);
  assert.equal(transferred.byteLength, 8, 'Transferred buffer must match exact slice byteLength');
  assert.deepEqual(new Uint8Array(transferred), inner, 'Transferred buffer must exclude canary prefix/suffix');

  // 2. End-to-end media worker job returns exact sanitized MP4 ArrayBuffer
  const fx = buildRichMp4Fixture({ version: 0 });
  const jobResult = processMediaWorkerJob({
    buffer: fx.bytes.buffer.slice(0),
    mimeType: 'video/mp4',
    originalName: 'clip.mp4',
  });
  assert.equal(jobResult.buffer.byteLength, fx.bytes.byteLength);
  assert.equal(new TextDecoder().decode(new Uint8Array(jobResult.buffer)).includes('GPS+37.7749'), false);
});
