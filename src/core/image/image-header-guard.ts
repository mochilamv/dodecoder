/**
 * Pure Pre-Decode Image Header Dimension Parser & Decompression-Bomb Guard.
 *
 * Parses image dimensions directly from container/frame headers without allocating
 * pixel buffers or invoking browser decoders (createImageBitmap). Enforces a strict
 * fail-closed policy on invalid, truncated, or unrecognized headers across all
 * accepted image formats (JPEG, PNG, WebP, GIF, BMP, TIFF).
 */

export type ImageHeaderFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff';

export const MAX_IMAGE_DIMENSION = 16384;
export const MAX_IMAGE_PIXELS = 64_000_000;
const TIFF_MAX_IFD_ENTRIES = 512;

export type ImageGuardErrorCode =
  | 'UNSUPPORTED_OR_INVALID_IMAGE_HEADER'
  | 'INVALID_IMAGE_DIMENSIONS'
  | 'IMAGE_DIMENSION_LIMIT_EXCEEDED'
  | 'IMAGE_PIXEL_COUNT_LIMIT_EXCEEDED';

export interface ParsedImageHeader {
  readonly format: ImageHeaderFormat;
  readonly width: number;
  readonly height: number;
}

export class ImageDecompressionGuardError extends RangeError {
  public readonly code: ImageGuardErrorCode;
  public readonly width?: number;
  public readonly height?: number;
  public readonly format?: ImageHeaderFormat;

  constructor(
    code: ImageGuardErrorCode,
    message: string,
    details?: { width?: number; height?: number; format?: ImageHeaderFormat }
  ) {
    super(message);
    this.name = 'ImageDecompressionGuardError';
    this.code = code;
    this.width = details?.width;
    this.height = details?.height;
    this.format = details?.format;
  }
}

function parsePngDimensions(bytes: Uint8Array, view: DataView): ParsedImageHeader | null {
  if (bytes.byteLength < 24) return null;
  if (
    view.getUint32(0, false) !== 0x89504e47 ||
    view.getUint32(4, false) !== 0x0d0a1a0a
  ) {
    return null;
  }
  const ihdrLen = view.getUint32(8, false);
  const ihdrTag = view.getUint32(12, false);
  if (ihdrLen !== 13 || ihdrTag !== 0x49484452) return null;

  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  return { format: 'png', width, height };
}

function isJpegSofMarker(marker: number): boolean {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function isJpegStandaloneMarker(marker: number): boolean {
  return marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9);
}

function parseJpegDimensions(bytes: Uint8Array): ParsedImageHeader | null {
  const len = bytes.byteLength;
  if (len < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let pos = 2;
  while (pos < len) {
    // Expect marker prefix 0xFF
    if (bytes[pos] !== 0xff) return null;
    while (pos < len && bytes[pos] === 0xff) {
      pos++;
    }
    if (pos >= len) return null;

    const marker = bytes[pos++];
    if (marker === 0x00) return null;

    // EOI or SOS before any SOF means no valid frame dimensions exist
    if (marker === 0xd9 || marker === 0xda) return null;

    if (isJpegStandaloneMarker(marker)) {
      continue;
    }

    if (pos + 2 > len) return null;
    const segLen = (bytes[pos] << 8) | bytes[pos + 1];
    if (segLen < 2 || pos + segLen > len) return null;

    if (isJpegSofMarker(marker)) {
      if (segLen < 7) return null;
      const height = (bytes[pos + 3] << 8) | bytes[pos + 4];
      const width = (bytes[pos + 5] << 8) | bytes[pos + 6];
      return { format: 'jpeg', width, height };
    }

    pos += segLen;
  }

  return null;
}

function parseWebpDimensions(bytes: Uint8Array, view: DataView): ParsedImageHeader | null {
  const len = bytes.byteLength;
  if (len < 20) return null;
  if (
    view.getUint32(0, false) !== 0x52494646 || // 'RIFF'
    view.getUint32(8, false) !== 0x57454250    // 'WEBP'
  ) {
    return null;
  }

  const chunkType = view.getUint32(12, false);
  const chunkLen = view.getUint32(16, true);
  if (20 + chunkLen > len) return null;

  // VP8X extended header (RFC 9649 Section 2.7)
  if (chunkType === 0x56503858) {
    if (chunkLen < 10 || len < 30) return null;
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { format: 'webp', width, height };
  }

  // VP8 lossy bitstream (RFC 6386 Section 9.1)
  if (chunkType === 0x56503820) {
    if (chunkLen < 10 || len < 30) return null;
    // Keyframe bit (bit 0 of first frame tag byte) must be 0; start code 0x9d 0x01 0x2a
    if ((bytes[20] & 0x01) !== 0) return null;
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    const width = view.getUint16(26, true) & 0x3fff;
    const height = view.getUint16(28, true) & 0x3fff;
    return { format: 'webp', width, height };
  }

  // VP8L lossless bitstream (RFC 9649 Section 3)
  if (chunkType === 0x5650384c) {
    if (chunkLen < 5 || len < 25) return null;
    if (bytes[20] !== 0x2f) return null;
    const bits = view.getUint32(21, true);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >>> 14) & 0x3fff) + 1;
    return { format: 'webp', width, height };
  }

  return null;
}

function parseGifDimensions(bytes: Uint8Array, view: DataView): ParsedImageHeader | null {
  if (bytes.byteLength < 10) return null;
  if (
    bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x38 ||
    (bytes[4] !== 0x37 && bytes[4] !== 0x39) || bytes[5] !== 0x61
  ) {
    return null;
  }
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  return { format: 'gif', width, height };
}

function parseBmpDimensions(bytes: Uint8Array, view: DataView): ParsedImageHeader | null {
  const len = bytes.byteLength;
  if (len < 22 || bytes[0] !== 0x42 || bytes[1] !== 0x4d) return null;

  const dibSize = view.getUint32(14, true);
  if (dibSize === 12) {
    // BITMAPCOREHEADER
    if (len < 22) return null;
    const width = view.getUint16(18, true);
    const height = view.getUint16(20, true);
    return { format: 'bmp', width, height };
  }

  if (dibSize >= 40) {
    // BITMAPINFOHEADER and later variants
    if (len < 26) return null;
    const rawW = view.getInt32(18, true);
    const rawH = view.getInt32(22, true);
    if (rawW <= 0 || rawH === 0 || rawH === -2147483648) return null;
    return { format: 'bmp', width: rawW, height: Math.abs(rawH) };
  }

  return null;
}

function parseTiffDimensions(bytes: Uint8Array, view: DataView): ParsedImageHeader | null {
  const len = bytes.byteLength;
  if (len < 8) return null;

  let littleEndian: boolean;
  if (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) {
    littleEndian = true;
  } else if (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a) {
    littleEndian = false;
  } else {
    return null;
  }

  const ifdOffset = view.getUint32(4, littleEndian);
  if (ifdOffset < 8 || ifdOffset + 2 > len) return null;

  const entryCount = view.getUint16(ifdOffset, littleEndian);
  if (entryCount === 0 || entryCount > TIFF_MAX_IFD_ENTRIES) return null;

  const entriesEnd = ifdOffset + 2 + entryCount * 12;
  if (entriesEnd > len) return null;

  let width: number | null = null;
  let height: number | null = null;

  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag !== 0x0100 && tag !== 0x0101) continue;

    const fieldType = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    if (count !== 1) return null;

    let value: number;
    if (fieldType === 3) {
      // SHORT (uint16 stored in first 2 bytes of value/offset field)
      value = view.getUint16(entryOffset + 8, littleEndian);
    } else if (fieldType === 4) {
      // LONG (uint32)
      value = view.getUint32(entryOffset + 8, littleEndian);
    } else {
      return null;
    }

    if (tag === 0x0100) width = value;
    else height = value;

    if (width !== null && height !== null) break;
  }

  if (width === null || height === null) return null;
  return { format: 'tiff', width, height };
}

/**
 * Parses image container header dimensions without decoding pixels.
 * Returns null if the input does not match a valid supported image header.
 */
export function parseImageHeaderDimensions(input: Uint8Array | ArrayBuffer): ParsedImageHeader | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength < 4) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return parsePngDimensions(bytes, view);
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return parseJpegDimensions(bytes);
  }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return parseWebpDimensions(bytes, view);
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return parseGifDimensions(bytes, view);
  }
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return parseBmpDimensions(bytes, view);
  }
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  ) {
    return parseTiffDimensions(bytes, view);
  }

  return null;
}

/**
 * Strict fail-closed pre-decode decompression-bomb guard.
 * Throws ImageDecompressionGuardError if the header is invalid/unrecognized or if
 * declared dimensions exceed MAX_IMAGE_DIMENSION or MAX_IMAGE_PIXELS.
 */
export function assertSafeImageDimensions(
  input: Uint8Array | ArrayBuffer,
  maxDimension: number = MAX_IMAGE_DIMENSION,
  maxPixels: number = MAX_IMAGE_PIXELS
): ParsedImageHeader {
  const parsed = parseImageHeaderDimensions(input);
  if (!parsed) {
    throw new ImageDecompressionGuardError(
      'UNSUPPORTED_OR_INVALID_IMAGE_HEADER',
      'Unable to verify image header dimensions before decode; rejecting malformed or unsupported image container.'
    );
  }

  const { format, width, height } = parsed;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new ImageDecompressionGuardError(
      'INVALID_IMAGE_DIMENSIONS',
      `Invalid ${format.toUpperCase()} header dimensions: ${width}x${height}`,
      { width, height, format }
    );
  }

  if (width > maxDimension || height > maxDimension) {
    throw new ImageDecompressionGuardError(
      'IMAGE_DIMENSION_LIMIT_EXCEEDED',
      `${format.toUpperCase()} dimension ${width}x${height} exceeds safe pre-decode limit ${maxDimension}px`,
      { width, height, format }
    );
  }

  const pixelCount = width * height;
  if (!Number.isSafeInteger(pixelCount) || pixelCount > maxPixels) {
    throw new ImageDecompressionGuardError(
      'IMAGE_PIXEL_COUNT_LIMIT_EXCEEDED',
      `${format.toUpperCase()} pixel count ${pixelCount} (${width}x${height}) exceeds safe pre-decode limit ${maxPixels}`,
      { width, height, format }
    );
  }

  return parsed;
}
