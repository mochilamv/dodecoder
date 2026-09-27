import { DefenseLevel, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateHashedName } from '../forensic/hash-naming';

export interface MediaSanitizerOptions {
  defenseLevel: DefenseLevel;
}

// FourCC Integer constants for branchless matching
const FOURCC_FTYP = 0x66747970;
const FOURCC_MOOV = 0x6d6f6f76;
const FOURCC_MVHD = 0x6d766864;
const FOURCC_TKHD = 0x746b6864;
const FOURCC_UDTA = 0x75647461;
const FOURCC_META = 0x6d657461;
const FOURCC_ILST = 0x696c7374;
const FOURCC_UUID = 0x75756964;

/**
 * Client-Side Video & Audio Anti-Forensic Sanitizer
 * Zero-copy block-level container decimation and metadata stripping.
 */
export async function sanitizeMedia(
  file: File | Blob,
  options: MediaSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  onProgress?.(15);
  const originalName = file instanceof File ? file.name : 'unnamed_media';
  const auditBefore = await analyzeForensics(file, originalName);
  onProgress?.(35);

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let cleanBytes: Uint8Array;
  const mimeType = file.type || '';

  if (isMp4OrMov(bytes)) {
    cleanBytes = sanitizeMp4ContainerZeroCopy(bytes);
  } else if (isAudioFile(mimeType, originalName)) {
    cleanBytes = sanitizeAudioHeadersZeroCopy(bytes);
  } else {
    cleanBytes = bytes;
  }
  onProgress?.(75);

  const cleanBlob = new Blob([cleanBytes as any], { type: mimeType || 'video/mp4' });
  const ext = originalName.split('.').pop() || 'mp4';
  const sanitizedName = await generateHashedName(cleanBytes, ext);
  onProgress?.(90);

  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
  onProgress?.(100);

  return {
    blob: cleanBlob,
    originalName,
    sanitizedName,
    originalSize: file.size,
    sanitizedSize: cleanBlob.size,
    format: mimeType,
    sha256: auditAfter.sha256,
    defenseLevel: options.defenseLevel,
    auditBefore,
    auditAfter,
    processedAt: Date.now(),
  };
}

function isMp4OrMov(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = view.getUint32(4, false);
  return tag === FOURCC_FTYP || tag === FOURCC_MOOV;
}

function isAudioFile(mimeType: string, name: string): boolean {
  return mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(name);
}

/**
 * Zero-copy MP4 / MOV Container Sanitizer
 * Pre-allocates single continuous buffer and leverages Uint8Array.prototype.set (V8 memcpy).
 */
function sanitizeMp4ContainerZeroCopy(input: Uint8Array): Uint8Array {
  const output = new Uint8Array(input.length);
  let writeOffset = 0;
  let readOffset = 0;
  const len = input.length;
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);

  while (readOffset + 8 <= len) {
    const boxSize = view.getUint32(readOffset, false);
    const boxType = view.getUint32(readOffset + 4, false);

    let actualSize = boxSize;
    let headerSize = 8;
    if (boxSize === 0) {
      actualSize = len - readOffset;
    } else if (boxSize === 1) {
      if (readOffset + 16 > len) break;
      actualSize = Number(view.getBigUint64(readOffset + 8, false));
      headerSize = 16;
    }

    if (actualSize < headerSize || readOffset + actualSize > len) break;

    // Discard top-level user data or proprietary metadata boxes
    if (boxType === FOURCC_UDTA || boxType === FOURCC_META || boxType === FOURCC_UUID) {
      readOffset += actualSize;
      continue;
    }

    if (boxType === FOURCC_MOOV) {
      const moovSlice = input.subarray(readOffset, readOffset + actualSize);
      const cleanedMoov = sanitizeMoovBoxZeroCopy(moovSlice);
      output.set(cleanedMoov, writeOffset);
      writeOffset += cleanedMoov.length;
    } else {
      // Direct block copy of raw video/audio chunks (mdat, ftyp)
      output.set(input.subarray(readOffset, readOffset + actualSize), writeOffset);
      writeOffset += actualSize;
    }

    readOffset += actualSize;
  }

  return output.subarray(0, writeOffset);
}

/**
 * Zero-copy deep sanitization of moov box
 */
function sanitizeMoovBoxZeroCopy(moovBytes: Uint8Array): Uint8Array {
  const output = new Uint8Array(moovBytes.length);
  let writeOffset = 8; // Reserve 8 bytes for moov header
  let readOffset = 8;
  const len = moovBytes.length;
  const inView = new DataView(moovBytes.buffer, moovBytes.byteOffset, moovBytes.byteLength);
  const outView = new DataView(output.buffer, output.byteOffset, output.byteLength);

  // Set 'moov' FourCC in placeholder
  outView.setUint32(4, FOURCC_MOOV, false);

  while (readOffset + 8 <= len) {
    const boxSize = inView.getUint32(readOffset, false);
    const boxType = inView.getUint32(readOffset + 4, false);

    let actualSize = boxSize;
    let headerSize = 8;
    if (boxSize === 0) {
      actualSize = len - readOffset;
    } else if (boxSize === 1) {
      if (readOffset + 16 > len) break;
      actualSize = Number(inView.getBigUint64(readOffset + 8, false));
      headerSize = 16;
    }

    if (actualSize < headerSize || readOffset + actualSize > len) break;

    // Discard nested metadata
    if (boxType === FOURCC_UDTA || boxType === FOURCC_META || boxType === FOURCC_ILST || boxType === FOURCC_UUID) {
      readOffset += actualSize;
      continue;
    }

    const boxSub = moovBytes.subarray(readOffset, readOffset + actualSize);
    output.set(boxSub, writeOffset);

    // Normalize mvhd (Movie Header) timestamps
    if (boxType === FOURCC_MVHD && actualSize >= 28) {
      const version = output[writeOffset + 8];
      if (version === 0) {
        outView.setUint32(writeOffset + 12, 0, false);
        outView.setUint32(writeOffset + 16, 0, false);
      } else if (version === 1 && actualSize >= 40) {
        outView.setBigUint64(writeOffset + 12, 0n, false);
        outView.setBigUint64(writeOffset + 20, 0n, false);
      }
    }

    // Normalize tkhd (Track Header) timestamps
    if (boxType === FOURCC_TKHD && actualSize >= 28) {
      const version = output[writeOffset + 8];
      if (version === 0) {
        outView.setUint32(writeOffset + 12, 0, false);
        outView.setUint32(writeOffset + 16, 0, false);
      }
    }

    writeOffset += actualSize;
    readOffset += actualSize;
  }

  // Update total moov box size
  outView.setUint32(0, writeOffset, false);

  return output.subarray(0, writeOffset);
}

/**
 * Zero-copy ID3 header stripping
 */
function sanitizeAudioHeadersZeroCopy(bytes: Uint8Array): Uint8Array {
  let startOffset = 0;
  let endOffset = bytes.length;

  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    startOffset = 10 + size;
  }

  if (bytes.length >= 128) {
    const tagIdx = bytes.length - 128;
    if (bytes[tagIdx] === 0x54 && bytes[tagIdx + 1] === 0x41 && bytes[tagIdx + 2] === 0x47) {
      endOffset = tagIdx;
    }
  }

  return bytes.subarray(startOffset, endOffset);
}
