import { SanitizedResult } from '../types';
import { generateEphemeralSaltedName } from '../forensic/hash-naming';
import { wipeBuffer } from './memory';

// Real fixed header sizes emitted by this non-ZIP64 STORED serializer
// (zero extra fields, zero file comments, zero data descriptors).
export const ZIP_LOCAL_HEADER_SIZE = 30;
export const ZIP_CENTRAL_HEADER_SIZE = 46;
export const ZIP_EOCD_SIZE = 22;

// Non-ZIP64 format ceilings: strictly below ZIP64 sentinel values 0xFFFF and 0xFFFFFFFF.
// Note: Practical browser single-ArrayBuffer/Blob memory ceilings (typically ~1-2 GiB on
// 64-bit desktop and lower on 32-bit/mobile) are lower than the 4 GiB - 2 B ZIP32 limit.
export const ZIP_UINT16_SENTINEL = 0xffff;
export const ZIP_UINT32_SENTINEL = 0xffffffff;
export const ZIP_MAX_ENTRY_COUNT = ZIP_UINT16_SENTINEL - 1; // 65,534 (0xFFFE)
export const ZIP_MAX_ENTRY_SIZE = ZIP_UINT32_SENTINEL - 1;  // 4,294,967,294 (0xFFFFFFFE)
export const ZIP_MAX_CD_OFFSET = ZIP_UINT32_SENTINEL - 1;   // 4,294,967,294 (0xFFFFFFFE)
export const ZIP_MAX_CD_SIZE = ZIP_UINT32_SENTINEL - 1;     // 4,294,967,294 (0xFFFFFFFE)
export const ZIP_MAX_ARCHIVE_SIZE = ZIP_UINT32_SENTINEL - 1; // 4,294,967,294 (0xFFFFFFFE)
export const ZIP_MAX_FILENAME_LENGTH = 0xffff;

export type ZipLimitErrorCode =
  | 'ENTRY_COUNT_EXCEEDED'
  | 'INVALID_ENTRY_LAYOUT'
  | 'FILENAME_TOO_LONG'
  | 'ENTRY_SIZE_EXCEEDED'
  | 'ENTRY_OFFSET_EXCEEDED'
  | 'CENTRAL_DIR_OFFSET_EXCEEDED'
  | 'CENTRAL_DIR_SIZE_EXCEEDED'
  | 'ARCHIVE_SIZE_EXCEEDED';

export class ZipSizeLimitError extends RangeError {
  public readonly code: ZipLimitErrorCode;
  public readonly actual: number;
  public readonly limit: number;

  constructor(code: ZipLimitErrorCode, message: string, actual: number, limit: number) {
    super(message);
    this.name = 'ZipSizeLimitError';
    this.code = code;
    this.actual = actual;
    this.limit = limit;
  }
}

export interface ZipEntryLayout {
  readonly nameByteLength: number;
  readonly byteLength: number;
}

export interface ZipLayoutSummary {
  readonly entryCount: number;
  readonly centralDirectoryOffset: number;
  readonly centralDirectorySize: number;
  readonly totalArchiveSize: number;
}

/**
 * Pure pre-allocation guard for non-ZIP64 archives.
 * Validates entry count, individual entry size, LFH offset, CD offset, CD size,
 * and total archive size strictly below ZIP64 sentinel values (0xFFFF / 0xFFFFFFFF)
 * using this writer's exact header sizes (LFH=30, CDFH=46, EOCD=22).
 */
export function assertZipFits(entries: readonly ZipEntryLayout[]): ZipLayoutSummary {
  const entryCount = entries.length;
  if (entryCount > ZIP_MAX_ENTRY_COUNT) {
    throw new ZipSizeLimitError(
      'ENTRY_COUNT_EXCEEDED',
      `Non-ZIP64 entry count ${entryCount} exceeds maximum ${ZIP_MAX_ENTRY_COUNT} (strictly below 0xFFFF sentinel)`,
      entryCount,
      ZIP_MAX_ENTRY_COUNT
    );
  }

  let currentOffset = 0;
  let centralDirectorySize = 0;

  for (let i = 0; i < entryCount; i++) {
    const { nameByteLength, byteLength } = entries[i];

    if (!Number.isSafeInteger(nameByteLength) || nameByteLength < 0) {
      throw new ZipSizeLimitError(
        'INVALID_ENTRY_LAYOUT',
        `Entry ${i} has invalid filename byte length ${nameByteLength}`,
        nameByteLength,
        ZIP_MAX_FILENAME_LENGTH
      );
    }
    if (nameByteLength > ZIP_MAX_FILENAME_LENGTH) {
      throw new ZipSizeLimitError(
        'FILENAME_TOO_LONG',
        `Entry ${i} filename byte length ${nameByteLength} exceeds uint16 max ${ZIP_MAX_FILENAME_LENGTH}`,
        nameByteLength,
        ZIP_MAX_FILENAME_LENGTH
      );
    }
    if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
      throw new ZipSizeLimitError(
        'INVALID_ENTRY_LAYOUT',
        `Entry ${i} has invalid byte length ${byteLength}`,
        byteLength,
        ZIP_MAX_ENTRY_SIZE
      );
    }
    if (byteLength > ZIP_MAX_ENTRY_SIZE) {
      throw new ZipSizeLimitError(
        'ENTRY_SIZE_EXCEEDED',
        `Entry ${i} size ${byteLength} exceeds non-ZIP64 maximum ${ZIP_MAX_ENTRY_SIZE} (strictly below 0xFFFFFFFF sentinel)`,
        byteLength,
        ZIP_MAX_ENTRY_SIZE
      );
    }
    if (currentOffset > ZIP_MAX_CD_OFFSET) {
      throw new ZipSizeLimitError(
        'ENTRY_OFFSET_EXCEEDED',
        `Entry ${i} local header offset ${currentOffset} exceeds non-ZIP64 maximum ${ZIP_MAX_CD_OFFSET}`,
        currentOffset,
        ZIP_MAX_CD_OFFSET
      );
    }

    const lfhTotal = ZIP_LOCAL_HEADER_SIZE + nameByteLength + byteLength;
    currentOffset += lfhTotal;
    if (currentOffset > ZIP_MAX_CD_OFFSET) {
      throw new ZipSizeLimitError(
        'CENTRAL_DIR_OFFSET_EXCEEDED',
        `Central directory offset ${currentOffset} exceeds non-ZIP64 maximum ${ZIP_MAX_CD_OFFSET} (strictly below 0xFFFFFFFF sentinel)`,
        currentOffset,
        ZIP_MAX_CD_OFFSET
      );
    }

    centralDirectorySize += ZIP_CENTRAL_HEADER_SIZE + nameByteLength;
    if (centralDirectorySize > ZIP_MAX_CD_SIZE) {
      throw new ZipSizeLimitError(
        'CENTRAL_DIR_SIZE_EXCEEDED',
        `Central directory size ${centralDirectorySize} exceeds non-ZIP64 maximum ${ZIP_MAX_CD_SIZE}`,
        centralDirectorySize,
        ZIP_MAX_CD_SIZE
      );
    }
  }

  const centralDirectoryOffset = currentOffset;
  const totalArchiveSize = centralDirectoryOffset + centralDirectorySize + ZIP_EOCD_SIZE;
  if (totalArchiveSize > ZIP_MAX_ARCHIVE_SIZE) {
    throw new ZipSizeLimitError(
      'ARCHIVE_SIZE_EXCEEDED',
      `Total archive size ${totalArchiveSize} exceeds non-ZIP64 maximum ${ZIP_MAX_ARCHIVE_SIZE} (strictly below 0xFFFFFFFF sentinel)`,
      totalArchiveSize,
      ZIP_MAX_ARCHIVE_SIZE
    );
  }

  return {
    entryCount,
    centralDirectoryOffset,
    centralDirectorySize,
    totalArchiveSize,
  };
}

// --- Fast CRC-32 Table Generation ---
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xEDB88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[i] = c;
}

function crc32(buffer: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = crcTable[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const encoder = new TextEncoder();

/**
 * Normalizes all file timestamps inside a ZIP archive to MS-DOS Epoch (1980-01-01 00:00:00).
 * Prevents OS filesystem timestamps, Extra Fields, and OS Versions from leaking.
 * Uses 0-dependency pure DataView binary serialization.
 */
export async function createSanitizedZipBundle(
  items: SanitizedResult[],
  onProgress?: (percent: number) => void
): Promise<{ zipBlob: Blob; zipFileName: string }> {
  // Pre-allocation validation before reading any Blob into RAM
  const encodedNames = items.map(item => encoder.encode(item.sanitizedName));
  assertZipFits(
    items.map((item, i) => ({
      nameByteLength: encodedNames[i].length,
      byteLength: item.blob.size,
    }))
  );

  // Pass 1: Prepare data and calculate sizes
  const files: {
    nameBytes: Uint8Array;
    data: Uint8Array;
    crc: number;
    size: number;
    offset: number;
  }[] = [];

  let outBuffer: ArrayBuffer | null = null;

  try {
    let currentOffset = 0;
    let cdSize = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const arrayBuffer = await item.blob.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const nameBytes = encodedNames[i];
      const crc = crc32(data);
      const size = data.length;

      files.push({
        nameBytes,
        data,
        crc,
        size,
        offset: currentOffset,
      });

      const lfhSize = ZIP_LOCAL_HEADER_SIZE + nameBytes.length + size;
      currentOffset += lfhSize;
      cdSize += ZIP_CENTRAL_HEADER_SIZE + nameBytes.length;

      onProgress?.(Math.round(((i + 1) / items.length) * 40));
    }

    // Re-validate actual read byte lengths before contiguous allocation
    const summary = assertZipFits(
      files.map(f => ({
        nameByteLength: f.nameBytes.length,
        byteLength: f.size,
      }))
    );

    const totalSize = summary.totalArchiveSize;
    outBuffer = new ArrayBuffer(totalSize);
    const outView = new DataView(outBuffer);
    const outU8 = new Uint8Array(outBuffer);

    let pos = 0;

    // Constants for anti-forensic ZIP
    const DOS_TIME = 0x0000;
    const DOS_DATE = 0x0021; // Jan 1, 1980
    const VERSION_NEEDED = 20; // 2.0
    const VERSION_MADE_BY = 0x0014; // MS-DOS/FAT
    const COMPRESSION_STORED = 0;

    // Pass 2: Write Local File Headers and Data
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // LFH Signature
      outView.setUint32(pos, 0x04034b50, true); pos += 4;
      outView.setUint16(pos, VERSION_NEEDED, true); pos += 2; // version needed
      outView.setUint16(pos, 0x0000, true); pos += 2; // flags
      outView.setUint16(pos, COMPRESSION_STORED, true); pos += 2; // compression
      outView.setUint16(pos, DOS_TIME, true); pos += 2; // dos time
      outView.setUint16(pos, DOS_DATE, true); pos += 2; // dos date
      outView.setUint32(pos, file.crc, true); pos += 4; // crc
      outView.setUint32(pos, file.size, true); pos += 4; // compressed size
      outView.setUint32(pos, file.size, true); pos += 4; // uncompressed size
      outView.setUint16(pos, file.nameBytes.length, true); pos += 2; // file name length
      outView.setUint16(pos, 0, true); pos += 2; // extra field length

      // File name
      outU8.set(file.nameBytes, pos); pos += file.nameBytes.length;
      // File data
      outU8.set(file.data, pos); pos += file.size;

      onProgress?.(40 + Math.round(((i + 1) / files.length) * 40));
    }

    const cdOffset = pos;

    // Pass 3: Write Central Directory
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // CD Signature
      outView.setUint32(pos, 0x02014b50, true); pos += 4;
      outView.setUint16(pos, VERSION_MADE_BY, true); pos += 2; // version made by
      outView.setUint16(pos, VERSION_NEEDED, true); pos += 2; // version needed
      outView.setUint16(pos, 0x0000, true); pos += 2; // flags
      outView.setUint16(pos, COMPRESSION_STORED, true); pos += 2; // compression
      outView.setUint16(pos, DOS_TIME, true); pos += 2; // dos time
      outView.setUint16(pos, DOS_DATE, true); pos += 2; // dos date
      outView.setUint32(pos, file.crc, true); pos += 4; // crc
      outView.setUint32(pos, file.size, true); pos += 4; // compressed size
      outView.setUint32(pos, file.size, true); pos += 4; // uncompressed size
      outView.setUint16(pos, file.nameBytes.length, true); pos += 2; // file name length
      outView.setUint16(pos, 0, true); pos += 2; // extra field length
      outView.setUint16(pos, 0, true); pos += 2; // file comment length
      outView.setUint16(pos, 0, true); pos += 2; // disk number start
      outView.setUint16(pos, 0, true); pos += 2; // internal attributes
      outView.setUint32(pos, 0x00000020, true); pos += 4; // external attributes (Archive)
      outView.setUint32(pos, file.offset, true); pos += 4; // relative offset of LFH

      // File name
      outU8.set(file.nameBytes, pos); pos += file.nameBytes.length;
    }

    // Pass 4: Write End of Central Directory
    outView.setUint32(pos, 0x06054b50, true); pos += 4; // EOCD signature
    outView.setUint16(pos, 0, true); pos += 2; // number of this disk
    outView.setUint16(pos, 0, true); pos += 2; // disk where CD starts
    outView.setUint16(pos, files.length, true); pos += 2; // number of CD records on this disk
    outView.setUint16(pos, files.length, true); pos += 2; // total number of CD records
    outView.setUint32(pos, cdSize, true); pos += 4; // size of CD
    outView.setUint32(pos, cdOffset, true); pos += 4; // offset of start of CD
    outView.setUint16(pos, 0, true); pos += 2; // comment length

    onProgress?.(100);

    const zipBlob = new Blob([outBuffer], { type: 'application/zip' });
    const zipFileName = await generateEphemeralSaltedName(outBuffer, 'zip', 12);

    return {
      zipBlob,
      zipFileName: `bundle_${zipFileName}`,
    };
  } finally {
    for (const file of files) {
      wipeBuffer(file.data);
    }
    if (outBuffer) {
      wipeBuffer(outBuffer);
    }
  }
}

/**
 * Triggers a client-side ephemeral download without persisting history in application storage.
 */
export function triggerEphemeralDownload(
  blob: Blob,
  fileName: string,
  onRevoked?: () => void
): string {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke object URL after a short timeout to free RAM
  setTimeout(() => {
    URL.revokeObjectURL(url);
    onRevoked?.();
  }, 1000);

  return url;
}
