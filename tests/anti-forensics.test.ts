import test from 'node:test';
import assert from 'node:assert/strict';
import { generateEphemeralSaltedName, generateRandomName } from '../src/core/forensic/hash-naming';
import { calculateAntiPrnuConfig } from '../src/core/image/prnu-defense';
import { inspectBinaryMarkers } from '../src/core/forensic/marker-parser';
import { createSanitizedZipBundle } from '../src/core/utils/zip-export';
import { SanitizedResult } from '../src/core/types';

test('1. Cryptographic Hashing and Ephemeral Salting', async () => {
  const sampleData = new TextEncoder().encode('anti-forensic-pure-payload');
  const hashedName1 = await generateEphemeralSaltedName(sampleData, '.JPEG', 16);
  const hashedName2 = await generateEphemeralSaltedName(sampleData, '.JPEG', 16);

  // Assert distinct names due to CSPRNG salting, despite same payload
  assert.notEqual(hashedName1, hashedName2, 'CSPRNG salting must generate distinct hashes for same payloads');
  assert.equal(hashedName1.length, 21); // 16 chars + .jpeg (5 chars)
  assert.ok(hashedName1.endsWith('.jpeg'));

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

test('5. MP4 Recursive Box Stripping (mdhd zeroing) and mdat wipe', async () => {
  const syntheticMp4 = new Uint8Array([
    // ftyp (16 bytes)
    0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    // moov (72 bytes total)
    0x00, 0x00, 0x00, 0x48, 0x6d, 0x6f, 0x6f, 0x76,
    // trak (56 bytes)
    0x00, 0x00, 0x00, 0x38, 0x74, 0x72, 0x61, 0x6b,
    // mdia (48 bytes)
    0x00, 0x00, 0x00, 0x30, 0x6d, 0x64, 0x69, 0x61,
    // mdhd (32 bytes) - inside mdia inside trak
    0x00, 0x00, 0x00, 0x20, 0x6d, 0x64, 0x68, 0x64, 0x00, 0x00, 0x00, 0x00,
    0x12, 0x34, 0x56, 0x78, // creation timestamp
    0x9a, 0xbc, 0xde, 0xf0, // modification timestamp
    0x00, 0x00, 0x03, 0xe8, 0x00, 0x00, 0x00, 0x64, 0x00, 0x01, 0x00, 0x00,
    // udta (8 bytes) inside moov - to be stripped
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
  
  // Check udta was removed
  const hasUdta = cleanBytes.some((_, i) => i + 4 <= cleanBytes.length && cleanBytes[i]===0x75 && cleanBytes[i+1]===0x64 && cleanBytes[i+2]===0x74 && cleanBytes[i+3]===0x61);
  assert.equal(hasUdta, false, 'udta box must not exist');

  // Check mdhd timestamps zeroed out
  // The mdhd will be inside the rebuilt box structure.
  // Search for 'mdhd' (0x6d646864)
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
