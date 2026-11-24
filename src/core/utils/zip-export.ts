import { SanitizedResult } from '../types';
import { generateSanitizedName } from '../forensic/hash-naming';
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
 * Deterministically deduplicates colliding ZIP entry filenames (case-insensitively),
 * including cascading collisions such as ["a.webp", "a.webp", "a-2.webp"].
 * Runs strictly BEFORE assertZipFits so expanded filenames are accounted for in bounds checks.
 */
export function deduplicateZipEntryNames(names: readonly string[]): string[] {
  const usedLower = new Set<string>();
  const result: string[] = new Array(names.length);

  for (let i = 0; i < names.length; i++) {
    const rawName = names[i];
    const rawKey = rawName.toLowerCase();
    if (!usedLower.has(rawKey)) {
      usedLower.add(rawKey);
      result[i] = rawName;
      continue;
    }

    const lastDot = rawName.lastIndexOf('.');
    const hasExt = lastDot > 0 && lastDot < rawName.length - 1;
    const stem = hasExt ? rawName.slice(0, lastDot) : rawName;
    const ext = hasExt ? rawName.slice(lastDot) : '';

    let suffix = 2;
    let candidate = `${stem}-${suffix}${ext}`;
    while (usedLower.has(candidate.toLowerCase())) {
      suffix++;
      candidate = `${stem}-${suffix}${ext}`;
    }

    usedLower.add(candidate.toLowerCase());
    result[i] = candidate;
  }

  return result;
}

/**
 * Normalizes all file timestamps inside a ZIP archive to MS-DOS Epoch (1980-01-01 00:00:00).
 * Prevents OS filesystem timestamps, Extra Fields, and OS Versions from leaking.
 * Uses 0-dependency pure DataView binary serialization.
 */
export async function createSanitizedZipBundle(
  items: SanitizedResult[],
  onProgress?: (percent: number) => void
): Promise<{ zipBlob: Blob; zipFileName: string }> {
  // Deduplicate colliding entry filenames strictly BEFORE pre-allocation size validation
  const uniqueNames = deduplicateZipEntryNames(items.map(item => item.sanitizedName));
  const encodedNames = uniqueNames.map(name => encoder.encode(name));
  assertZipFits(
    items.map((item, i) => ({
      nameByteLength: encodedNames[i].length,
      byteLength: item.blob.size,
    }))
  );

  // Constants for anti-forensic ZIP
  const DOS_TIME = 0x0000;
  const DOS_DATE = 0x0021; // Jan 1, 1980
  const VERSION_NEEDED = 20; // 2.0
  const VERSION_MADE_BY = 0x0014; // MS-DOS/FAT
  const COMPRESSION_STORED = 0;

  const entries: {
    nameBytes: Uint8Array;
    crc: number;
    size: number;
    offset: number;
  }[] = [];
  const tempBuffers: Uint8Array[] = [];
  const parts: BlobPart[] = [];

  try {
    let currentOffset = 0;

    // Pass 1: Stream each entry individually to compute CRC-32, emit its LFH, and
    // compose the ZIP via Blob parts without duplicating a second contiguous ArrayBuffer.
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const nameBytes = encodedNames[i];
      let data: Uint8Array | null = null;
      let crc = 0;
      let size = 0;

      try {
        const arrayBuffer = await item.blob.arrayBuffer();
        data = new Uint8Array(arrayBuffer);
        crc = crc32(data);
        size = data.length;
      } finally {
        if (data) {
          wipeBuffer(data);
        }
      }

      const lfhBytes = new Uint8Array(ZIP_LOCAL_HEADER_SIZE + nameBytes.length);
      tempBuffers.push(lfhBytes);
      const lfhView = new DataView(lfhBytes.buffer, lfhBytes.byteOffset, lfhBytes.byteLength);

      let lfhPos = 0;
      lfhView.setUint32(lfhPos, 0x04034b50, true); lfhPos += 4; // LFH signature
      lfhView.setUint16(lfhPos, VERSION_NEEDED, true); lfhPos += 2; // version needed
      lfhView.setUint16(lfhPos, 0x0000, true); lfhPos += 2; // flags
      lfhView.setUint16(lfhPos, COMPRESSION_STORED, true); lfhPos += 2; // compression
      lfhView.setUint16(lfhPos, DOS_TIME, true); lfhPos += 2; // dos time
      lfhView.setUint16(lfhPos, DOS_DATE, true); lfhPos += 2; // dos date
      lfhView.setUint32(lfhPos, crc, true); lfhPos += 4; // crc
      lfhView.setUint32(lfhPos, size, true); lfhPos += 4; // compressed size
      lfhView.setUint32(lfhPos, size, true); lfhPos += 4; // uncompressed size
      lfhView.setUint16(lfhPos, nameBytes.length, true); lfhPos += 2; // file name length
      lfhView.setUint16(lfhPos, 0, true); lfhPos += 2; // extra field length
      lfhBytes.set(nameBytes, lfhPos);

      entries.push({
        nameBytes,
        crc,
        size,
        offset: currentOffset,
      });

      parts.push(lfhBytes, item.blob);
      currentOffset += ZIP_LOCAL_HEADER_SIZE + nameBytes.length + size;

      onProgress?.(Math.round(((i + 1) / items.length) * 80));
    }

    // Re-validate actual read byte lengths before writing central directory and EOCD
    const summary = assertZipFits(
      entries.map(e => ({
        nameByteLength: e.nameBytes.length,
        byteLength: e.size,
      }))
    );

    // Pass 2: Write Central Directory and End of Central Directory into a single compact buffer
    const cdAndEocd = new Uint8Array(summary.centralDirectorySize + ZIP_EOCD_SIZE);
    tempBuffers.push(cdAndEocd);
    const cdView = new DataView(cdAndEocd.buffer, cdAndEocd.byteOffset, cdAndEocd.byteLength);

    let pos = 0;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      cdView.setUint32(pos, 0x02014b50, true); pos += 4; // CD signature
      cdView.setUint16(pos, VERSION_MADE_BY, true); pos += 2; // version made by
      cdView.setUint16(pos, VERSION_NEEDED, true); pos += 2; // version needed
      cdView.setUint16(pos, 0x0000, true); pos += 2; // flags
      cdView.setUint16(pos, COMPRESSION_STORED, true); pos += 2; // compression
      cdView.setUint16(pos, DOS_TIME, true); pos += 2; // dos time
      cdView.setUint16(pos, DOS_DATE, true); pos += 2; // dos date
      cdView.setUint32(pos, entry.crc, true); pos += 4; // crc
      cdView.setUint32(pos, entry.size, true); pos += 4; // compressed size
      cdView.setUint32(pos, entry.size, true); pos += 4; // uncompressed size
      cdView.setUint16(pos, entry.nameBytes.length, true); pos += 2; // file name length
      cdView.setUint16(pos, 0, true); pos += 2; // extra field length
      cdView.setUint16(pos, 0, true); pos += 2; // file comment length
      cdView.setUint16(pos, 0, true); pos += 2; // disk number start
      cdView.setUint16(pos, 0, true); pos += 2; // internal attributes
      cdView.setUint32(pos, 0x00000020, true); pos += 4; // external attributes (Archive)
      cdView.setUint32(pos, entry.offset, true); pos += 4; // relative offset of LFH
      cdAndEocd.set(entry.nameBytes, pos); pos += entry.nameBytes.length;
    }

    // End of Central Directory
    cdView.setUint32(pos, 0x06054b50, true); pos += 4; // EOCD signature
    cdView.setUint16(pos, 0, true); pos += 2; // number of this disk
    cdView.setUint16(pos, 0, true); pos += 2; // disk where CD starts
    cdView.setUint16(pos, entries.length, true); pos += 2; // number of CD records on this disk
    cdView.setUint16(pos, entries.length, true); pos += 2; // total number of CD records
    cdView.setUint32(pos, summary.centralDirectorySize, true); pos += 4; // size of CD
    cdView.setUint32(pos, summary.centralDirectoryOffset, true); pos += 4; // offset of start of CD
    cdView.setUint16(pos, 0, true); pos += 2; // comment length

    parts.push(cdAndEocd);
    onProgress?.(100);

    const zipBlob = new Blob(parts, { type: 'application/zip' });
    // Derive 32-char lowercase hex filename deterministically from Central Directory + EOCD
    // bytes (which commit to every entry's name, size, offset, and CRC-32) without doubling RAM.
    const zipFileName = await generateSanitizedName(cdAndEocd, 'zip', 32);

    return {
      zipBlob,
      zipFileName,
    };
  } finally {
    for (const buf of tempBuffers) {
      wipeBuffer(buf);
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
