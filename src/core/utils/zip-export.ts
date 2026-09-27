import { SanitizedResult } from '../types';
import { generateEphemeralSaltedName } from '../forensic/hash-naming';

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
  
  // Pass 1: Prepare data and calculate sizes
  const files: {
    nameBytes: Uint8Array;
    data: Uint8Array;
    crc: number;
    size: number;
    offset: number;
  }[] = [];

  let currentOffset = 0;
  let cdSize = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const arrayBuffer = await item.blob.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const nameBytes = encoder.encode(item.sanitizedName);
    const crc = crc32(data);
    const size = data.length;

    files.push({
      nameBytes,
      data,
      crc,
      size,
      offset: currentOffset,
    });

    // LFH size: 30 bytes + name length + data length
    const lfhSize = 30 + nameBytes.length + size;
    currentOffset += lfhSize;

    // CD header size: 46 bytes + name length
    cdSize += 46 + nameBytes.length;

    onProgress?.(Math.round(((i + 1) / items.length) * 40));
  }

  // EOCD size: 22 bytes
  const totalSize = currentOffset + cdSize + 22;
  const outBuffer = new ArrayBuffer(totalSize);
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
}

/**
 * Triggers a client-side ephemeral download without persisting history in application storage.
 */
export function triggerEphemeralDownload(blob: Blob, fileName: string): void {
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
  }, 1000);
}
