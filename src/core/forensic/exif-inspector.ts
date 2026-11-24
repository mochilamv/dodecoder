import { ForensicReport, MarkerInfo, MAX_MEDIA_FILE_BYTES, MetadataTag } from '../types';
import { inspectBinaryMarkers } from './marker-parser';
import { computeSha256 } from './hash-naming';

export const EXIF_MAX_IFD_DEPTH = 8;
export const EXIF_MAX_TOTAL_IFDS = 16;
export const EXIF_MAX_IFD_ENTRIES = 512;
export const EXIF_MAX_ASCII_BYTES = 1024;
export const EXIF_MAX_SCAN_BYTES = 65536;
export const XMP_MAX_SCAN_BYTES = 200000;

export type ExifParseFailureCode =
  | 'EMPTY_INPUT'
  | 'TRUNCATED_HEADER'
  | 'INVALID_BYTE_ORDER'
  | 'INVALID_TIFF_MAGIC'
  | 'IFD_OFFSET_OUT_OF_BOUNDS'
  | 'CIRCULAR_IFD_REFERENCE'
  | 'MAX_IFD_DEPTH_EXCEEDED'
  | 'MAX_IFD_ENTRIES_EXCEEDED'
  | 'ENTRY_OUT_OF_BOUNDS'
  | 'VALUE_OVERFLOW_OR_OOB'
  | 'FILE_TOO_LARGE'
  | 'READ_ERROR';

export interface ExifParseFailure {
  readonly ok: false;
  readonly code: ExifParseFailureCode;
  readonly message: string;
}

export interface ExifParseSuccess {
  readonly ok: true;
  readonly hasExif: boolean;
  readonly hasGps: boolean;
  readonly hasThumbnail: boolean;
  readonly hasMakerNotes: boolean;
  readonly tags: MetadataTag[];
}

export type ExifParseResult = ExifParseSuccess | ExifParseFailure;

export interface ForensicInspectionReport extends ForensicReport {
  readonly exifParseResult: ExifParseResult;
}

// TIFF 6.0 / EXIF 2.3 field type byte widths (index = tagType)
const TIFF_TYPE_SIZES: Readonly<Record<number, number>> = {
  1: 1,  // BYTE
  2: 1,  // ASCII
  3: 2,  // SHORT
  4: 4,  // LONG
  5: 8,  // RATIONAL
  6: 1,  // SBYTE
  7: 1,  // UNDEFINED
  8: 2,  // SSHORT
  9: 4,  // SLONG
  10: 8, // SRATIONAL
  11: 4, // FLOAT
  12: 8, // DOUBLE
  13: 4, // IFD pointer
};

// Static byte sequence for '<?xpacket begin' to avoid per-hit slice() allocations
const XMP_BEGIN_BYTES = new Uint8Array([
  0x3c, 0x3f, 0x78, 0x70, 0x61, 0x63, 0x6b, 0x65,
  0x74, 0x20, 0x62, 0x65, 0x67, 0x69, 0x6e,
]);

interface TiffRegion {
  readonly offset: number;
  readonly length: number;
  readonly truncated?: boolean;
}

interface IfdWalkState {
  readonly visitedOffsets: Set<number>;
  ifdsVisited: number;
  hasGps: boolean;
  hasThumbnail: boolean;
  hasMakerNotes: boolean;
  readonly tags: MetadataTag[];
  failure: ExifParseFailure | null;
}

function makeFailure(code: ExifParseFailureCode, message: string): ExifParseFailure {
  return { ok: false, code, message };
}

/**
 * Pure, zero-copy EXIF/TIFF parser operating strictly on typed-array views.
 * Never throws across its API boundary and never allocates buffers sized from
 * untrusted counts or offsets.
 */
export function inspectExifBytes(input: Uint8Array | ArrayBuffer): ExifParseResult {
  try {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.byteLength === 0) {
      return makeFailure('EMPTY_INPUT', 'Input buffer is empty');
    }

    const region = findTiffRegion(bytes);
    if (!region) {
      return {
        ok: true,
        hasExif: false,
        hasGps: false,
        hasThumbnail: false,
        hasMakerNotes: false,
        tags: [],
      };
    }

    if (region.truncated || region.offset < 0 || region.length < 8 || region.offset > bytes.byteLength - region.length) {
      return makeFailure('TRUNCATED_HEADER', 'EXIF/TIFF header is truncated');
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset + region.offset, region.length);
    return parseTiffView(view);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected EXIF inspection error';
    return makeFailure('READ_ERROR', message);
  }
}

/**
 * Client-Side EXIF, GPS, IFD1 Thumbnail and Forensic Tag Inspector.
 * Guaranteed never to throw across its API boundary; always returns a
 * ForensicInspectionReport compatible with ForensicReport callers.
 */
export async function analyzeForensics(
  file: File | Blob,
  customName?: string
): Promise<ForensicInspectionReport> {
  const fileName = customName || (typeof File !== 'undefined' && file instanceof File ? file.name : 'unnamed_media');
  const fileSize = typeof file?.size === 'number' && Number.isFinite(file.size) ? file.size : 0;
  const mimeType = (typeof file?.type === 'string' && file.type) ? file.type : 'application/octet-stream';

  const normalizedMime = mimeType.toLowerCase();
  const isMp4OrMovInput =
    normalizedMime === 'video/mp4' ||
    normalizedMime === 'video/quicktime' ||
    /\.(mp4|mov)$/i.test(fileName);

  if (isMp4OrMovInput && fileSize > MAX_MEDIA_FILE_BYTES) {
    const message = `MP4/MOV file size (${fileSize} bytes) exceeds in-memory inspection limit of ${MAX_MEDIA_FILE_BYTES} bytes (256 MiB)`;
    const failure = makeFailure('FILE_TOO_LARGE', message);
    return {
      fileName,
      fileSize,
      mimeType,
      hasExif: false,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [{
        category: 'Container',
        name: 'Media File Size Limit Exceeded',
        value: message,
        severity: 'medium',
      }],
      markers: [],
      prnuSusceptibility: 'low',
      sha256: '',
      exifParseResult: failure,
    };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to read input blob';
    const failure = makeFailure('READ_ERROR', message);
    return {
      fileName,
      fileSize,
      mimeType,
      hasExif: false,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [{
        category: 'EXIF',
        name: 'Unreadable Media Input',
        value: message,
        severity: 'medium',
      }],
      markers: [],
      prnuSusceptibility: 'low',
      sha256: '',
      exifParseResult: failure,
    };
  }

  // Zero-copy view over the single ArrayBuffer read
  const bytes = new Uint8Array(buffer);
  const tags: MetadataTag[] = [];

  let markers: MarkerInfo[] = [];
  try {
    markers = inspectBinaryMarkers(buffer);
  } catch {
    markers = [];
  }

  const exifParseResult = inspectExifBytes(bytes);

  let hasExif = false;
  let hasGps = false;
  let hasThumbnail = false;
  let hasMakerNotes = false;

  if (exifParseResult.ok) {
    hasExif = exifParseResult.hasExif;
    hasGps = exifParseResult.hasGps;
    hasThumbnail = exifParseResult.hasThumbnail;
    hasMakerNotes = exifParseResult.hasMakerNotes;
    tags.push(...exifParseResult.tags);
  } else if (exifParseResult.code !== 'EMPTY_INPUT') {
    hasExif = true;
    tags.push({
      category: 'EXIF',
      name: 'Malformed EXIF Header',
      value: `${exifParseResult.code}: ${exifParseResult.message}`,
      severity: 'medium',
    });
  }

  // Zero-copy scan for XMP metadata packet
  const xmpInfo = scanForXmp(bytes);
  if (xmpInfo.length > 0) {
    tags.push(...xmpInfo);
  }

  // Check for ICC Color Profile
  const hasIcc = markers.some(m => m.name.includes('ICC') || m.marker === 'ICCP');
  if (hasIcc) {
    tags.push({
      category: 'ICC',
      name: 'ICC Color Profile',
      value: 'Color management profile present (hardware/software calibration)',
      severity: 'medium',
      description: 'Can identify operating system or monitor calibration profile.',
    });
  }

  let sha256 = '';
  try {
    sha256 = await computeSha256(bytes);
  } catch {
    sha256 = '';
  }

  const prnuSusceptibility = (hasExif || hasMakerNotes) ? 'high' : (markers.length > 5 ? 'moderate' : 'low');

  return {
    fileName,
    fileSize: bytes.byteLength,
    mimeType,
    hasExif,
    hasGps,
    hasThumbnail,
    hasMakerNotes,
    tags,
    markers,
    prnuSusceptibility,
    sha256,
    exifParseResult,
  };
}

function parseTiffView(view: DataView): ExifParseResult {
  if (view.byteLength < 8) {
    return makeFailure('TRUNCATED_HEADER', `TIFF header requires 8 bytes, got ${view.byteLength}`);
  }

  const bom = view.getUint16(0, false);
  let littleEndian: boolean;
  if (bom === 0x4949) {
    littleEndian = true;
  } else if (bom === 0x4d4d) {
    littleEndian = false;
  } else {
    return makeFailure(
      'INVALID_BYTE_ORDER',
      `Invalid TIFF byte-order mark: 0x${bom.toString(16).padStart(4, '0')}`
    );
  }

  const magic = view.getUint16(2, littleEndian);
  if (magic !== 0x002a) {
    return makeFailure(
      'INVALID_TIFF_MAGIC',
      `Invalid TIFF magic number: ${magic} (expected 42)`
    );
  }

  const ifd0Offset = view.getUint32(4, littleEndian);
  if (ifd0Offset < 8 || ifd0Offset > view.byteLength - 2) {
    return makeFailure(
      'IFD_OFFSET_OUT_OF_BOUNDS',
      `IFD0 offset ${ifd0Offset} is out of bounds for ${view.byteLength}-byte TIFF block`
    );
  }

  const state: IfdWalkState = {
    visitedOffsets: new Set<number>(),
    ifdsVisited: 0,
    hasGps: false,
    hasThumbnail: false,
    hasMakerNotes: false,
    tags: [],
    failure: null,
  };

  walkIfd(view, ifd0Offset, littleEndian, 'IFD0', 0, state);

  if (state.failure) {
    return state.failure;
  }

  return {
    ok: true,
    hasExif: true,
    hasGps: state.hasGps,
    hasThumbnail: state.hasThumbnail,
    hasMakerNotes: state.hasMakerNotes,
    tags: state.tags,
  };
}

/**
 * Locates a TIFF header inside raw TIFF, JPEG APP1 ('Exif\0\0'), or RIFF/WEBP ('EXIF' chunk).
 * Performs strictly container-aware, overflow-safe scanning without arbitrary substring matches.
 */
function findTiffRegion(bytes: Uint8Array): TiffRegion | null {
  const len = bytes.byteLength;

  // 1. Direct TIFF ('II' or 'MM', or corrupted BOM with TIFF magic 42 at bytes 2..3)
  if (len >= 2) {
    const isII = bytes[0] === 0x49 && bytes[1] === 0x49;
    const isMM = bytes[0] === 0x4d && bytes[1] === 0x4d;
    if (isII || isMM) {
      return { offset: 0, length: len };
    }
  }

  // 2. JPEG container (SOI 0xFF 0xD8): walk markers for APP1 (0xFF 0xE1) 'Exif\0\0'
  if (len >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let pos = 2;
    const scanEnd = Math.min(len, EXIF_MAX_SCAN_BYTES);
    while (pos <= scanEnd - 2) {
      if (bytes[pos] !== 0xff) {
        pos++;
        continue;
      }
      // Skip fill 0xFF bytes
      while (pos < scanEnd - 1 && bytes[pos + 1] === 0xff) {
        pos++;
      }
      if (pos > scanEnd - 2) break;

      const marker = bytes[pos + 1];
      if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        pos += 2;
        continue;
      }
      if (marker === 0xd9 || marker === 0xda) {
        break; // EOI or SOS
      }
      if (pos > len - 4) {
        if (marker === 0xe1) {
          return { offset: pos, length: len - pos, truncated: true };
        }
        break;
      }

      const segLen = (bytes[pos + 2] << 8) | bytes[pos + 3];
      if (segLen < 2) break;

      if (marker === 0xe1) {
        const hasExifPrefix =
          pos <= len - 10 &&
          bytes[pos + 4] === 0x45 &&
          bytes[pos + 5] === 0x78 &&
          bytes[pos + 6] === 0x69 &&
          bytes[pos + 7] === 0x66 &&
          bytes[pos + 8] === 0x00 &&
          bytes[pos + 9] === 0x00;

        if (hasExifPrefix) {
          const tiffStart = pos + 10;
          const segEnd = segLen <= len - (pos + 2) ? pos + 2 + segLen : len;
          const tiffLen = Math.max(0, segEnd - tiffStart);
          return { offset: tiffStart, length: tiffLen };
        }
      }

      if (segLen > len - (pos + 2)) break;
      pos += 2 + segLen;
    }
    return null;
  }

  // 3. WebP container (RIFF .... WEBP): walk RIFF chunks for 'EXIF'
  if (
    len >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, len);
    let pos = 12;
    const scanEnd = Math.min(len, EXIF_MAX_SCAN_BYTES);

    while (pos <= scanEnd - 8) {
      const fourCC = dv.getUint32(pos, false);
      const chunkLen = dv.getUint32(pos + 4, true);
      if (fourCC === 0x45584946) { // 'EXIF'
        const tiffStart = pos + 8;
        const available = len - tiffStart;
        const tiffLen = Math.min(chunkLen, available);
        return { offset: tiffStart, length: tiffLen };
      }
      const paddedLen = chunkLen + (chunkLen & 1);
      // Overflow-safe advance check
      if (paddedLen > len - pos - 8) break;
      pos += 8 + paddedLen;
    }
    return null;
  }

  // 4. Raw malformed TIFF with invalid byte-order mark but recognizable TIFF magic (42)
  if (
    len >= 8 &&
    ((bytes[2] === 0x2a && bytes[3] === 0x00) || (bytes[2] === 0x00 && bytes[3] === 0x2a))
  ) {
    return { offset: 0, length: len };
  }

  return null;
}

function walkIfd(
  view: DataView,
  offset: number,
  littleEndian: boolean,
  context: 'IFD0' | 'IFD1' | 'EXIF' | 'GPS',
  depth: number,
  state: IfdWalkState
): void {
  if (state.failure) return;

  if (depth > EXIF_MAX_IFD_DEPTH || state.ifdsVisited >= EXIF_MAX_TOTAL_IFDS) {
    state.failure = makeFailure(
      'MAX_IFD_DEPTH_EXCEEDED',
      `IFD traversal exceeded depth (${EXIF_MAX_IFD_DEPTH}) or total IFD (${EXIF_MAX_TOTAL_IFDS}) cap`
    );
    return;
  }

  if (state.visitedOffsets.has(offset)) {
    state.failure = makeFailure(
      'CIRCULAR_IFD_REFERENCE',
      `Circular IFD pointer detected at offset ${offset}`
    );
    return;
  }

  if (!Number.isSafeInteger(offset) || offset < 8 || offset > view.byteLength - 2) {
    state.failure = makeFailure(
      'IFD_OFFSET_OUT_OF_BOUNDS',
      `IFD offset ${offset} is outside [8, ${view.byteLength - 2}]`
    );
    return;
  }

  state.visitedOffsets.add(offset);
  state.ifdsVisited++;

  const entriesCount = view.getUint16(offset, littleEndian);
  if (entriesCount > EXIF_MAX_IFD_ENTRIES) {
    state.failure = makeFailure(
      'MAX_IFD_ENTRIES_EXCEEDED',
      `IFD entry count ${entriesCount} exceeds maximum ${EXIF_MAX_IFD_ENTRIES}`
    );
    return;
  }

  const tableStart = offset + 2;
  const tableBytes = entriesCount * 12;
  if (tableBytes > view.byteLength - tableStart) {
    state.failure = makeFailure(
      'ENTRY_OUT_OF_BOUNDS',
      `IFD at offset ${offset} declares ${entriesCount} entries (${tableBytes} bytes), exceeding remaining ${view.byteLength - tableStart} bytes`
    );
    return;
  }

  let exifPointer: number | undefined;
  let gpsPointer: number | undefined;

  for (let i = 0; i < entriesCount; i++) {
    const entryPos = tableStart + i * 12;
    const tagId = view.getUint16(entryPos, littleEndian);
    const tagType = view.getUint16(entryPos + 2, littleEndian);
    const count = view.getUint32(entryPos + 4, littleEndian);
    const valueOffset = entryPos + 8;

    // Overflow-safe validation of count * typeSize and out-of-line offset bounds
    const typeSize = TIFF_TYPE_SIZES[tagType] ?? 0;
    let totalValueBytes = 0;
    if (typeSize > 0) {
      if (count > Math.floor(view.byteLength / typeSize)) {
        state.failure = makeFailure(
          'VALUE_OVERFLOW_OR_OOB',
          `Tag 0x${tagId.toString(16)} count ${count} x typeSize ${typeSize} exceeds TIFF buffer length ${view.byteLength}`
        );
        return;
      }
      totalValueBytes = count * typeSize;
      if (totalValueBytes > 4) {
        const outOfLineOffset = view.getUint32(valueOffset, littleEndian);
        if (outOfLineOffset > view.byteLength - totalValueBytes) {
          state.failure = makeFailure(
            'VALUE_OVERFLOW_OR_OOB',
            `Tag 0x${tagId.toString(16)} out-of-line range [${outOfLineOffset}, +${totalValueBytes}) exceeds TIFF length ${view.byteLength}`
          );
          return;
        }
      }
    } else if (count > view.byteLength) {
      state.failure = makeFailure(
        'VALUE_OVERFLOW_OR_OOB',
        `Tag 0x${tagId.toString(16)} unknown type ${tagType} count ${count} exceeds TIFF length ${view.byteLength}`
      );
      return;
    }

    if (tagId === 0x8769 && context === 'IFD0') {
      exifPointer = view.getUint32(valueOffset, littleEndian);
    } else if (tagId === 0x8825 && context === 'IFD0') {
      gpsPointer = view.getUint32(valueOffset, littleEndian);
    } else if (tagId === 0x927c) {
      state.hasMakerNotes = true;
      state.tags.push({
        category: 'MakerNotes',
        name: 'Proprietary MakerNotes',
        value: `${count} bytes of camera-specific binary telemetry`,
        severity: 'critical',
        description: 'Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates.',
      });
    } else {
      const known = resolveTagName(tagId, context);
      if (known) {
        let tagValue = '';
        if (tagType === 2) {
          tagValue = readAsciiSafe(view, valueOffset, count, littleEndian);
        } else if (tagType === 3) {
          tagValue = view.getUint16(valueOffset, littleEndian).toString();
        } else if (tagType === 4) {
          tagValue = view.getUint32(valueOffset, littleEndian).toString();
        } else {
          tagValue = `[${count} items]`;
        }

        if (tagValue.trim()) {
          state.tags.push({
            category: context === 'GPS' ? 'GPS' : (context === 'IFD1' ? 'IFD1_Thumbnail' : 'EXIF'),
            name: known.name,
            value: tagValue.trim(),
            severity: known.severity,
            description: known.description,
          });
        }
      }
    }
  }

  // Sub-IFDs referenced by IFD0
  if (gpsPointer !== undefined && gpsPointer !== 0) {
    state.hasGps = true;
    walkIfd(view, gpsPointer, littleEndian, 'GPS', depth + 1, state);
    if (state.failure) return;
  }

  if (exifPointer !== undefined && exifPointer !== 0) {
    walkIfd(view, exifPointer, littleEndian, 'EXIF', depth + 1, state);
    if (state.failure) return;
  }

  // Next IFD chain pointer (IFD0 -> IFD1 -> ...)
  const nextPtrPos = tableStart + tableBytes;
  if (nextPtrPos <= view.byteLength - 4) {
    const nextIfdOffset = view.getUint32(nextPtrPos, littleEndian);
    if (nextIfdOffset !== 0) {
      if (context === 'IFD0') {
        state.hasThumbnail = true;
        state.tags.push({
          category: 'IFD1_Thumbnail',
          name: 'IFD1 Embedded Thumbnail',
          value: `Embedded image preview found at offset ${nextIfdOffset}`,
          severity: 'critical',
          description: 'Embedded unedited thumbnail: major forensic leak vector.',
        });
      }
      walkIfd(view, nextIfdOffset, littleEndian, 'IFD1', depth + 1, state);
    }
  }
}

function resolveTagName(
  tagId: number,
  context: string
): { name: string; severity: 'low' | 'medium' | 'critical'; description?: string } | null {
  if (context === 'GPS') {
    switch (tagId) {
      case 0x0001: return { name: 'GPS Latitude Ref', severity: 'critical', description: 'North/South coordinate hemisphere' };
      case 0x0002: return { name: 'GPS Latitude', severity: 'critical', description: 'Precise GPS latitude coordinates' };
      case 0x0003: return { name: 'GPS Longitude Ref', severity: 'critical', description: 'East/West coordinate hemisphere' };
      case 0x0004: return { name: 'GPS Longitude', severity: 'critical', description: 'Precise GPS longitude coordinates' };
      case 0x0006: return { name: 'GPS Altitude', severity: 'critical', description: 'Elevation above sea level' };
      case 0x0007: return { name: 'GPS TimeStamp', severity: 'critical', description: 'Atomic satellite UTC timestamp' };
      case 0x001d: return { name: 'GPS DateStamp', severity: 'critical', description: 'Satellite GPS date' };
    }
  }

  switch (tagId) {
    case 0x010f: return { name: 'Camera Manufacturer (Make)', severity: 'medium', description: 'Brand of camera or smartphone' };
    case 0x0110: return { name: 'Camera Model', severity: 'critical', description: 'Exact phone or camera hardware model' };
    case 0x0131: return { name: 'Software / OS Version', severity: 'medium', description: 'Firmware or operating system build' };
    case 0x0132: return { name: 'Modify Date / Time', severity: 'medium', description: 'Modification timestamp' };
    case 0x9003: return { name: 'Date / Time Original', severity: 'critical', description: 'Exact moment the shutter was pressed' };
    case 0x9004: return { name: 'Date / Time Digitized', severity: 'critical', description: 'Sensor analog-to-digital timestamp' };
    case 0xa431: return { name: 'Camera Body Serial Number', severity: 'critical', description: 'Hardware unique serial number' };
    case 0xa434: return { name: 'Lens Model', severity: 'medium', description: 'Optical lens specifications' };
    case 0xa420: return { name: 'Image Unique ID', severity: 'critical', description: 'Unique cryptographic ID generated by ISP' };
    case 0x0201: return { name: 'Thumbnail Offset', severity: 'critical', description: 'Pointer to raw thumbnail stream' };
    case 0x0202: return { name: 'Thumbnail Length', severity: 'critical', description: 'Byte length of embedded thumbnail' };
    default: return null;
  }
}

function readAsciiSafe(
  view: DataView,
  valueOffset: number,
  count: number,
  littleEndian: boolean
): string {
  if (count === 0) return '';

  let actualOffset = valueOffset;
  if (count > 4) {
    actualOffset = view.getUint32(valueOffset, littleEndian);
  }

  if (actualOffset >= view.byteLength) return '';
  const maxLen = Math.min(count, EXIF_MAX_ASCII_BYTES, view.byteLength - actualOffset);

  let str = '';
  for (let i = 0; i < maxLen; i++) {
    const charCode = view.getUint8(actualOffset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str;
}

/**
 * Zero-copy scan for XMP metadata packets ('<?xpacket begin')
 */
function scanForXmp(bytes: Uint8Array): MetadataTag[] {
  const tags: MetadataTag[] = [];
  const patLen = XMP_BEGIN_BYTES.length;
  if (bytes.byteLength < patLen) return tags;

  const limit = Math.min(bytes.byteLength - patLen, XMP_MAX_SCAN_BYTES);
  for (let i = 0; i <= limit; i++) {
    if (bytes[i] !== 0x3c || bytes[i + 1] !== 0x3f) continue;

    let match = true;
    for (let j = 2; j < patLen; j++) {
      if (bytes[i + j] !== XMP_BEGIN_BYTES[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      tags.push({
        category: 'XMP',
        name: 'Adobe XMP Metadata Packet',
        value: 'XMP Packet detected',
        severity: 'critical',
        description: 'Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs.',
      });
      break;
    }
  }

  return tags;
}
