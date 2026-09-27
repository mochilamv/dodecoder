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

const FOURCC_VP8_ = 0x56503820;
const FOURCC_VP8L = 0x5650384c;
const FOURCC_VP8X = 0x56503858;
const FOURCC_ANIM = 0x414e494d;
const FOURCC_ANMF = 0x414e4d46;
const FOURCC_WEBP_EXIF = 0x45584946;
const FOURCC_WEBP_XMP  = 0x584d5020;
const FOURCC_WEBP_ICCP = 0x49434350;

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
