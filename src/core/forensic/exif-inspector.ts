import { ForensicReport, MetadataTag } from '../types';
import { inspectBinaryMarkers } from './marker-parser';
import { computeSha256 } from './hash-naming';

/**
 * Client-Side EXIF, GPS, IFD1 Thumbnail and Forensic Tag Inspector
 */
export async function analyzeForensics(file: File | Blob, customName?: string): Promise<ForensicReport> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const tags: MetadataTag[] = [];
  const markers = inspectBinaryMarkers(buffer);

  let hasExif = false;
  let hasGps = false;
  let hasThumbnail = false;
  let hasMakerNotes = false;

  // Locate TIFF Header in JPEG, WebP, or raw TIFF
  const tiffOffset = findTiffHeader(bytes);
  if (tiffOffset !== -1) {
    hasExif = true;
    const view = new DataView(buffer, tiffOffset);
    const littleEndian = view.getUint16(0) === 0x4949; // 'II'

    try {
      const ifd0Offset = view.getUint32(4, littleEndian);
      if (ifd0Offset < bytes.length) {
        const ifd0Result = parseIFD(view, ifd0Offset, littleEndian, 'IFD0');
        tags.push(...ifd0Result.tags);

        // Check for GPS pointer (0x8825)
        if (ifd0Result.gpsPointer) {
          hasGps = true;
          const gpsResult = parseIFD(view, ifd0Result.gpsPointer, littleEndian, 'GPS');
          tags.push(...gpsResult.tags);
        }

        // Check for Exif SubIFD (0x8769)
        if (ifd0Result.exifPointer) {
          const exifResult = parseIFD(view, ifd0Result.exifPointer, littleEndian, 'EXIF');
          tags.push(...exifResult.tags);
          if (exifResult.hasMakerNotes) hasMakerNotes = true;
        }

        // Check IFD1 (Thumbnail)
        if (ifd0Result.nextIfdOffset && ifd0Result.nextIfdOffset !== 0) {
          hasThumbnail = true;
          const ifd1Result = parseIFD(view, ifd0Result.nextIfdOffset, littleEndian, 'IFD1');
          tags.push({
            category: 'IFD1_Thumbnail',
            name: 'IFD1 Embedded Thumbnail',
            value: `Embedded image preview found at offset ${ifd0Result.nextIfdOffset}`,
            severity: 'critical',
            description: 'Embedded unedited thumbnail: major forensic leak vector.',
          });
          tags.push(...ifd1Result.tags);
        }
      }
    } catch {
      // Corrupt or truncated EXIF header
      tags.push({
        category: 'EXIF',
        name: 'Malformed EXIF Header',
        value: 'Header parsing failed',
        severity: 'medium',
      });
    }
  }

  // Check for XMP metadata packet
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

  const sha256 = await computeSha256(buffer);
  const prnuSusceptibility = (hasExif || hasMakerNotes) ? 'high' : (markers.length > 5 ? 'moderate' : 'low');

  return {
    fileName: customName || (file instanceof File ? file.name : 'unnamed_media'),
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    hasExif,
    hasGps,
    hasThumbnail,
    hasMakerNotes,
    tags,
    markers,
    prnuSusceptibility,
    sha256,
  };
}

/**
 * Searches for TIFF header ('II*\0' or 'MM\0*') in buffer
 */
function findTiffHeader(bytes: Uint8Array): number {
  // Check direct TIFF
  if (bytes.length >= 8) {
    if (
      (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
    ) {
      return 0;
    }
  }

  // Check JPEG APP1 (0xFF 0xE1)
  for (let i = 0; i < Math.min(bytes.length - 10, 65536); i++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) {
      // Check for 'Exif\0\0'
      if (
        bytes[i + 4] === 0x45 &&
        bytes[i + 5] === 0x78 &&
        bytes[i + 6] === 0x69 &&
        bytes[i + 7] === 0x66 &&
        bytes[i + 8] === 0x00 &&
        bytes[i + 9] === 0x00
      ) {
        return i + 10;
      }
    }
  }

  // Check WebP EXIF chunk
  for (let i = 12; i < Math.min(bytes.length - 8, 65536); i++) {
    if (bytes[i] === 0x45 && bytes[i + 1] === 0x58 && bytes[i + 2] === 0x49 && bytes[i + 3] === 0x46) {
      // TIFF header is right after the 8-byte chunk header
      return i + 8;
    }
  }

  return -1;
}

interface ParsedIFD {
  tags: MetadataTag[];
  exifPointer?: number;
  gpsPointer?: number;
  nextIfdOffset?: number;
  hasMakerNotes?: boolean;
}

/**
 * Parses a standard TIFF IFD (Image File Directory)
 */
function parseIFD(
  view: DataView,
  offset: number,
  littleEndian: boolean,
  context: 'IFD0' | 'IFD1' | 'EXIF' | 'GPS'
): ParsedIFD {
  const result: ParsedIFD = { tags: [] };
  if (offset + 2 >= view.byteLength) return result;

  const entriesCount = view.getUint16(offset, littleEndian);
  let currentOffset = offset + 2;

  for (let i = 0; i < entriesCount; i++) {
    if (currentOffset + 12 > view.byteLength) break;

    const tagId = view.getUint16(currentOffset, littleEndian);
    const tagType = view.getUint16(currentOffset + 2, littleEndian);
    const count = view.getUint32(currentOffset + 4, littleEndian);
    const valueOffset = currentOffset + 8;

    let tagValue = '';

    // Handle pointers
    if (tagId === 0x8769 && context === 'IFD0') {
      result.exifPointer = view.getUint32(valueOffset, littleEndian);
    } else if (tagId === 0x8825 && context === 'IFD0') {
      result.gpsPointer = view.getUint32(valueOffset, littleEndian);
    } else if (tagId === 0x927c) {
      result.hasMakerNotes = true;
      result.tags.push({
        category: 'MakerNotes',
        name: 'Proprietary MakerNotes',
        value: `${count} bytes of camera-specific binary telemetry`,
        severity: 'critical',
        description: 'Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates.',
      });
    } else {
      // Read standard human-readable tags
      const known = resolveTagName(tagId, context);
      if (known) {
        if (tagType === 2) {
          // ASCII String
          tagValue = readAscii(view, valueOffset, count, littleEndian);
        } else if (tagType === 3) {
          // SHORT
          tagValue = view.getUint16(valueOffset, littleEndian).toString();
        } else if (tagType === 4) {
          // LONG
          tagValue = view.getUint32(valueOffset, littleEndian).toString();
        } else {
          tagValue = `[${count} items]`;
        }

        if (tagValue.trim()) {
          result.tags.push({
            category: context === 'GPS' ? 'GPS' : (context === 'IFD1' ? 'IFD1_Thumbnail' : 'EXIF'),
            name: known.name,
            value: tagValue.trim(),
            severity: known.severity,
            description: known.description,
          });
        }
      }
    }

    currentOffset += 12;
  }

  // Next IFD offset (pointer to IFD1 from IFD0)
  if (currentOffset + 4 <= view.byteLength) {
    result.nextIfdOffset = view.getUint32(currentOffset, littleEndian);
  }

  return result;
}

function resolveTagName(tagId: number, context: string): { name: string; severity: 'low' | 'medium' | 'critical'; description?: string } | null {
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
    case 0x010f: return { name: 'Camera Manufacturer (Make)', severity: 'high' as any, description: 'Brand of camera or smartphone' };
    case 0x0110: return { name: 'Camera Model', severity: 'critical', description: 'Exact phone or camera hardware model' };
    case 0x0131: return { name: 'Software / OS Version', severity: 'high' as any, description: 'Firmware or operating system build' };
    case 0x0132: return { name: 'Modify Date / Time', severity: 'high' as any, description: 'Modification timestamp' };
    case 0x9003: return { name: 'Date / Time Original', severity: 'critical', description: 'Exact moment the shutter was pressed' };
    case 0x9004: return { name: 'Date / Time Digitized', severity: 'critical', description: 'Sensor analog-to-digital timestamp' };
    case 0xa431: return { name: 'Camera Body Serial Number', severity: 'critical', description: 'Hardware unique serial number' };
    case 0xa434: return { name: 'Lens Model', severity: 'high' as any, description: 'Optical lens specifications' };
    case 0xa420: return { name: 'Image Unique ID', severity: 'critical', description: 'Unique cryptographic ID generated by ISP' };
    case 0x0201: return { name: 'Thumbnail Offset', severity: 'critical', description: 'Pointer to raw thumbnail stream' };
    case 0x0202: return { name: 'Thumbnail Length', severity: 'critical', description: 'Byte length of embedded thumbnail' };
    default: return null;
  }
}

function readAscii(view: DataView, offset: number, count: number, littleEndian: boolean): string {
  let actualOffset = offset;
  if (count > 4) {
    actualOffset = view.getUint32(offset, littleEndian);
  }
  if (actualOffset + count > view.byteLength) return '';

  let str = '';
  for (let i = 0; i < count; i++) {
    const charCode = view.getUint8(actualOffset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str;
}

/**
 * Scans for XMP metadata packets (<x:xmpmeta ...)
 */
function scanForXmp(bytes: Uint8Array): MetadataTag[] {
  const tags: MetadataTag[] = [];
  const limit = Math.min(bytes.length - 20, 200000);
  const target = '<?xpacket begin';

  for (let i = 0; i < limit; i++) {
    if (bytes[i] === 0x3c && bytes[i + 1] === 0x3f) {
      const slice = String.fromCharCode(...bytes.slice(i, i + 15));
      if (slice === target) {
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
  }

  return tags;
}
