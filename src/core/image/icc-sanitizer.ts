/**
 * Zero-Copy Binary Color Profile & Display Calibration Sanitizer
 *
 * Eliminates monitor-specific iCCP, cHRM, gAMA, and APP2 color profiles
 * that browsers inject during canvas export (toBlob / convertToBlob),
 * preventing hardware display fingerprinting and OS calibration leaks.
 */

// PNG FourCC Constants
const FOURCC_ICCP = 0x69434350; // 'iCCP'
const FOURCC_CHRM = 0x6348524d; // 'cHRM'
const FOURCC_GAMA = 0x67414d41; // 'gAMA'
const FOURCC_EXIF = 0x65584966; // 'eXIf'
const FOURCC_TEXT = 0x74455874; // 'tEXt'
const FOURCC_ZTXT = 0x7a545874; // 'zTXt'
const FOURCC_ITXT = 0x69545874; // 'iTXt'
const FOURCC_TIME = 0x74494d45; // 'tIME'
const FOURCC_PHYS = 0x70485973; // 'pHYs'

// WebP FourCC Constants
const WEBP_ICCP = 0x49434350; // 'ICCP'
const WEBP_EXIF = 0x45584946; // 'EXIF'
const WEBP_XMP  = 0x584d5020; // 'XMP '

/**
 * Strips display calibration and color profiles from image bitstreams.
 */
export function stripDisplayColorProfiles(bytes: Uint8Array, mimeType: string): Uint8Array {
  if (bytes.length < 12) return bytes;

  // PNG
  if (
    mimeType === 'image/png' ||
    (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
  ) {
    return stripPngColorProfiles(bytes);
  }

  // JPEG
  if (
    mimeType === 'image/jpeg' ||
    (bytes[0] === 0xff && bytes[1] === 0xd8)
  ) {
    return stripJpegColorProfiles(bytes);
  }

  // WebP
  if (
    mimeType === 'image/webp' ||
    (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)
  ) {
    return stripWebpColorProfiles(bytes);
  }

  return bytes;
}

/**
 * Strips iCCP, cHRM, gAMA, and ancillary metadata chunks from a PNG stream.
 */
function stripPngColorProfiles(input: Uint8Array): Uint8Array {
  if (input.length < 8) return input;
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);

  // Check 8-byte PNG signature
  if (view.getUint32(0, false) !== 0x89504e47 || view.getUint32(4, false) !== 0x0d0a1a0a) {
    return input;
  }

  const output = new Uint8Array(input.length);
  output.set(input.subarray(0, 8), 0);
  let readPos = 8;
  let writePos = 8;
  const len = input.length;

  while (readPos + 8 <= len) {
    const chunkLen = view.getUint32(readPos, false);
    const chunkType = view.getUint32(readPos + 4, false);
    const totalChunkLen = 12 + chunkLen;

    if (readPos + totalChunkLen > len) break;

    // Eliminate display calibration and ancillary chunks
    const isForbidden =
      chunkType === FOURCC_ICCP || // iCCP - ICC color profile
      chunkType === FOURCC_CHRM || // cHRM - chromaticities
      chunkType === FOURCC_GAMA || // gAMA - gamma curve
      chunkType === FOURCC_EXIF || // eXIf
      chunkType === FOURCC_TEXT || // tEXt
      chunkType === FOURCC_ZTXT || // zTXt
      chunkType === FOURCC_ITXT || // iTXt
      chunkType === FOURCC_TIME || // tIME
      chunkType === FOURCC_PHYS;   // pHYs

    if (!isForbidden) {
      output.set(input.subarray(readPos, readPos + totalChunkLen), writePos);
      writePos += totalChunkLen;
    }

    readPos += totalChunkLen;
  }

  return output.subarray(0, writePos);
}

/**
 * Strips APP2 ICC_PROFILE and ancillary APP segments from a JPEG stream.
 */
function stripJpegColorProfiles(input: Uint8Array): Uint8Array {
  if (input.length < 4 || input[0] !== 0xff || input[1] !== 0xd8) return input;

  const output = new Uint8Array(input.length);
  output[0] = 0xff;
  output[1] = 0xd8;
  let writePos = 2;
  let readPos = 2;
  const len = input.length;

  while (readPos < len - 1) {
    if (input[readPos] !== 0xff) {
      output[writePos++] = input[readPos++];
      continue;
    }

    const marker = input[readPos + 1];

    if (marker === 0xff || marker === 0x00) {
      output[writePos++] = input[readPos++];
      continue;
    }

    // EOI (End of Image)
    if (marker === 0xd9) {
      output[writePos++] = 0xff;
      output[writePos++] = 0xd9;
      break;
    }

    // SOS (Start of Scan) - Entropy stream follows until EOI
    if (marker === 0xda) {
      const remaining = input.subarray(readPos);
      output.set(remaining, writePos);
      writePos += remaining.length;
      break;
    }

    if (readPos + 3 >= len) break;
    const segLen = (input[readPos + 2] << 8) | input[readPos + 3];
    const totalSegLen = 2 + segLen;

    if (readPos + totalSegLen > len) break;

    let isForbidden = false;

    if (marker === 0xe2) {
      // APP2 - Check for 'ICC_PROFILE\0'
      if (
        readPos + 15 <= len &&
        input[readPos + 4] === 0x49 && // I
        input[readPos + 5] === 0x43 && // C
        input[readPos + 6] === 0x43 && // C
        input[readPos + 7] === 0x5f && // _
        input[readPos + 8] === 0x50 && // P
        input[readPos + 9] === 0x52 && // R
        input[readPos + 10] === 0x4f && // O
        input[readPos + 11] === 0x46 && // F
        input[readPos + 12] === 0x49 && // I
        input[readPos + 13] === 0x4c && // L
        input[readPos + 14] === 0x45 && // E
        input[readPos + 15] === 0x00    // \0
      ) {
        isForbidden = true;
      }
    } else if (marker === 0xe1) {
      // APP1 (EXIF / XMP)
      isForbidden = true;
    } else if (marker === 0xed || marker === 0xee || marker === 0xfe) {
      // APP13, APP14, COM
      isForbidden = true;
    } else if (marker >= 0xe3 && marker <= 0xef) {
      // APP3..APP15 vendor markers
      isForbidden = true;
    }

    if (!isForbidden) {
      output.set(input.subarray(readPos, readPos + totalSegLen), writePos);
      writePos += totalSegLen;
    }

    readPos += totalSegLen;
  }

  return output.subarray(0, writePos);
}

// WebP Chunk FourCC Constants
const WEBP_VP8X = 0x56503858; // 'VP8X'
const WEBP_ALPH = 0x414c5048; // 'ALPH'
const WEBP_VP8_ = 0x56503820; // 'VP8 '
const WEBP_VP8L = 0x5650384c; // 'VP8L'
const WEBP_ANIM = 0x414e494d; // 'ANIM'
const WEBP_ANMF = 0x414e4d46; // 'ANMF'

// WebP VP8X Flag Bits (RFC 9649 Section 2.7)
const WEBP_VP8X_FLAG_ICC = 0x20;
const WEBP_VP8X_FLAG_ALPHA = 0x10;
const WEBP_VP8X_FLAG_EXIF = 0x08;
const WEBP_VP8X_FLAG_XMP = 0x04;
const WEBP_VP8X_FLAG_ANIM = 0x02;
const WEBP_VP8X_PAYLOAD_LEN = 10;

interface WebpChunkRef {
  offset: number;
  payloadLen: number;
  type: number;
}

/**
 * Strips ICCP, EXIF, XMP, and non-whitelisted chunks from a WebP RIFF stream.
 * Enforces RFC 9649 / RIFF framing:
 * - Chunk size fields exclude trailing pad bytes; odd chunks emit an explicit 0x00 pad byte.
 * - Tolerates a missing trailing pad byte on an odd final chunk at EOF by clamping read bounds.
 * - Recomputes the RIFF header size as (totalChunksBytes + 4), always even.
 * - Keeps VP8X flags strictly consistent with the remaining chunks (omitting VP8X for Simple WebP).
 */
function stripWebpColorProfiles(input: Uint8Array): Uint8Array {
  if (input.length < 12) return input;
  const inView = new DataView(input.buffer, input.byteOffset, input.byteLength);

  if (inView.getUint32(0, false) !== 0x52494646 || inView.getUint32(8, false) !== 0x57454250) {
    return input;
  }

  // Clamp parse limit to declared RIFF container boundary to ignore trailing garbage past RIFF EOF
  const declaredRiffSize = inView.getUint32(4, true);
  const riffEnd = declaredRiffSize >= 4 ? 8 + declaredRiffSize : input.length;
  const parseLimit = Math.min(input.length, riffEnd);

  // Pass 1: Walk RIFF chunks under strict whitelist and EOF clamping
  let vp8xChunk: WebpChunkRef | null = null;
  const safeChunks: WebpChunkRef[] = [];

  let readPos = 12;
  while (readPos + 8 <= parseLimit) {
    const chunkType = inView.getUint32(readPos, false);
    const chunkLen = inView.getUint32(readPos + 4, true);
    const payloadEnd = readPos + 8 + chunkLen;

    // Stop cleanly if chunk payload exceeds container bounds
    if (payloadEnd > parseLimit) break;

    const padLen = chunkLen & 1;
    const nextPos = payloadEnd + padLen;
    // Tolerate omitted pad byte on an odd final chunk at EOF without over-reading
    const clampedNextPos = nextPos > parseLimit ? parseLimit : nextPos;

    if (chunkType === WEBP_VP8X) {
      if (chunkLen === WEBP_VP8X_PAYLOAD_LEN && vp8xChunk === null) {
        vp8xChunk = { offset: readPos, payloadLen: chunkLen, type: chunkType };
      }
    } else if (
      chunkType === WEBP_ALPH ||
      chunkType === WEBP_ANIM ||
      chunkType === WEBP_ANMF ||
      chunkType === WEBP_VP8_ ||
      chunkType === WEBP_VP8L
    ) {
      safeChunks.push({ offset: readPos, payloadLen: chunkLen, type: chunkType });
    } else if (chunkType === WEBP_ICCP || chunkType === WEBP_EXIF || chunkType === WEBP_XMP) {
      // Explicitly strip forbidden metadata chunks
    }
    // Any other unrecognized FourCC is discarded under strict whitelist policy

    readPos = clampedNextPos;
  }

  // Pass 2: Recompute exact output layout and enforce VP8X flag-to-chunk consistency
  const remainingHasAlph = safeChunks.some(c => c.type === WEBP_ALPH);
  const remainingHasAnim = safeChunks.some(c => c.type === WEBP_ANIM || c.type === WEBP_ANMF);
  const remainingHasIcc = safeChunks.some(c => c.type === WEBP_ICCP);
  const remainingHasExif = safeChunks.some(c => c.type === WEBP_EXIF);
  const remainingHasXmp = safeChunks.some(c => c.type === WEBP_XMP);

  const emitVp8x = (remainingHasAlph || remainingHasAnim) && vp8xChunk !== null;
  let totalChunksBytes = emitVp8x ? 8 + WEBP_VP8X_PAYLOAD_LEN : 0;
  for (const chunk of safeChunks) {
    totalChunksBytes += 8 + chunk.payloadLen + (chunk.payloadLen & 1);
  }

  const totalOutBytes = 12 + totalChunksBytes;
  const output = new Uint8Array(totalOutBytes);
  output.set(input.subarray(0, 12), 0);
  const outView = new DataView(output.buffer, output.byteOffset, output.byteLength);
  let writePos = 12;

  if (emitVp8x && vp8xChunk !== null) {
    const vp8xBytes = 8 + WEBP_VP8X_PAYLOAD_LEN;
    output.set(input.subarray(vp8xChunk.offset, vp8xChunk.offset + vp8xBytes), writePos);
    let flags = 0;
    if (remainingHasIcc) flags |= WEBP_VP8X_FLAG_ICC;
    if (remainingHasAlph) flags |= WEBP_VP8X_FLAG_ALPHA;
    if (remainingHasExif) flags |= WEBP_VP8X_FLAG_EXIF;
    if (remainingHasXmp) flags |= WEBP_VP8X_FLAG_XMP;
    if (remainingHasAnim) flags |= WEBP_VP8X_FLAG_ANIM;
    output[writePos + 8] = flags;
    output[writePos + 9] = 0;
    output[writePos + 10] = 0;
    output[writePos + 11] = 0;
    writePos += vp8xBytes;
  }

  for (const chunk of safeChunks) {
    const rawChunkBytes = 8 + chunk.payloadLen;
    output.set(input.subarray(chunk.offset, chunk.offset + rawChunkBytes), writePos);
    writePos += rawChunkBytes;
    if ((chunk.payloadLen & 1) === 1) {
      output[writePos++] = 0x00;
    }
  }

  // RIFF size = total chunk bytes + 4 ('WEBP'), guaranteed even
  outView.setUint32(4, totalChunksBytes + 4, true);

  return output;
}


