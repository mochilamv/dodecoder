import { MarkerInfo } from '../types';

// Pre-computed FourCC Constants
const FOURCC_IHDR = 0x49484452;
const FOURCC_PLTE = 0x504c5445;
const FOURCC_IDAT = 0x49444154;
const FOURCC_IEND = 0x49454e44;
const FOURCC_EXIF = 0x65584966;
const FOURCC_TEXT = 0x74455874;
const FOURCC_ZTXT = 0x7a545874;
const FOURCC_ITXT = 0x69545874;
const FOURCC_TIME = 0x74494d45;
const FOURCC_PHYS = 0x70485973;
const FOURCC_PNG_ICCP = 0x69434350;
const FOURCC_PNG_CHRM = 0x6348524d;
const FOURCC_PNG_GAMA = 0x67414d41;
const FOURCC_PNG_SRGB = 0x73524742;

const FOURCC_VP8_ = 0x56503820;
const FOURCC_VP8L = 0x5650384c;
const FOURCC_VP8X = 0x56503858;
const FOURCC_ANIM = 0x414e494d;
const FOURCC_ANMF = 0x414e4d46;
const FOURCC_WEBP_EXIF = 0x45584946;
const FOURCC_WEBP_XMP  = 0x584d5020;
const FOURCC_WEBP_ICCP = 0x49434350;
const FOURCC_WEBP_ALPH = 0x414c5048;

const FOURCC_UDTA = 0x75647461;
const FOURCC_META = 0x6d657461;
const FOURCC_ILST = 0x696c7374;
const FOURCC_UUID = 0x75756964;

/**
 * Deep Binary Marker and Container Segment Inspector
 * Micro-optimized with 32-bit integer matching to eradicate string allocations.
 */
export function inspectBinaryMarkers(buffer: ArrayBuffer): MarkerInfo[] {
  const bytes = new Uint8Array(buffer);
  const markers: MarkerInfo[] = [];

  if (bytes.length < 4) return markers;

  const view = new DataView(buffer);

  // Check JPEG (0xFF 0xD8)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return inspectJpegMarkers(bytes);
  }

  // Check PNG (0x89504E47)
  if (view.getUint32(0, false) === 0x89504e47) {
    return inspectPngChunks(bytes, view);
  }

  // Check WebP (RIFF .... WEBP)
  if (view.getUint32(0, false) === 0x52494646 && bytes.length >= 12 && view.getUint32(8, false) === 0x57454250) {
    return inspectWebPChunks(bytes, view);
  }

  // Check MP4/MOV ('ftyp')
  if (bytes.length > 12 && view.getUint32(4, false) === 0x66747970) {
    return inspectMp4Boxes(bytes, view);
  }

  return markers;
}

/**
 * Inspects raw JPEG markers
 */
function inspectJpegMarkers(bytes: Uint8Array): MarkerInfo[] {
  const markers: MarkerInfo[] = [];
  markers.push({
    offset: 0,
    marker: '0xFFD8',
    name: 'SOI (Start of Image)',
    isSanitizedSafe: true,
    description: 'Mandatory standard JPEG boundary marker',
  });

  let offset = 2;
  const len = bytes.length;

  while (offset < len - 1) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }

    const markerByte = bytes[offset + 1];

    if (markerByte === 0xff || markerByte === 0x00) {
      offset++;
      continue;
    }

    const markerHex = '0xFF' + markerByte.toString(16).toUpperCase().padStart(2, '0');

    if (markerByte === 0xd9) {
      markers.push({
        offset,
        marker: markerHex,
        name: 'EOI (End of Image)',
        isSanitizedSafe: true,
        description: 'End of image data stream',
      });
      break;
    }

    if (markerByte === 0xda) {
      markers.push({
        offset,
        marker: markerHex,
        name: 'SOS (Start of Scan)',
        isSanitizedSafe: true,
        description: 'Compressed image pixel bitstream follows',
      });
      offset += 2;
      while (offset < len - 1) {
        if (bytes[offset] === 0xff && bytes[offset + 1] !== 0x00 && bytes[offset + 1] <= 0xd9) {
          break;
        }
        offset++;
      }
      continue;
    }

    if (offset + 3 >= len) break;
    const markerLength = (bytes[offset + 2] << 8) | bytes[offset + 3];

    let name = `Segment (${markerHex})`;
    let isSafe = false;
    let description = '';

    switch (markerByte) {
      case 0xe0:
        name = 'APP0 (JFIF Header)';
        isSafe = true;
        description = 'Basic JPEG container identification';
        break;
      case 0xe1: {
        // Fast byte check for 'Exif' (0x45 0x78 0x69 0x66)
        if (
          bytes[offset + 4] === 0x45 &&
          bytes[offset + 5] === 0x78 &&
          bytes[offset + 6] === 0x69 &&
          bytes[offset + 7] === 0x66
        ) {
          name = 'APP1 (EXIF / GPS / IFD1 Thumbnail)';
          isSafe = false;
          description = 'High risk: contains camera serials, timestamps, GPS, and thumbnail traps';
        } else {
          name = 'APP1 (Metadata/XMP)';
          isSafe = false;
          description = 'Contains edit history, instance IDs, or XMP packets';
        }
        break;
      }
      case 0xe2:
        name = 'APP2 (ICC Color Profile)';
        isSafe = false;
        description = 'Contains OS calibration profile or author system identifiers';
        break;
      case 0xed:
        name = 'APP13 (Photoshop / IPTC)';
        isSafe = false;
        description = 'Contains bylines, captions, and Photoshop edit records';
        break;
      case 0xee:
        name = 'APP14 (Adobe DCT)';
        isSafe = false;
        description = 'Adobe color transform marker';
        break;
      case 0xdb:
        name = 'DQT (Quantization Table)';
        isSafe = true;
        description = 'Quantization matrix; forensic fingerprint of ISP encoder';
        break;
      case 0xc4:
        name = 'DHT (Huffman Table)';
        isSafe = true;
        description = 'Entropy encoding frequency table';
        break;
      case 0xc0:
      case 0xc2:
        name = `SOF (Start of Frame - ${markerByte === 0xc0 ? 'Baseline' : 'Progressive'})`;
        isSafe = true;
        description = 'Image dimensions, bit depth, and color components';
        break;
      case 0xfe:
        name = 'COM (Comment)';
        isSafe = false;
        description = 'Text comment embedded in image';
        break;
      default:
        if (markerByte >= 0xe3 && markerByte <= 0xef) {
          name = `APP${markerByte - 0xe0} (Vendor Marker)`;
          isSafe = false;
          description = 'Proprietary camera or software metadata block';
        }
    }

    markers.push({
      offset,
      marker: markerHex,
      name,
      length: markerLength,
      isSanitizedSafe: isSafe,
      description,
    });

    offset += 2 + markerLength;
  }

  return markers;
}

/**
 * Inspects PNG chunks using 32-bit integer matching
 */
function inspectPngChunks(_bytes: Uint8Array, view: DataView): MarkerInfo[] {
  const markers: MarkerInfo[] = [];
  let offset = 8;
  const len = view.byteLength;

  while (offset + 8 <= len) {
    const chunkLength = view.getUint32(offset, false);
    const chunkTypeInt = view.getUint32(offset + 4, false);

    let isSafe = false;
    let description = 'Image raster data or standard header';
    let chunkName = 'UNKNOWN';

    switch (chunkTypeInt) {
      case FOURCC_IHDR:
        isSafe = true;
        chunkName = 'IHDR';
        description = 'Header: Dimensions, depth, color type';
        break;
      case FOURCC_PLTE:
        isSafe = true;
        chunkName = 'PLTE';
        description = 'Palette table';
        break;
      case FOURCC_IDAT:
        isSafe = true;
        chunkName = 'IDAT';
        description = 'Compressed image pixel data';
        break;
      case FOURCC_IEND:
        isSafe = true;
        chunkName = 'IEND';
        description = 'End of PNG image';
        break;
      case FOURCC_EXIF:
        isSafe = false;
        chunkName = 'eXIf';
        description = 'Embedded raw EXIF metadata block';
        break;
      case FOURCC_TEXT:
        isSafe = false;
        chunkName = 'tEXt';
        description = 'Textual metadata (Creation time, software, author)';
        break;
      case FOURCC_ZTXT:
        isSafe = false;
        chunkName = 'zTXt';
        description = 'Compressed textual metadata';
        break;
      case FOURCC_ITXT:
        isSafe = false;
        chunkName = 'iTXt';
        description = 'Internationalized UTF-8 metadata';
        break;
      case FOURCC_TIME:
        isSafe = false;
        chunkName = 'tIME';
        description = 'Modification timestamp';
        break;
      case FOURCC_PHYS:
        isSafe = false;
        chunkName = 'pHYs';
        description = 'Physical pixel dimensions / DPI';
        break;
      case FOURCC_PNG_ICCP:
        isSafe = false;
        chunkName = 'iCCP';
        description = 'Embedded ICC Color Profile / Display calibration fingerprint';
        break;
      case FOURCC_PNG_CHRM:
        isSafe = false;
        chunkName = 'cHRM';
        description = 'Primary chromaticities display calibration';
        break;
      case FOURCC_PNG_GAMA:
        isSafe = false;
        chunkName = 'gAMA';
        description = 'Image gamma correction curve';
        break;
      case FOURCC_PNG_SRGB:
        isSafe = true;
        chunkName = 'sRGB';
        description = 'Standard sRGB color space rendering intent';
        break;
      default:
        chunkName = 'CHUNK';
        isSafe = false;
    }

    markers.push({
      offset,
      marker: chunkName,
      name: `Chunk: ${chunkName}`,
      length: chunkLength,
      isSanitizedSafe: isSafe,
      description,
    });

    offset += 12 + chunkLength;
  }

  return markers;
}

/**
 * Inspects WebP RIFF chunks
 */
function inspectWebPChunks(_bytes: Uint8Array, view: DataView): MarkerInfo[] {
  const markers: MarkerInfo[] = [];
  let offset = 12;
  const len = view.byteLength;

  while (offset + 8 <= len) {
    const fourCCInt = view.getUint32(offset, false);
    const chunkLength = view.getUint32(offset + 4, true); // WebP uses little-endian lengths

    let isSafe = false;
    let description = 'Visual raster bitstream';
    let chunkName = 'WEBP';

    switch (fourCCInt) {
      case FOURCC_VP8_:
        chunkName = 'VP8';
        isSafe = true;
        break;
      case FOURCC_VP8L:
        chunkName = 'VP8L';
        isSafe = true;
        break;
      case FOURCC_VP8X:
        chunkName = 'VP8X';
        isSafe = true;
        break;
      case FOURCC_ANIM:
        chunkName = 'ANIM';
        isSafe = true;
        break;
      case FOURCC_ANMF:
        chunkName = 'ANMF';
        isSafe = true;
        break;
      case FOURCC_WEBP_EXIF:
        chunkName = 'EXIF';
        isSafe = false;
        description = 'Embedded EXIF metadata block';
        break;
      case FOURCC_WEBP_XMP:
        chunkName = 'XMP';
        isSafe = false;
        description = 'Embedded XMP metadata block';
        break;
      case FOURCC_WEBP_ICCP:
        chunkName = 'ICCP';
        isSafe = false;
        description = 'ICC Color Profile';
        break;
      case FOURCC_WEBP_ALPH:
        chunkName = 'ALPH';
        isSafe = true;
        description = 'Canal de transparência alfa dos pixels reconstruídos';
        break;
      default:
        chunkName = 'CHUNK';
        isSafe = false;
    }

    markers.push({
      offset,
      marker: chunkName,
      name: `WebP Chunk: ${chunkName}`,
      length: chunkLength,
      isSanitizedSafe: isSafe,
      description,
    });

    const paddedLength = chunkLength + (chunkLength % 2);
    offset += 8 + paddedLength;
  }

  return markers;
}

/**
 * Inspects MP4/MOV top-level boxes
 */
function inspectMp4Boxes(_bytes: Uint8Array, view: DataView): MarkerInfo[] {
  const markers: MarkerInfo[] = [];
  let offset = 0;
  const len = view.byteLength;

  while (offset + 8 <= len) {
    const boxSize = view.getUint32(offset, false);
    const boxTypeInt = view.getUint32(offset + 4, false);

    if (boxSize < 8 && boxSize !== 0) break;

    const isDangerous =
      boxTypeInt === FOURCC_UDTA ||
      boxTypeInt === FOURCC_META ||
      boxTypeInt === FOURCC_ILST ||
      boxTypeInt === FOURCC_UUID;

    let boxName = 'BOX';
    let description = 'Video/Audio container structure';

    switch (boxTypeInt) {
      case FOURCC_UDTA:
        boxName = 'udta';
        description = 'User Data box (stores GPS, camera model, author)';
        break;
      case FOURCC_META:
        boxName = 'meta';
        description = 'Metadata box (tags, encoder settings)';
        break;
      case FOURCC_ILST:
        boxName = 'ilst';
        description = 'Item List atom (QuickTime/iTunes metadata)';
        break;
      case FOURCC_UUID:
        boxName = 'uuid';
        description = 'Vendor proprietary custom box';
        break;
      case 0x66747970:
        boxName = 'ftyp';
        break;
      case 0x6d6f6f76:
        boxName = 'moov';
        break;
      case 0x6d646174:
        boxName = 'mdat';
        break;
      default:
        boxName = 'atom';
    }

    markers.push({
      offset,
      marker: boxName,
      name: `Box: ${boxName}`,
      length: boxSize,
      isSanitizedSafe: !isDangerous,
      description,
    });

    if (boxSize === 0 || offset + boxSize > len) break;
    offset += boxSize;
  }

  return markers;
}

/**
 * Fast Binary Parser Counting Suspicious Metadata Tags
 *
 * Designed for the Fast-Track Bypass ("Strip Only"):
 * - JPEG: counts APP1/Exif, APP1/XMP, APP2/ICC_PROFILE, and IFD1
 *   (IFD1 detected by following next-IFD offset inside TIFF at ifd0Pos + 2 + entryCount * 12).
 * - PNG: counts eXIf, iCCP, tEXt, zTXt, iTXt.
 * - WebP: counts EXIF, XMP, ICCP.
 *
 * If return value === 0, file has zero identifying metadata tags.
 */
export function countSuspiciousMetadataTags(bytes: Uint8Array, mimeType?: string): number {
  if (bytes.length < 12) return 0;
  let count = 0;
  const len = bytes.length;

  // 1. JPEG
  if ((bytes[0] === 0xff && bytes[1] === 0xd8) || mimeType === 'image/jpeg') {
    let offset = 2;
    while (offset < len - 1) {
      if (bytes[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === 0xff || marker === 0x00) {
        offset++;
        continue;
      }
      if (marker === 0xd9 || marker === 0xda) {
        break; // EOI or SOS
      }
      if (offset + 3 >= len) break;
      const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
      const segStart = offset + 4;
      const segEnd = offset + 2 + segLen;
      if (segEnd > len) break;

      if (marker === 0xe1) {
        // APP1: Check if Exif
        const isExif =
          segStart + 6 <= segEnd &&
          bytes[segStart] === 0x45 &&
          bytes[segStart + 1] === 0x78 &&
          bytes[segStart + 2] === 0x69 &&
          bytes[segStart + 3] === 0x66 &&
          bytes[segStart + 4] === 0x00 &&
          bytes[segStart + 5] === 0x00;

        if (isExif) {
          count++; // APP1/Exif

          // Check embedded IFD1 pointer inside TIFF
          const tiffStart = segStart + 6;
          if (tiffStart + 8 <= segEnd) {
            const tiffView = new DataView(bytes.buffer, bytes.byteOffset + tiffStart, segEnd - tiffStart);
            const littleEndian = tiffView.getUint16(0) === 0x4949; // 'II'
            const ifd0Pos = tiffView.getUint32(4, littleEndian);
            if (ifd0Pos + 2 <= tiffView.byteLength) {
              const entryCount = tiffView.getUint16(ifd0Pos, littleEndian);
              const nextIfdPtrPos = ifd0Pos + 2 + entryCount * 12;
              if (nextIfdPtrPos + 4 <= tiffView.byteLength) {
                const nextIfdOffset = tiffView.getUint32(nextIfdPtrPos, littleEndian);
                if (nextIfdOffset !== 0) {
                  count++; // IFD1 (Thumbnail)
                }
              }
            }
          }
        } else {
          // APP1/XMP or other APP1
          count++;
        }
      } else if (marker === 0xe2) {
        // APP2: Check for ICC_PROFILE
        const isIcc =
          segStart + 12 <= segEnd &&
          bytes[segStart] === 0x49 &&
          bytes[segStart + 1] === 0x43 &&
          bytes[segStart + 2] === 0x43 &&
          bytes[segStart + 3] === 0x5f &&
          bytes[segStart + 4] === 0x50 &&
          bytes[segStart + 5] === 0x52 &&
          bytes[segStart + 6] === 0x4f &&
          bytes[segStart + 7] === 0x46 &&
          bytes[segStart + 8] === 0x49 &&
          bytes[segStart + 9] === 0x4c &&
          bytes[segStart + 10] === 0x45 &&
          bytes[segStart + 11] === 0x00;

        if (isIcc) {
          count++; // APP2/ICC_PROFILE
        }
      } else if ((marker >= 0xe3 && marker <= 0xef) || marker === 0xfe) {
        // APP3..APP15 or COM
        count++;
      }

      offset = segEnd;
    }
    return count;
  }

  // 2. PNG
  if (
    (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
    mimeType === 'image/png'
  ) {
    let offset = 8;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    while (offset + 8 <= len) {
      const chunkLen = view.getUint32(offset, false);
      const chunkType = view.getUint32(offset + 4, false);
      const totalLen = 12 + chunkLen;
      if (offset + totalLen > len) break;

      switch (chunkType) {
        case 0x65584966: // eXIf
        case 0x69434350: // iCCP
        case 0x74455874: // tEXt
        case 0x7a545874: // zTXt
        case 0x69545874: // iTXt
          count++;
          break;
      }

      offset += totalLen;
    }
    return count;
  }

  // 3. WebP
  if (
    (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) ||
    mimeType === 'image/webp'
  ) {
    let offset = 12;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    while (offset + 8 <= len) {
      const chunkType = view.getUint32(offset, false);
      const chunkLen = view.getUint32(offset + 4, true);
      const paddedLen = chunkLen + (chunkLen % 2);
      const totalLen = 8 + paddedLen;
      if (offset + totalLen > len) break;

      if (
        chunkType === 0x45584946 /* EXIF */ ||
        chunkType === 0x584d5020 /* XMP  */ ||
        chunkType === 0x49434350 /* ICCP */
      ) {
        count++;
      }
      offset += totalLen;
    }
    return count;
  }

  return 0;
}
