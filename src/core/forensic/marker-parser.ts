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
  if (bytes.length >= 12 && view.getUint32(4, false) === 0x66747970) {
    return inspectMp4Boxes(bytes, view);
  }

  return markers;
}

function isJpegStandaloneMarker(markerByte: number): boolean {
  return (
    markerByte === 0x01 || // TEM
    (markerByte >= 0xd0 && markerByte <= 0xd7) || // RST0..RST7
    markerByte === 0xd8 || // SOI
    markerByte === 0xd9    // EOI
  );
}

/**
 * Inspects raw JPEG markers.
 * Handles repeated 0xFF fill bytes, standalone lengthless markers (SOI/EOI/TEM/RST0..7),
 * and 0xFF00 byte-stuffing plus RST markers inside entropy-coded SOS scan data.
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

    // Consume any repeated 0xFF fill bytes; record start of final 0xFF before marker byte
    let markerPos = offset;
    while (markerPos + 1 < len && bytes[markerPos + 1] === 0xff) {
      markerPos++;
    }
    if (markerPos + 1 >= len) break;

    const markerByte = bytes[markerPos + 1];
    if (markerByte === 0x00) {
      offset = markerPos + 2;
      continue;
    }

    const markerHex = '0xFF' + markerByte.toString(16).toUpperCase().padStart(2, '0');

    if (markerByte === 0xd9) {
      markers.push({
        offset: markerPos,
        marker: markerHex,
        name: 'EOI (End of Image)',
        isSanitizedSafe: true,
        description: 'End of image data stream',
      });
      break;
    }

    if (isJpegStandaloneMarker(markerByte)) {
      const name =
        markerByte === 0x01
          ? 'TEM (Temporary Arithmetic Coding)'
          : markerByte === 0xd8
            ? 'SOI (Start of Image)'
            : `RST${markerByte - 0xd0} (Restart Marker)`;
      markers.push({
        offset: markerPos,
        marker: markerHex,
        name,
        isSanitizedSafe: true,
        description: 'Standalone lengthless JPEG marker',
      });
      offset = markerPos + 2;
      continue;
    }

    if (markerByte === 0xda) {
      // SOS has a 2-byte length header followed by entropy-coded scan data
      if (markerPos + 3 >= len) {
        markers.push({
          offset: markerPos,
          marker: markerHex,
          name: 'SOS (Start of Scan)',
          isSanitizedSafe: true,
          description: 'Compressed image pixel bitstream follows',
        });
        break;
      }
      const sosHeaderLen = (bytes[markerPos + 2] << 8) | bytes[markerPos + 3];
      markers.push({
        offset: markerPos,
        marker: markerHex,
        name: 'SOS (Start of Scan)',
        length: sosHeaderLen,
        isSanitizedSafe: true,
        description: 'Compressed image pixel bitstream follows',
      });
      if (sosHeaderLen < 2 || markerPos + 2 + sosHeaderLen > len) break;

      let scanPos = markerPos + 2 + sosHeaderLen;
      let nextMarkerPos = len;
      while (scanPos < len - 1) {
        if (bytes[scanPos] !== 0xff) {
          scanPos++;
          continue;
        }
        let ffEnd = scanPos;
        while (ffEnd + 1 < len && bytes[ffEnd + 1] === 0xff) {
          ffEnd++;
        }
        if (ffEnd + 1 >= len) break;
        const nextByte = bytes[ffEnd + 1];
        // Ignore 0xFF00 byte-stuffing and RST0..RST7 inside entropy-coded scan
        if (nextByte === 0x00 || (nextByte >= 0xd0 && nextByte <= 0xd7)) {
          scanPos = ffEnd + 2;
          continue;
        }
        nextMarkerPos = ffEnd;
        break;
      }
      offset = nextMarkerPos;
      continue;
    }

    if (markerPos + 3 >= len) break;
    const markerLength = (bytes[markerPos + 2] << 8) | bytes[markerPos + 3];
    if (markerLength < 2 || markerPos + 2 + markerLength > len) break;

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
          markerPos + 7 < len &&
          bytes[markerPos + 4] === 0x45 &&
          bytes[markerPos + 5] === 0x78 &&
          bytes[markerPos + 6] === 0x69 &&
          bytes[markerPos + 7] === 0x66
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
      offset: markerPos,
      marker: markerHex,
      name,
      length: markerLength,
      isSanitizedSafe: isSafe,
      description,
    });

    offset = markerPos + 2 + markerLength;
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
        description = 'Alpha transparency channel for reconstructed pixels';
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

const FOURCC_MOOV = 0x6d6f6f76;
const FOURCC_MOOF = 0x6d6f6f66;
const FOURCC_TRAK = 0x7472616b;
const FOURCC_TRAF = 0x74726166;
const FOURCC_MDIA = 0x6d646961;
const MP4_MAX_INSPECT_DEPTH = 8;

/**
 * Inspects MP4/MOV boxes with bounded recursion into moov/trak/mdia containers.
 * Safely handles boxSize === 0 (to container EOF), boxSize === 1 (64-bit largesize >= 16),
 * and invalid 2 <= boxSize < 8 without throwing or infinite-looping.
 */
function inspectMp4Boxes(_bytes: Uint8Array, view: DataView): MarkerInfo[] {
  const markers: MarkerInfo[] = [];
  inspectMp4BoxRange(view, 0, view.byteLength, 0, markers);
  return markers;
}

function inspectMp4BoxRange(
  view: DataView,
  start: number,
  end: number,
  depth: number,
  markers: MarkerInfo[]
): void {
  if (depth > MP4_MAX_INSPECT_DEPTH) return;
  let offset = start;

  while (offset + 8 <= end) {
    const rawSize = view.getUint32(offset, false);
    const boxTypeInt = view.getUint32(offset + 4, false);
    let headerSize = 8;
    let actualSize: number;

    if (rawSize === 0) {
      // Box extends strictly to enclosing container EOF
      actualSize = end - offset;
    } else if (rawSize === 1) {
      // 64-bit largesize box: must have 16-byte header and valid safe size >= 16
      if (offset + 16 > end) break;
      const largeSize = view.getBigUint64(offset + 8, false);
      if (largeSize < 16n || largeSize > BigInt(Number.MAX_SAFE_INTEGER)) break;
      actualSize = Number(largeSize);
      headerSize = 16;
    } else if (rawSize < 8) {
      // Invalid 2 <= boxSize < 8: terminate range cleanly
      break;
    } else {
      actualSize = rawSize;
    }

    if (actualSize < headerSize || offset + actualSize > end) break;

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
      case FOURCC_MOOV:
        boxName = 'moov';
        break;
      case FOURCC_MOOF:
        boxName = 'moof';
        break;
      case 0x6d646174:
        boxName = 'mdat';
        break;
      case FOURCC_TRAK:
        boxName = 'trak';
        break;
      case FOURCC_TRAF:
        boxName = 'traf';
        break;
      case FOURCC_MDIA:
        boxName = 'mdia';
        break;
      default:
        boxName = 'atom';
    }

    markers.push({
      offset,
      marker: boxName,
      name: `Box: ${boxName}`,
      length: actualSize,
      isSanitizedSafe: !isDangerous,
      description,
    });

    if (
      (
        boxTypeInt === FOURCC_MOOV ||
        boxTypeInt === FOURCC_MOOF ||
        boxTypeInt === FOURCC_TRAK ||
        boxTypeInt === FOURCC_TRAF ||
        boxTypeInt === FOURCC_MDIA
      ) &&
      offset + headerSize < offset + actualSize
    ) {
      inspectMp4BoxRange(view, offset + headerSize, offset + actualSize, depth + 1, markers);
    }

    if (rawSize === 0) break;
    offset += actualSize;
  }
}


