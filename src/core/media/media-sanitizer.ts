import { DefenseLevel, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateSanitizedName } from '../forensic/hash-naming';

export interface MediaSanitizerOptions {
  defenseLevel: DefenseLevel;
}

// FourCC Integer constants for branchless matching
export const FOURCC_FTYP = 0x66747970;
export const FOURCC_MOOV = 0x6d6f6f76;
export const FOURCC_MVHD = 0x6d766864;
export const FOURCC_TKHD = 0x746b6864;
export const FOURCC_MDHD = 0x6d646864;
export const FOURCC_UDTA = 0x75647461;
export const FOURCC_META = 0x6d657461;
export const FOURCC_ILST = 0x696c7374;
export const FOURCC_UUID = 0x75756964;
export const FOURCC_MDAT = 0x6d646174;
export const FOURCC_FREE = 0x66726565; // 'free' padding atom

export function isMp4OrMov(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = view.getUint32(4, false);
  return tag === FOURCC_FTYP || tag === FOURCC_MOOV;
}

export function isAudioFile(mimeType: string, name: string): boolean {
  return mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(name);
}

/**
 * In-place mutation of ISOBMFF containers.
 * Maintains original file size absolutely to preserve stco and co64 frame pointers.
 * Overwrites target metadata atoms (udta, uuid, meta, ilst) with 'free' (0x66726565) and zeroes payload.
 */
export function sanitizeMp4InPlaceZeroCopy(input: Uint8Array): Uint8Array {
  const output = new Uint8Array(input.length);
  output.set(input);
  const view = new DataView(output.buffer, output.byteOffset, output.byteLength);

  sanitizeBoxListInPlace(output, view, 0, output.length);
  return output;
}

function sanitizeBoxListInPlace(
  bytes: Uint8Array,
  view: DataView,
  start: number,
  end: number
): void {
  let offset = start;

  while (offset + 8 <= end) {
    const boxSize = view.getUint32(offset, false);
    const boxType = view.getUint32(offset + 4, false);

    let actualSize = boxSize;
    let headerSize = 8;

    if (boxSize === 0) {
      actualSize = end - offset;
    } else if (boxSize === 1) {
      if (offset + 16 > end) break;
      actualSize = Number(view.getBigUint64(offset + 8, false));
      headerSize = 16;
    }

    if (actualSize < headerSize || offset + actualSize > end) break;

    // Target proprietary metadata blocks -> mutate in-place to 'free' and zero payload
    const isMetadata =
      boxType === FOURCC_UDTA ||
      boxType === FOURCC_META ||
      boxType === FOURCC_UUID ||
      boxType === FOURCC_ILST;

    if (isMetadata) {
      view.setUint32(offset + 4, FOURCC_FREE, false);
      bytes.fill(0, offset + headerSize, offset + actualSize);
      offset += actualSize;
      continue;
    }

    // Container boxes -> recurse inside
    const isContainer =
      boxType === FOURCC_MOOV ||
      boxType === 0x7472616b /* trak */ ||
      boxType === 0x6d646961 /* mdia */ ||
      boxType === 0x6d696e66 /* minf */ ||
      boxType === 0x7374626c /* stbl */ ||
      boxType === 0x64696e66 /* dinf */;

    if (isContainer) {
      sanitizeBoxListInPlace(bytes, view, offset + headerSize, offset + actualSize);
    } else if (boxType === FOURCC_MDAT) {
      // In-place zeroing of encoder banners like 'x264 - core'
      sanitizeMdatInPlace(bytes, offset + headerSize, offset + actualSize);
    } else if (
      (boxType === FOURCC_MVHD || boxType === FOURCC_TKHD || boxType === FOURCC_MDHD) &&
      actualSize >= headerSize + 20
    ) {
      // Zero out creation and modification timestamps in-place
      const version = bytes[offset + headerSize];
      if (version === 0) {
        view.setUint32(offset + headerSize + 4, 0, false);
        view.setUint32(offset + headerSize + 8, 0, false);
      } else if (version === 1 && actualSize >= headerSize + 28) {
        view.setBigUint64(offset + headerSize + 4, 0n, false);
        view.setBigUint64(offset + headerSize + 12, 0n, false);
      }
    }

    offset += actualSize;
  }
}

function sanitizeMdatInPlace(bytes: Uint8Array, start: number, end: number): void {
  const banner = new TextEncoder().encode('x264 - core');
  for (let i = start; i <= end - banner.length; i++) {
    let match = true;
    for (let j = 0; j < banner.length; j++) {
      if (bytes[i + j] !== banner[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      for (let k = 0; k < 256 && i + k < end; k++) {
        bytes[i + k] = 0;
      }
    }
  }
}

/**
 * Zero-copy ID3 header stripping
 */
export function sanitizeAudioHeadersZeroCopy(bytes: Uint8Array): Uint8Array {
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

/**
 * Offloads structural media processing to a Web Worker via Transferable Objects.
 * Falls back to synchronous execution when Worker is undefined (Node.js test environment).
 */
export async function sanitizeMediaWithWorker(
  buffer: ArrayBuffer,
  mimeType: string,
  originalName: string
): Promise<Uint8Array> {
  if (typeof Worker !== 'undefined') {
    return new Promise<Uint8Array>((resolve, reject) => {
      try {
        const worker = new Worker(
          new URL('../workers/media.worker.ts', import.meta.url),
          { type: 'module' }
        );

        worker.onmessage = (e: MessageEvent<{ buffer: ArrayBuffer }>) => {
          const result = new Uint8Array(e.data.buffer);
          worker.terminate();
          resolve(result);
        };

        worker.onerror = err => {
          worker.terminate();
          reject(err);
        };

        // Zero-copy transfer of input buffer to Worker
        worker.postMessage({ buffer, mimeType, originalName }, [buffer]);
      } catch {
        const bytes = new Uint8Array(buffer);
        const res = isMp4OrMov(bytes)
          ? sanitizeMp4InPlaceZeroCopy(bytes)
          : isAudioFile(mimeType, originalName)
          ? sanitizeAudioHeadersZeroCopy(bytes)
          : bytes;
        resolve(res);
      }
    });
  }

  const bytes = new Uint8Array(buffer);
  if (isMp4OrMov(bytes)) {
    return sanitizeMp4InPlaceZeroCopy(bytes);
  } else if (isAudioFile(mimeType, originalName)) {
    return sanitizeAudioHeadersZeroCopy(bytes);
  }
  return bytes;
}

/**
 * Client-Side Video & Audio Anti-Forensic Sanitizer
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

  let arrayBuffer: ArrayBuffer | null = await file.arrayBuffer();
  const mimeType = file.type || '';

  // Process via Web Worker with Transferable Objects
  let cleanBytes: Uint8Array | null = await sanitizeMediaWithWorker(
    arrayBuffer,
    mimeType,
    originalName
  );
  onProgress?.(75);

  const cleanBlob = new Blob([cleanBytes as any], { type: mimeType || 'video/mp4' });
  const ext = originalName.split('.').pop() || 'mp4';
  const sanitizedName = await generateSanitizedName(cleanBytes, ext);
  onProgress?.(90);

  const auditAfter = await analyzeForensics(cleanBlob, sanitizedName);
  onProgress?.(100);

  const result: SanitizedResult = {
    blob: cleanBlob,
    originalBlob: file,
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

  // Aggressive memory hygiene: decouple buffers for GC
  cleanBytes = null;
  arrayBuffer = null;

  return result;
}
