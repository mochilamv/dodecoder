import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSha256, generateHashedName, generateRandomName } from '../src/core/forensic/hash-naming';
import { calculateAntiPrnuConfig } from '../src/core/image/prnu-defense';
import { inspectBinaryMarkers } from '../src/core/forensic/marker-parser';
import { createSanitizedZipBundle } from '../src/core/utils/zip-export';
import { SanitizedResult } from '../src/core/types';

test('1. Cryptographic Hashing and Name Sanitization', async () => {
  const sampleData = new TextEncoder().encode('anti-forensic-pure-payload');
  const hash = await computeSha256(sampleData);

  assert.equal(typeof hash, 'string');
  assert.equal(hash.length, 64);

  const hashedName = await generateHashedName(sampleData, '.JPEG', 16);
  assert.equal(hashedName.length, 21); // 16 chars + .jpg (5 chars)
  assert.ok(hashedName.endsWith('.jpeg'));
  assert.equal(hashedName.slice(0, 16), hash.slice(0, 16));

  const randomName = generateRandomName('webp', 8);
  assert.equal(randomName.length, 21); // 16 hex chars (8 bytes) + .webp
  assert.ok(randomName.endsWith('.webp'));
});

test('2. Anti-PRNU Configuration Calculations', () => {
  const std = calculateAntiPrnuConfig(1920, 1080, 'standard');
  assert.equal(std.cropLeft, 0);
  assert.equal(std.cropTop, 0);
  assert.equal(std.scaleX, 1.0);
  assert.equal(std.noiseIntensity, 0);

  const hardened = calculateAntiPrnuConfig(1920, 1080, 'hardened');
  assert.ok(hardened.cropLeft >= 1 && hardened.cropLeft <= 3);
  assert.ok(hardened.scaleX < 1.0);
  assert.equal(hardened.noiseIntensity, 0);

  const paranoid = calculateAntiPrnuConfig(1920, 1080, 'paranoid');
  assert.ok(paranoid.cropLeft >= 2 && paranoid.cropLeft <= 6);
  assert.ok(paranoid.scaleX < 1.0);
  assert.equal(paranoid.noiseIntensity, 2);
});

test('3. Binary Marker Parsing & Forensic Trap Detection', () => {
  // Construct a synthetic JPEG with: SOI, APP1 (EXIF), DQT, SOS, EOI
  const fakeExifHeader = [
    0xff, 0xd8, // SOI
    0xff, 0xe1, 0x00, 0x0a, // APP1 length 10 (2 bytes length + 8 bytes payload)
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x11, 0x22, // 'Exif\0\0'
    0xff, 0xdb, 0x00, 0x04, 0x00, 0x01, // DQT length 4
    0xff, 0xda, // SOS
    0x10, 0x20, // entropy data
    0xff, 0xd9, // EOI
  ];

  const buffer = new Uint8Array(fakeExifHeader).buffer;
  const markers = inspectBinaryMarkers(buffer);

  assert.ok(markers.length >= 4);
  const app1 = markers.find(m => m.marker === '0xFFE1');
  assert.ok(app1, 'APP1 marker should be detected');
  assert.equal(app1.isSanitizedSafe, false, 'EXIF APP1 must be flagged as unsafe');

  const dqt = markers.find(m => m.marker === '0xFFDB');
  assert.ok(dqt, 'DQT marker should be detected');
  assert.equal(dqt.isSanitizedSafe, true, 'DQT is a standard visual compression table');

  const eoi = markers.find(m => m.marker === '0xFFD9');
  assert.ok(eoi, 'EOI marker should be detected');
});

test('4. PNG Chunk Parsing & Ancillary Metadata Detection', () => {
  // Construct a synthetic PNG with: Signature, IHDR, tEXt, IEND
  const fakePng = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x01, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x00, 0x00, // IHDR
    0x00, 0x00, 0x00, 0x04, 0x74, 0x45, 0x58, 0x74, 0x61, 0x62, 0x63, 0x64, 0x00, 0x00, 0x00, 0x00, // tEXt
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82, // IEND
  ];

  const buffer = new Uint8Array(fakePng).buffer;
  const chunks = inspectBinaryMarkers(buffer);

  const ihdr = chunks.find(c => c.marker === 'IHDR');
  assert.ok(ihdr);
  assert.equal(ihdr.isSanitizedSafe, true);

  const textChunk = chunks.find(c => c.marker === 'tEXt');
  assert.ok(textChunk);
  assert.equal(textChunk.isSanitizedSafe, false, 'tEXt chunk must be flagged as unsafe');
});

test('5. Zero-Trace ZIP Bundle Timestamp Normalization', async () => {
  const dummyItem: SanitizedResult = {
    blob: new Blob(['sanitized-bytes'], { type: 'image/webp' }),
    originalName: 'IMG_20260927_150000.jpg',
    sanitizedName: '8a4f9b2dc3e1f0a2.webp',
    originalSize: 1000,
    sanitizedSize: 800,
    format: 'image/webp',
    sha256: '8a4f9b2dc3e1f0a28a4f9b2dc3e1f0a28a4f9b2dc3e1f0a28a4f9b2dc3e1f0a2',
    defenseLevel: 'hardened',
    auditBefore: {
      fileName: 'IMG_20260927_150000.jpg',
      fileSize: 1000,
      mimeType: 'image/jpeg',
      hasExif: true,
      hasGps: true,
      hasThumbnail: true,
      hasMakerNotes: true,
      tags: [],
      markers: [],
      prnuSusceptibility: 'high',
      sha256: '1111111111111111111111111111111111111111111111111111111111111111',
    },
    auditAfter: {
      fileName: '8a4f9b2dc3e1f0a2.webp',
      fileSize: 800,
      mimeType: 'image/webp',
      hasExif: false,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [],
      markers: [],
      prnuSusceptibility: 'low',
      sha256: '8a4f9b2dc3e1f0a28a4f9b2dc3e1f0a28a4f9b2dc3e1f0a28a4f9b2dc3e1f0a2',
    },
    processedAt: Date.now(),
  };

  const { zipBlob, zipFileName } = await createSanitizedZipBundle([dummyItem]);
  assert.ok(zipBlob.size > 0);
  assert.ok(zipFileName.startsWith('bundle_'));
  assert.ok(zipFileName.endsWith('.zip'));
});

test('6. MP4 Container Box Stripping & mvhd Timestamp Zeroing', async () => {
  // Construct a synthetic MP4:
  // ftyp box (16 bytes) + moov box containing mvhd (32 bytes) and udta (16 bytes)
  const syntheticMp4 = new Uint8Array([
    // ftyp (16 bytes)
    0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    // moov (total 56 bytes)
    0x00, 0x00, 0x00, 0x38, 0x6d, 0x6f, 0x6f, 0x76,
    // mvhd (32 bytes)
    0x00, 0x00, 0x00, 0x20, 0x6d, 0x76, 0x68, 0x64, 0x00, 0x00, 0x00, 0x00,
    0x12, 0x34, 0x56, 0x78, // creation timestamp (non-zero)
    0x9a, 0xbc, 0xde, 0xf0, // modification timestamp (non-zero)
    0x00, 0x00, 0x03, 0xe8, 0x00, 0x00, 0x00, 0x64, 0x00, 0x01, 0x00, 0x00,
    // udta (16 bytes - dangerous metadata to be stripped)
    0x00, 0x00, 0x00, 0x10, 0x75, 0x64, 0x74, 0x61, 0x47, 0x50, 0x53, 0x20, 0x44, 0x41, 0x54, 0x41
  ]);

  const file = new File([syntheticMp4], 'test_video.mp4', { type: 'video/mp4' });
  const { sanitizeMedia } = await import('../src/core/media/media-sanitizer');
  const result = await sanitizeMedia(file, { defenseLevel: 'standard' });

  assert.ok(result.sanitizedSize < syntheticMp4.length, 'Output must be smaller because udta was stripped');
  const cleanBuffer = await result.blob.arrayBuffer();
  const cleanView = new DataView(cleanBuffer);

  // Check that moov exists and udta was eliminated
  const cleanBytes = new Uint8Array(cleanBuffer);
  const udtaFound = cleanBytes.some((_, i) =>
    i + 4 <= cleanBytes.length &&
    cleanBytes[i] === 0x75 && cleanBytes[i+1] === 0x64 && cleanBytes[i+2] === 0x74 && cleanBytes[i+3] === 0x61
  );
  assert.equal(udtaFound, false, 'udta box must not exist in sanitized stream');

  // Check mvhd timestamps zeroed out
  // mvhd is at offset 24 (16 ftyp + 8 moov header) -> timestamp at offset 36
  assert.equal(cleanView.getUint32(36, false), 0, 'mvhd creation timestamp must be zeroed');
  assert.equal(cleanView.getUint32(40, false), 0, 'mvhd modification timestamp must be zeroed');
});

test('7. Audio ID3 Header Stripping', async () => {
  // Construct a synthetic MP3 with ID3v2 header at start and ID3v1 at end
  const id3v2Header = new Uint8Array([
    0x49, 0x44, 0x33, // 'ID3'
    0x03, 0x00, 0x00, // v2.3
    0x00, 0x00, 0x00, 0x04, // 4 synchsafe bytes = 4 bytes of tag payload
    0x01, 0x02, 0x03, 0x04 // 4 bytes of tag payload
  ]);
  const audioData = new Uint8Array([0xff, 0xfb, 0x90, 0x44, 0x00, 0x01, 0x02, 0x03]); // pure frame
  const id3v1Header = new Uint8Array(128);
  id3v1Header[0] = 0x54; id3v1Header[1] = 0x41; id3v1Header[2] = 0x47; // 'TAG'

  const fullAudio = new Uint8Array(id3v2Header.length + audioData.length + id3v1Header.length);
  fullAudio.set(id3v2Header, 0);
  fullAudio.set(audioData, id3v2Header.length);
  fullAudio.set(id3v1Header, id3v2Header.length + audioData.length);

  const file = new File([fullAudio], 'recording.mp3', { type: 'audio/mpeg' });
  const { sanitizeMedia } = await import('../src/core/media/media-sanitizer');
  const result = await sanitizeMedia(file, { defenseLevel: 'standard' });

  assert.equal(result.sanitizedSize, audioData.length, 'Sanitized audio must contain strictly raw frame payload');
});

test('8. Edge Cases: Empty Buffers and Arbitrary File Names', async () => {
  const emptyMarkers = inspectBinaryMarkers(new ArrayBuffer(0));
  assert.equal(emptyMarkers.length, 0);

  const oddName = await generateHashedName(new Uint8Array([1, 2, 3]), '..JPEG..');
  assert.ok(oddName.endsWith('.jpeg'));
  assert.ok(!oddName.includes('..'));
});
