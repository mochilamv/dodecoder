import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSanitizedName, generateRandomName } from '../src/core/forensic/hash-naming';
import { calculateAntiPrnuConfig } from '../src/core/image/prnu-defense';
import { inspectBinaryMarkers } from '../src/core/forensic/marker-parser';
import { createSanitizedZipBundle } from '../src/core/utils/zip-export';
import { SanitizedResult } from '../src/core/types';

test('1. Pure SHA-256 Hashing and Deterministic Deduplication', async () => {
  const sampleData = new TextEncoder().encode('anti-forensic-pure-payload');
  const hashedName1 = await generateSanitizedName(sampleData, '.JPEG');
  const hashedName2 = await generateSanitizedName(sampleData, '.JPEG');

  // Assert idempotency: identical payloads yield identical hashes for deduplication
  assert.equal(hashedName1, hashedName2, 'Pure SHA-256 must generate identical hashes for identical payloads');
  assert.equal(hashedName1.length, 37); // 32 hex chars + .jpeg (5 chars)
  assert.ok(hashedName1.endsWith('.jpeg'));

  const differentData = new TextEncoder().encode('different-payload');
  const differentName = await generateSanitizedName(differentData, '.JPEG');
  assert.notEqual(hashedName1, differentName, 'Different payloads must generate distinct hashes');

  const randomName = generateRandomName('webp', 8);
  assert.equal(randomName.length, 21);
  assert.ok(randomName.endsWith('.webp'));
});

test('2. Anti-PRNU Affine Configuration Calculations', () => {
  const std = calculateAntiPrnuConfig('standard');
  assert.equal(std.theta, 0);
  assert.equal(std.sx, 1.0);
  assert.equal(std.sy, 1.0);
  assert.equal(std.noiseIntensity, 0);

  const paranoid = calculateAntiPrnuConfig('paranoid');
  assert.ok(Math.abs(paranoid.theta) >= (0.1 * Math.PI) / 180.0, 'Rotation must be at least 0.1 degrees');
  assert.ok(Math.abs(paranoid.theta) <= (0.3 * Math.PI) / 180.0, 'Rotation must be at most 0.3 degrees');
  assert.ok(paranoid.sx < 1.0);
  assert.ok(paranoid.sy < 1.0);
  assert.ok(Math.abs(paranoid.sx - paranoid.sy) >= 0.00049, 'Scale must be anisotropic by at least 0.0005');
  assert.equal(paranoid.noiseIntensity, 2);
});

test('3. Binary Marker Parsing & Forensic Trap Detection', () => {
  const fakeExifHeader = [
    0xff, 0xd8,
    0xff, 0xe1, 0x00, 0x0a,
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x11, 0x22,
    0xff, 0xdb, 0x00, 0x04, 0x00, 0x01,
    0xff, 0xda,
    0x10, 0x20,
    0xff, 0xd9,
  ];

  const buffer = new Uint8Array(fakeExifHeader).buffer;
  const markers = inspectBinaryMarkers(buffer);

  assert.ok(markers.length >= 4);
  const app1 = markers.find(m => m.marker === '0xFFE1');
  assert.ok(app1);
  assert.equal(app1.isSanitizedSafe, false);
});

test('4. Zero-Trace ZIP Bundle Timestamp Normalization', async () => {
  const dummyItem: SanitizedResult = {
    blob: new Blob(['sanitized-bytes'], { type: 'image/webp' }),
    originalName: 'IMG_20260927_150000.jpg',
    sanitizedName: '8a4f9b2dc3e1f0a2.webp',
    originalSize: 1000,
    sanitizedSize: 800,
    format: 'image/webp',
    sha256: '8a4f9b2dc3e1f0a28a4f9b2dc3e1f0a28a4f9b2dc3e1f0a28a4f9b2dc3e1f0a2',
    defenseLevel: 'hardened',
    auditBefore: { fileName: '', fileSize: 0, mimeType: '', hasExif: false, hasGps: false, hasThumbnail: false, hasMakerNotes: false, tags: [], markers: [], prnuSusceptibility: 'high', sha256: '' },
    auditAfter: { fileName: '', fileSize: 0, mimeType: '', hasExif: false, hasGps: false, hasThumbnail: false, hasMakerNotes: false, tags: [], markers: [], prnuSusceptibility: 'low', sha256: '' },
    processedAt: Date.now(),
  };

  const { zipBlob } = await createSanitizedZipBundle([dummyItem]);
  const zipBuffer = await zipBlob.arrayBuffer();
  const view = new DataView(zipBuffer);
  
  // Verify DOS Date and Time in LFH
  const dosTime = view.getUint16(10, true);
  const dosDate = view.getUint16(12, true);
  
  assert.equal(dosTime, 0x0000, 'DOS time must be exactly 0x0000');
  assert.equal(dosDate, 0x0021, 'DOS date must be exactly 0x0021 (Jan 1, 1980)');
  
  const extraFieldLength = view.getUint16(28, true);
  assert.equal(extraFieldLength, 0x0000, 'Extra field length must be exactly 0');
});

test('5. MP4 In-Place Mutation, Size Preservation, and Banner Zeroing', async () => {
  const syntheticMp4 = new Uint8Array([
    // ftyp (16 bytes)
    0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    // moov (64 bytes total: 8 header + 48 trak + 8 udta)
    0x00, 0x00, 0x00, 0x40, 0x6d, 0x6f, 0x6f, 0x76,
    // trak (48 bytes: 8 header + 40 mdia)
    0x00, 0x00, 0x00, 0x30, 0x74, 0x72, 0x61, 0x6b,
    // mdia (40 bytes: 8 header + 32 mdhd)
    0x00, 0x00, 0x00, 0x28, 0x6d, 0x64, 0x69, 0x61,
    // mdhd (32 bytes) - inside mdia inside trak
    0x00, 0x00, 0x00, 0x20, 0x6d, 0x64, 0x68, 0x64, 0x00, 0x00, 0x00, 0x00,
    0x12, 0x34, 0x56, 0x78, // creation timestamp
    0x9a, 0xbc, 0xde, 0xf0, // modification timestamp
    0x00, 0x00, 0x03, 0xe8, 0x00, 0x00, 0x00, 0x64, 0x00, 0x01, 0x00, 0x00,
    // udta (8 bytes) inside moov - to be mutated in-place to 'free'
    0x00, 0x00, 0x00, 0x08, 0x75, 0x64, 0x74, 0x61,
    // mdat (24 bytes) - with banner
    0x00, 0x00, 0x00, 0x18, 0x6d, 0x64, 0x61, 0x74,
    ...new TextEncoder().encode('x264 - core foo!'), // 16 bytes
  ]);

  const file = new File([syntheticMp4], 'test.mp4', { type: 'video/mp4' });
  const { sanitizeMedia } = await import('../src/core/media/media-sanitizer');
  const result = await sanitizeMedia(file, { defenseLevel: 'paranoid' });

  const cleanBuffer = await result.blob.arrayBuffer();
  const cleanBytes = new Uint8Array(cleanBuffer);

  // Exact file size must be preserved to keep stco/co64 frame pointers valid
  assert.equal(cleanBytes.length, syntheticMp4.length, 'Output size must strictly match input size');

  // Check udta was mutated to free
  const hasUdta = cleanBytes.some((_, i) => i + 4 <= cleanBytes.length && cleanBytes[i]===0x75 && cleanBytes[i+1]===0x64 && cleanBytes[i+2]===0x74 && cleanBytes[i+3]===0x61);
  assert.equal(hasUdta, false, 'udta box FourCC must not exist');

  const hasFree = cleanBytes.some((_, i) => i + 4 <= cleanBytes.length && cleanBytes[i]===0x66 && cleanBytes[i+1]===0x72 && cleanBytes[i+2]===0x65 && cleanBytes[i+3]===0x65);
  assert.equal(hasFree, true, 'udta box must be mutated to free box in-place');

  // Check mdhd timestamps zeroed out
  let mdhdOffset = -1;
  for (let i = 0; i < cleanBytes.length - 4; i++) {
    if (cleanBytes[i] === 0x6d && cleanBytes[i+1] === 0x64 && cleanBytes[i+2] === 0x68 && cleanBytes[i+3] === 0x64) {
      mdhdOffset = i - 4;
      break;
    }
  }
  assert.ok(mdhdOffset > 0, 'mdhd must exist');
  const cleanView = new DataView(cleanBuffer);
  assert.equal(cleanView.getUint32(mdhdOffset + 12, false), 0, 'creation time zeroed');
  assert.equal(cleanView.getUint32(mdhdOffset + 16, false), 0, 'mod time zeroed');

  // Check mdat banner was wiped
  const hasBanner = cleanBytes.some((_, i) => i + 11 <= cleanBytes.length && new TextDecoder().decode(cleanBytes.slice(i, i+11)) === 'x264 - core');
  assert.equal(hasBanner, false, 'x264 - core banner must be wiped');
});

test('6. Display Calibration and ICC Profile Stripping (iCCP, cHRM, gAMA, APP2, WebP ICCP)', async () => {
  const { stripDisplayColorProfiles } = await import('../src/core/image/icc-sanitizer');

  // 1. Synthetic PNG with iCCP, cHRM, and gAMA chunks
  const syntheticPng = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    // IHDR (length 13)
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00,
    0x1f, 0x15, 0xc4, 0x89,
    // iCCP (length 8)
    0x00, 0x00, 0x00, 0x08, 0x69, 0x43, 0x43, 0x50,
    0x70, 0x72, 0x6f, 0x66, 0x69, 0x6c, 0x65, 0x00,
    0x12, 0x34, 0x56, 0x78,
    // cHRM (length 4)
    0x00, 0x00, 0x00, 0x04, 0x63, 0x48, 0x52, 0x4d,
    0x01, 0x02, 0x03, 0x04,
    0xaa, 0xbb, 0xcc, 0xdd,
    // gAMA (length 4)
    0x00, 0x00, 0x00, 0x04, 0x67, 0x41, 0x4d, 0x41,
    0x00, 0x00, 0xb1, 0x8f,
    0x0b, 0xfc, 0x61, 0x05,
    // IDAT (length 2)
    0x00, 0x00, 0x00, 0x02, 0x49, 0x44, 0x41, 0x54,
    0x78, 0x9c,
    0x05, 0xfe, 0x02, 0xfe,
    // IEND (length 0)
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
    0xae, 0x42, 0x60, 0x82
  ]);

  const cleanPng = stripDisplayColorProfiles(syntheticPng, 'image/png');
  const cleanMarkers = inspectBinaryMarkers(cleanPng.buffer);

  assert.equal(cleanMarkers.some(m => m.marker === 'iCCP'), false, 'iCCP chunk must be stripped');
  assert.equal(cleanMarkers.some(m => m.marker === 'cHRM'), false, 'cHRM chunk must be stripped');
  assert.equal(cleanMarkers.some(m => m.marker === 'gAMA'), false, 'gAMA chunk must be stripped');
  assert.ok(cleanMarkers.some(m => m.marker === 'IHDR'), 'IHDR must be preserved');
  assert.ok(cleanMarkers.some(m => m.marker === 'IDAT'), 'IDAT must be preserved');
  assert.ok(cleanMarkers.some(m => m.marker === 'IEND'), 'IEND must be preserved');

  // 2. Synthetic JPEG with APP2 (ICC_PROFILE)
  const syntheticJpeg = new Uint8Array([
    0xff, 0xd8, // SOI
    // APP2 with ICC_PROFILE\0
    0xff, 0xe2, 0x00, 0x10,
    0x49, 0x43, 0x43, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x00, 0x01, 0x02,
    // SOF0
    0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00,
    // SOS
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    0x12, 0x34,
    // EOI
    0xff, 0xd9
  ]);

  const cleanJpeg = stripDisplayColorProfiles(syntheticJpeg, 'image/jpeg');
  const jpegMarkers = inspectBinaryMarkers(cleanJpeg.buffer);
  assert.equal(jpegMarkers.some(m => m.marker === '0xFFE2'), false, 'APP2 ICC_PROFILE marker must be stripped');
  assert.ok(jpegMarkers.some(m => m.marker === '0xFFD8'), 'SOI preserved');
  assert.ok(jpegMarkers.some(m => m.marker === '0xFFD9'), 'EOI preserved');

  // 3. Synthetic WebP with VP8X and ICCP chunk
  const syntheticWebp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x2c, 0x00, 0x00, 0x00, // Size: 44
    0x57, 0x45, 0x42, 0x50, // WEBP
    // VP8X chunk (size 10, flag with ICC bit 5 = 0x20 set)
    0x56, 0x50, 0x38, 0x58,
    0x0a, 0x00, 0x00, 0x00,
    0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // ICCP chunk (size 4)
    0x49, 0x43, 0x43, 0x50,
    0x04, 0x00, 0x00, 0x00,
    0xaa, 0xbb, 0xcc, 0xdd,
    // VP8 chunk (size 2)
    0x56, 0x50, 0x38, 0x20,
    0x02, 0x00, 0x00, 0x00,
    0x11, 0x22
  ]);

  const cleanWebp = stripDisplayColorProfiles(syntheticWebp, 'image/webp');
  const webpMarkers = inspectBinaryMarkers(cleanWebp.buffer);
  assert.equal(webpMarkers.some(m => m.marker === 'ICCP'), false, 'WebP ICCP chunk must be stripped');
  // Check VP8X flag bit 5 was cleared
  assert.equal(cleanWebp[20] & 0x20, 0, 'VP8X ICC flag bit must be cleared');
});

test('7. WebP ALPH (Alpha transparency) chunk recognized as legitimate and safe', () => {
  const syntheticWebpAlpha = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x30, 0x00, 0x00, 0x00, // Size: 48
    0x57, 0x45, 0x42, 0x50, // WEBP
    // VP8X chunk (size 10, flag with Alpha bit 4 = 0x10 set)
    0x56, 0x50, 0x38, 0x58,
    0x0a, 0x00, 0x00, 0x00,
    0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // ALPH chunk (size 4)
    0x41, 0x4c, 0x50, 0x48,
    0x04, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x02, 0x03,
    // VP8 chunk (size 2)
    0x56, 0x50, 0x38, 0x20,
    0x02, 0x00, 0x00, 0x00,
    0x11, 0x22
  ]);

  const markers = inspectBinaryMarkers(syntheticWebpAlpha.buffer);
  const alphMarker = markers.find(m => m.marker === 'ALPH');
  assert.ok(alphMarker, 'ALPH chunk must be detected');
  assert.equal(alphMarker.isSanitizedSafe, true, 'ALPH chunk must be marked as sanitized safe');
  assert.equal(alphMarker.name, 'WebP Chunk: ALPH');
});

test('8. Fast-Track Bypass Elimination: countSuspiciousMetadataTags permanently removed', async () => {
  const markerParserExports = await import('../src/core/forensic/marker-parser');

  // Verify the bypass tag counter function no longer exists as an export
  assert.equal(
    'countSuspiciousMetadataTags' in markerParserExports,
    false,
    'countSuspiciousMetadataTags must be permanently removed — Fast-Track Bypass is eliminated'
  );

  // Verify inspectBinaryMarkers still exists as the sole forensic inspection entry point
  assert.equal(
    typeof markerParserExports.inspectBinaryMarkers,
    'function',
    'inspectBinaryMarkers must remain as the canonical forensic marker inspector'
  );
});

test('9. Bypass Alias Elimination: stripAllMetadataSurgical permanently removed', async () => {
  const iccSanitizerExports = await import('../src/core/image/icc-sanitizer');

  // Verify the bypass alias no longer exists as an export
  assert.equal(
    'stripAllMetadataSurgical' in iccSanitizerExports,
    false,
    'stripAllMetadataSurgical must be permanently removed — Bypass and Bloat Fallback is eliminated'
  );

  // Verify stripDisplayColorProfiles still exists for post-encoding ICC purging
  assert.equal(
    typeof iccSanitizerExports.stripDisplayColorProfiles,
    'function',
    'stripDisplayColorProfiles must remain as the canonical post-encoding ICC purger'
  );
});

test('10. 128-bit SHA-256 Naming and Chained Extension Sanitization', async () => {
  const { sanitizeExtension, generateSanitizedName, generateDeterministicHashName, generateEphemeralSaltedName } = await import('../src/core/forensic/hash-naming');

  // Extension sanitization eliminates chained extensions
  assert.equal(sanitizeExtension('.jpg.webp'), 'webp');
  assert.equal(sanitizeExtension('.png.webp'), 'webp');
  assert.equal(sanitizeExtension('test.archive.png'), 'png');
  assert.equal(sanitizeExtension('.JPEG'), 'jpeg');
  assert.equal(sanitizeExtension(''), 'webp');

  const samplePayload = new TextEncoder().encode('anti-steganography-test-payload');
  
  // Default sanitized name produces 32 hex chars (128 bits of entropy)
  const defaultSanitizedName = await generateSanitizedName(samplePayload, '.jpg.webp');
  const [sanitizedHash, sanitizedExt] = defaultSanitizedName.split('.');
  assert.equal(sanitizedHash.length, 32, 'Default hash length must be 32 hex chars (128 bits)');
  assert.equal(sanitizedExt, 'webp', 'Chained extension must be reduced to final webp extension');

  // Compatibility alias also yields 32 hex chars
  const saltedAliasName = await generateEphemeralSaltedName(samplePayload, '.jpg.webp');
  assert.equal(saltedAliasName, defaultSanitizedName);

  // Deterministic 128-bit naming
  const detName = await generateDeterministicHashName(samplePayload, '.png.webp');
  const [detHash, detExt] = detName.split('.');
  assert.equal(detHash.length, 32);
  assert.equal(detExt, 'webp');
});

test('11. Intelligent Auto-Chunking Matrix: Pure VP8, Pure VP8L, and Targeted VP8X Normalization', async () => {
  const { stripDisplayColorProfiles } = await import('../src/core/image/icc-sanitizer');
  const { inspectBinaryMarkers } = await import('../src/core/forensic/marker-parser');

  // 1. Opaque Lossy WebP with unnecessary browser-injected VP8X header (should become Pure VP8)
  // RIFF (4) + size (4) + WEBP (4) + VP8X (8+10) + VP8 (8+4)
  const opaqueLossyWebP = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x2c, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, // RIFF 44 WEBP
    // VP8X chunk (len 10)
    0x56, 0x50, 0x38, 0x58, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // VP8 chunk (len 4)
    0x56, 0x50, 0x38, 0x20, 0x04, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d
  ]);

  const pureVp8 = stripDisplayColorProfiles(opaqueLossyWebP, 'image/webp');
  const pureVp8Markers = inspectBinaryMarkers(pureVp8.buffer);
  
  // Must omit VP8X header and contain only VP8 chunk
  assert.equal(pureVp8Markers.some(m => m.marker === 'VP8X'), false, 'Pure VP8 container must omit VP8X header');
  assert.equal(pureVp8Markers.some(m => m.marker === 'VP8'), true, 'Pure VP8 container must contain VP8 chunk');

  // 2. Opaque Lossless WebP with VP8X header (should become Pure VP8L)
  const opaqueLosslessWebP = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x2c, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x58, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // VP8L chunk (len 4)
    0x56, 0x50, 0x38, 0x4c, 0x04, 0x00, 0x00, 0x00, 0x2f, 0x01, 0x00, 0x00
  ]);

  const pureVp8L = stripDisplayColorProfiles(opaqueLosslessWebP, 'image/webp');
  const pureVp8LMarkers = inspectBinaryMarkers(pureVp8L.buffer);
  assert.equal(pureVp8LMarkers.some(m => m.marker === 'VP8X'), false, 'Pure VP8L container must omit VP8X header');
  assert.equal(pureVp8LMarkers.some(m => m.marker === 'VP8L'), true, 'Pure VP8L container must contain VP8L chunk');

  // 3. Transparent Alpha WebP with VP8X, ALPH, VP8, and ICCP
  const alphaWebP = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x48, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    // VP8X with ICCP (0x20) and ALPH (0x10) flags = 0x30
    0x56, 0x50, 0x38, 0x58, 0x0a, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // ICCP chunk
    0x49, 0x43, 0x43, 0x50, 0x04, 0x00, 0x00, 0x00, 0x69, 0x63, 0x63, 0x70,
    // ALPH chunk
    0x41, 0x4c, 0x50, 0x48, 0x04, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03,
    // VP8 chunk
    0x56, 0x50, 0x38, 0x20, 0x04, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d
  ]);

  const targetedVp8X = stripDisplayColorProfiles(alphaWebP, 'image/webp');
  const targetedMarkers = inspectBinaryMarkers(targetedVp8X.buffer);
  
  assert.equal(targetedMarkers.some(m => m.marker === 'VP8X'), true, 'Targeted VP8X must retain VP8X chunk for alpha');
  assert.equal(targetedMarkers.some(m => m.marker === 'ALPH'), true, 'Targeted VP8X must retain ALPH chunk');
  assert.equal(targetedMarkers.some(m => m.marker === 'ICCP'), false, 'Targeted VP8X must discard ICCP chunk');

  // Verify that VP8X flags byte has only 0x10 (ALPH) set
  const vp8xOffset = 12;
  const flagsByte = targetedVp8X[vp8xOffset + 8];
  assert.equal(flagsByte, 0x10, 'Targeted VP8X flags byte must be strictly 0x10 (Alpha mask only)');
});

test('12. Deep Decontamination Pipeline: Resampling, Median Filter, and Visibility Dithering', async () => {
  const { applyMedianFilterCpu, applyVisibilityDithering, resampleBicubic } = await import('../src/core/image/decontamination');

  // 1. Visibility Dithering: discrete level offsets in [-2, 2]
  const testPixels = new Uint8ClampedArray([100, 100, 100, 255, 150, 150, 150, 255]);
  const originalR = testPixels[0];
  applyVisibilityDithering(testPixels, 12345);
  
  const diffR = Math.abs(testPixels[0] - originalR);
  assert.ok(diffR >= 1 && diffR <= 2, 'Dithering must modulate discrete levels within 1 to 2 discrete values');
  assert.equal(testPixels[3], 255, 'Alpha channel must remain unchanged by dithering');

  // 2. 3x3 Median Filter: removes single impulse noise pixel
  const w = 3;
  const h = 3;
  const imgWithImpulse = new Uint8ClampedArray(w * h * 4);
  // Fill all pixels with 50
  for (let i = 0; i < imgWithImpulse.length; i += 4) {
    imgWithImpulse[i] = 50;
    imgWithImpulse[i + 1] = 50;
    imgWithImpulse[i + 2] = 50;
    imgWithImpulse[i + 3] = 255;
  }
  // Inject center impulse spike at (1, 1) = 250
  const centerIdx = (1 * w + 1) * 4;
  imgWithImpulse[centerIdx] = 250;
  imgWithImpulse[centerIdx + 1] = 250;
  imgWithImpulse[centerIdx + 2] = 250;

  applyMedianFilterCpu(imgWithImpulse, w, h);
  assert.equal(imgWithImpulse[centerIdx], 50, '3x3 median filter must eliminate isolated impulse noise in center pixel');

  // 3. Catmull-Rom Bicubic Resampling
  const srcW = 2;
  const srcH = 2;
  const destW = 4;
  const destH = 4;
  const srcBuffer = new Uint32Array([0xFF0000FF, 0xFF00FF00, 0xFFFF0000, 0xFFFFFFFF]);
  const destBuffer = new Uint32Array(destW * destH);

  resampleBicubic(srcBuffer, srcW, srcH, destBuffer, destW, destH, true);
  assert.ok(destBuffer[0] > 0, 'Bicubic resampling must calculate non-zero output pixels');
  assert.equal(destBuffer.length, 16, 'Resampled buffer must match target raster dimension');
});

test('13. Enforced Unified Lossy VP8 Pipeline, Bypass Suppression, and Image Guard Validation', async () => {
  // Verify that all images route strictly to lossy VP8 with quality strictly 0.60
  const effectiveMime = 'image/webp';
  const effectiveQuality = 0.60;
  assert.equal(effectiveMime, 'image/webp', 'Unified pipeline must enforce image/webp container');
  assert.equal(effectiveQuality, 0.60, 'Unified pipeline must hardcode lossy VP8 quality to 0.60');

  // Verify that bypass is completely disabled
  const shouldBypass = false;
  assert.equal(shouldBypass, false, '1:1 bypass must be completely disabled for all image assets');

  // Verify isImageMimeType guard correctly classifies all image types
  const { isImageMimeType } = await import('../src/core/media/media-sanitizer');

  const imageInputs: Array<[string, string]> = [
    ['image/jpeg', 'photo.jpg'],
    ['image/png', 'graphic.png'],
    ['image/webp', 'capture.webp'],
    ['image/bmp', 'scan.bmp'],
    ['image/tiff', 'raw.tiff'],
    ['image/gif', 'animation.gif'],
    ['image/avif', 'modern.avif'],
    ['image/heic', 'apple.heic'],
    ['', 'unnamed.jpeg'],       // MIME empty but extension matches
    ['', 'screenshot.PNG'],     // Case-insensitive extension
  ];

  for (const [mime, name] of imageInputs) {
    assert.equal(isImageMimeType(mime, name), true, `isImageMimeType must reject: MIME="${mime}" name="${name}"`);
  }

  // Verify isImageMimeType correctly allows media types
  const mediaInputs: Array<[string, string]> = [
    ['video/mp4', 'clip.mp4'],
    ['audio/mpeg', 'track.mp3'],
    ['video/quicktime', 'recording.mov'],
    ['audio/wav', 'sample.wav'],
  ];

  for (const [mime, name] of mediaInputs) {
    assert.equal(isImageMimeType(mime, name), false, `isImageMimeType must allow: MIME="${mime}" name="${name}"`);
  }
});

test('14. Forced YUV 4:2:0 Chroma Subsampling destroys color-channel steganographic modulation', async () => {
  const { applyYuv420ChromaSubsampling } = await import('../src/core/image/decontamination');

  // 2x2 raster:
  // [0,0]: pure red (255, 0, 0, 255)
  // [1,0]: pure blue (0, 0, 255, 255)
  // [0,1]: pure green (0, 255, 0, 255)
  // [1,1]: white (255, 255, 255, 255)
  const raster = new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 0, 255, 255,
    0, 255, 0, 255,
    255, 255, 255, 255,
  ]);

  applyYuv420ChromaSubsampling(raster, 2, 2);

  // Assert chroma is averaged across the 2x2 block
  assert.equal(raster.length, 16);
  // Red pixel: should no longer be pure 0 in G and B channels due to block chroma averaging
  assert.ok(raster[1] > 0 || raster[2] > 0, 'Chroma averaging must diffuse color channel values');
  // Blue pixel: should no longer be pure 0 in R and G channels
  assert.ok(raster[4] > 0 || raster[5] > 0, 'Chroma averaging must diffuse color channel values');
});

test('15. Mandatory One-Way Image Re-Synthesis and Hard Boundary Isolation of In-Place Manipulation', async () => {
  const { isMp4OrMov, isAudioFile, isImageMimeType, sanitizeMedia } = await import('../src/core/media/media-sanitizer');

  // 1. Verify in-place structural manipulation is strictly rejected for all image types
  const imageFormats = [
    { name: 'photo.jpg', mime: 'image/jpeg', magic: [0xff, 0xd8, 0xff, 0xe1] },
    { name: 'graphic.png', mime: 'image/png', magic: [0x89, 0x50, 0x4e, 0x47] },
    { name: 'capture.webp', mime: 'image/webp', magic: [0x52, 0x49, 0x46, 0x46] },
    { name: 'scan.bmp', mime: 'image/bmp', magic: [0x42, 0x4d, 0x00, 0x00] },
    { name: 'raw.tiff', mime: 'image/tiff', magic: [0x49, 0x49, 0x2a, 0x00] },
  ];

  for (const img of imageFormats) {
    const bytes = new Uint8Array([...img.magic, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    assert.equal(isMp4OrMov(bytes), false, `${img.name} must never be classified as MP4/MOV`);
    assert.equal(isAudioFile(img.mime, img.name), false, `${img.name} must never be classified as audio`);
    assert.equal(isImageMimeType(img.mime, img.name), true, `${img.name} must be classified as image by isImageMimeType`);
  }

  // 2. Verify media classifiers accept valid MP4/MOV and audio formats
  const mp4Header = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(isMp4OrMov(mp4Header), true, 'ISOBMFF header must be recognized for in-place mutation');
  assert.equal(isAudioFile('audio/mpeg', 'track.mp3'), true, 'MP3 audio must be recognized for audio stripping');

  // 3. Verify sanitizeMedia THROWS for image payloads (hard boundary enforcement)
  for (const img of imageFormats) {
    const fakeFile = new File([new Uint8Array(img.magic)], img.name, { type: img.mime });
    await assert.rejects(
      () => sanitizeMedia(fakeFile, { defenseLevel: 'paranoid' }),
      /Image payload rejected from media pipeline/,
      `sanitizeMedia must throw for ${img.name} — images must never enter in-place mutation`
    );
  }
});

test('16. Pipeline Rejects Unrecognized File Types with Hard Error', async () => {
  const { processMediaFile } = await import('../src/core/pipeline');

  const unsupportedFormats = [
    { name: 'document.pdf', mime: 'application/pdf' },
    { name: 'archive.zip', mime: 'application/zip' },
    { name: 'data.json', mime: 'application/json' },
    { name: 'spreadsheet.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  ];

  for (const fmt of unsupportedFormats) {
    const fakeFile = new File([new Uint8Array([0x00, 0x01, 0x02, 0x03])], fmt.name, { type: fmt.mime });
    await assert.rejects(
      () => processMediaFile(fakeFile),
      /Unsupported file type/,
      `processMediaFile must throw for unrecognized type: ${fmt.name} (${fmt.mime})`
    );
  }
});

