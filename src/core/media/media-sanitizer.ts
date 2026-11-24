import { DefenseLevel, MAX_MEDIA_FILE_BYTES, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { finalizeSanitizedOutput } from '../forensic/finalize-output';
import { createAbortError, isAbortError } from '../image/bitmap-lifecycle';

export { MAX_MEDIA_FILE_BYTES } from '../types';

export interface MediaSanitizerOptions {
  defenseLevel: DefenseLevel;
  signal?: AbortSignal;
}

export class MediaFileSizeLimitError extends RangeError {
  public readonly code = 'MEDIA_FILE_SIZE_LIMIT_EXCEEDED' as const;
  public readonly actualBytes: number;
  public readonly maxBytes: number;

  constructor(actualBytes: number, maxBytes: number = MAX_MEDIA_FILE_BYTES) {
    super(
      `MP4/MOV file size (${actualBytes} bytes) exceeds in-memory limit of ${maxBytes} bytes (256 MiB).`
    );
    this.name = 'MediaFileSizeLimitError';
    this.actualBytes = actualBytes;
    this.maxBytes = maxBytes;
  }
}

export type UnsupportedMediaCode =
  | 'AUDIO_UNSUPPORTED'
  | 'CONTAINER_UNSUPPORTED'
  | 'IMAGE_IN_MEDIA_PIPELINE';

export class UnsupportedMediaFormatError extends Error {
  public readonly code: UnsupportedMediaCode;

  constructor(code: UnsupportedMediaCode, message: string) {
    super(message);
    this.name = 'UnsupportedMediaFormatError';
    this.code = code;
  }
}

export function isImageMimeType(mimeType: string, name: string): boolean {
  return mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(name);
}

export function isStandaloneAudioFormat(mimeType: string, name: string): boolean {
  const mime = mimeType.toLowerCase();
  return mime.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(name);
}

export function isMkvOrWebm(mimeType: string, name: string, headerBytes?: Uint8Array): boolean {
  const mime = mimeType.toLowerCase();
  if (
    mime === 'video/webm' ||
    mime === 'video/x-matroska' ||
    mime === 'video/matroska' ||
    /\.(mkv|webm)$/i.test(name)
  ) {
    return true;
  }
  if (
    headerBytes &&
    headerBytes.byteLength >= 4 &&
    headerBytes[0] === 0x1a &&
    headerBytes[1] === 0x45 &&
    headerBytes[2] === 0xdf &&
    headerBytes[3] === 0xa3
  ) {
    return true;
  }
  return false;
}

export const FOURCC_FTYP = 0x66747970;
export const FOURCC_MOOV = 0x6d6f6f76;
export const FOURCC_MOOF = 0x6d6f6f66;
export const FOURCC_MVHD = 0x6d766864;
export const FOURCC_TKHD = 0x746b6864;
export const FOURCC_MDHD = 0x6d646864;
export const FOURCC_UDTA = 0x75647461;
export const FOURCC_META = 0x6d657461;
export const FOURCC_ILST = 0x696c7374;
export const FOURCC_UUID = 0x75756964;
export const FOURCC_CPRT = 0x63707274;
export const FOURCC_XMP_ = 0x584d505f;
export const FOURCC_KEYS = 0x6b657973;
export const FOURCC_MDAT = 0x6d646174;
export const FOURCC_FREE = 0x66726565;
export const FOURCC_SKIP = 0x736b6970;

// Sub-boxes for tracking hdlr and fragmented MP4 containers
export const FOURCC_TRAK = 0x7472616b;
export const FOURCC_TRAF = 0x74726166;
export const FOURCC_MDIA = 0x6d646961;
export const FOURCC_MINF = 0x6d696e66;
export const FOURCC_STBL = 0x7374626c;
export const FOURCC_DINF = 0x64696e66;
export const FOURCC_HDLR = 0x68646c72;

const FOURCC_VIDE = 0x76696465;
const FOURCC_SOUN = 0x736f756e;
const MP4_MAX_BOX_DEPTH = 16;

export function isMp4OrMov(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = view.getUint32(4, false);
  return tag === FOURCC_FTYP || tag === FOURCC_MOOV;
}

interface IsoBoxBounds {
  readonly boxType: number;
  readonly headerSize: number;
  readonly actualSize: number;
  readonly isToEof: boolean;
}

function readBoxBounds(view: DataView, offset: number, end: number): IsoBoxBounds | null {
  if (offset + 8 > end) return null;
  const rawSize = view.getUint32(offset, false);
  const boxType = view.getUint32(offset + 4, false);

  let headerSize = 8;
  let actualSize: number;
  let isToEof = false;

  if (rawSize === 0) {
    actualSize = end - offset;
    isToEof = true;
  } else if (rawSize === 1) {
    if (offset + 16 > end) return null;
    const largeSize = view.getBigUint64(offset + 8, false);
    if (largeSize < 16n || largeSize > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    actualSize = Number(largeSize);
    headerSize = 16;
  } else if (rawSize < 8) {
    return null;
  } else {
    actualSize = rawSize;
  }

  if (actualSize < headerSize || offset + actualSize > end) return null;
  return { boxType, headerSize, actualSize, isToEof };
}

function isMetadataAtomType(boxType: number): boolean {
  return (
    boxType === FOURCC_UDTA ||
    boxType === FOURCC_META ||
    boxType === FOURCC_UUID ||
    boxType === FOURCC_ILST ||
    boxType === FOURCC_CPRT ||
    boxType === FOURCC_XMP_ ||
    boxType === FOURCC_KEYS ||
    ((boxType >>> 24) & 0xff) === 0xa9 // QuickTime proprietary 0xA9-prefixed atoms (e.g. 0xA9xyz, 0xA9nam, 0xA9too)
  );
}

/**
 * In-memory MP4/MOV container metadata scrubber preserving exact box sizes and
 * byte offsets so stco/co64 chunk pointers and H.264/H.265 mdat bitstreams remain playable.
 */
export function sanitizeMp4InPlaceZeroCopy(input: Uint8Array): Uint8Array {
  const output = new Uint8Array(input.byteLength);
  output.set(input);
  const view = new DataView(output.buffer, output.byteOffset, output.byteLength);
  sanitizeBoxListInPlace(output, view, 0, output.byteLength, 0);
  return output;
}

function sanitizeBoxListInPlace(
  bytes: Uint8Array,
  view: DataView,
  start: number,
  end: number,
  depth: number
): void {
  if (depth > MP4_MAX_BOX_DEPTH) return;
  let offset = start;

  while (offset + 8 <= end) {
    const bounds = readBoxBounds(view, offset, end);
    if (!bounds) break;

    const { boxType, headerSize, actualSize, isToEof } = bounds;
    const payloadStart = offset + headerSize;
    const boxEnd = offset + actualSize;

    if (isMetadataAtomType(boxType)) {
      view.setUint32(offset + 4, FOURCC_FREE, false);
      bytes.fill(0, payloadStart, boxEnd);
      if (isToEof) break;
      offset = boxEnd;
      continue;
    }

    if (boxType === FOURCC_FREE || boxType === FOURCC_SKIP) {
      // Zero residual strings inside pre-existing padding boxes while preserving exact offsets
      bytes.fill(0, payloadStart, boxEnd);
      if (isToEof) break;
      offset = boxEnd;
      continue;
    }

    if (boxType === FOURCC_TRAK) {
      const isAllowed = checkTrakHandlerAllowed(view, payloadStart, boxEnd);
      if (!isAllowed) {
        view.setUint32(offset + 4, FOURCC_FREE, false);
        bytes.fill(0, payloadStart, boxEnd);
        if (isToEof) break;
        offset = boxEnd;
        continue;
      }
    }

    const isContainer =
      boxType === FOURCC_MOOV ||
      boxType === FOURCC_MOOF ||
      boxType === FOURCC_TRAK ||
      boxType === FOURCC_TRAF ||
      boxType === FOURCC_MDIA ||
      boxType === FOURCC_MINF ||
      boxType === FOURCC_STBL ||
      boxType === FOURCC_DINF;

    if (isContainer) {
      sanitizeBoxListInPlace(bytes, view, payloadStart, boxEnd, depth + 1);
    } else if (boxType === FOURCC_HDLR) {
      // FullBox hdlr layout (ISO/IEC 14496-12 Section 8.4.3 & QuickTime):
      // +0..+4: version(1) + flags(3) [preserve]
      // +4..+8: pre_defined / QuickTime component_type [zero]
      // +8..+12: handler_type ('vide' / 'soun') [preserve]
      // +12..+24: reserved[0..2] (QuickTime component_manufacturer e.g. 'appl', flags) [zero]
      // +24..end: hdlr.name string (e.g. "Core Media Video", "Lavf...") [zero]
      if (actualSize >= headerSize + 12) {
        bytes.fill(0, payloadStart + 4, payloadStart + 8);
        bytes.fill(0, payloadStart + 12, boxEnd);
      }
    } else if (boxType === FOURCC_MVHD || boxType === FOURCC_TKHD || boxType === FOURCC_MDHD) {
      // FullBox header: version (1 byte) + flags (3 bytes) followed by creation_time & modification_time.
      // Version 0: 32-bit timestamps (8 bytes total: +4..+12), preserving timescale/track_ID at +12.
      // Version 1: 64-bit timestamps (16 bytes total: +4..+20), preserving timescale/track_ID at +20.
      if (actualSize >= headerSize + 12) {
        const version = bytes[payloadStart];
        if (version === 0) {
          view.setUint32(payloadStart + 4, 0, false);
          view.setUint32(payloadStart + 8, 0, false);
        } else if (version === 1 && actualSize >= headerSize + 20) {
          view.setBigUint64(payloadStart + 4, 0n, false);
          view.setBigUint64(payloadStart + 12, 0n, false);
        }
      }
    }
    // Note: FOURCC_MDAT payload is intentionally preserved untouched so H.264/H.265/AAC bitstreams stay playable.

    if (isToEof) break;
    offset = boxEnd;
  }
}

function checkTrakHandlerAllowed(view: DataView, start: number, end: number): boolean {
  let mdiaStart = -1;
  let mdiaEnd = -1;

  let offset = start;
  while (offset + 8 <= end) {
    const bounds = readBoxBounds(view, offset, end);
    if (!bounds) return false;

    if (bounds.boxType === FOURCC_MDIA) {
      mdiaStart = offset + bounds.headerSize;
      mdiaEnd = offset + bounds.actualSize;
      break;
    }
    if (bounds.isToEof) break;
    offset += bounds.actualSize;
  }

  if (mdiaStart !== -1) {
    let o = mdiaStart;
    while (o + 8 <= mdiaEnd) {
      const bounds = readBoxBounds(view, o, mdiaEnd);
      if (!bounds) return false;

      if (bounds.boxType === FOURCC_HDLR) {
        if (bounds.actualSize < bounds.headerSize + 12) return false;
        const hdlrType = view.getUint32(o + bounds.headerSize + 8, false);
        return hdlrType === FOURCC_VIDE || hdlrType === FOURCC_SOUN;
      }
      if (bounds.isToEof) break;
      o += bounds.actualSize;
    }
  }
  return false;
}

export async function sanitizeMediaWithWorker(
  buffer: ArrayBuffer,
  mimeType: string,
  originalName: string,
  signal?: AbortSignal
): Promise<Uint8Array> {
  if (signal?.aborted) throw createAbortError(signal.reason);

  if (isImageMimeType(mimeType, originalName)) {
    throw new UnsupportedMediaFormatError(
      'IMAGE_IN_MEDIA_PIPELINE',
      'Image payload rejected from media pipeline.'
    );
  }
  if (isStandaloneAudioFormat(mimeType, originalName)) {
    throw new UnsupportedMediaFormatError(
      'AUDIO_UNSUPPORTED',
      `Standalone audio format rejected: MIME="${mimeType}" name="${originalName}". Only images and MP4/MOV video containers are supported.`
    );
  }
  if (buffer.byteLength > MAX_MEDIA_FILE_BYTES) {
    throw new MediaFileSizeLimitError(buffer.byteLength, MAX_MEDIA_FILE_BYTES);
  }

  const headerView = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength));
  if (isMkvOrWebm(mimeType, originalName, headerView)) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      `MKV/WebM container rejected: MIME="${mimeType}" name="${originalName}". Only MP4 and MOV container metadata sanitization is supported.`
    );
  }
  if (!isMp4OrMov(headerView)) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      `Unsupported video container: MIME="${mimeType}" name="${originalName}". Only valid ISOBMFF MP4 and QuickTime MOV files are supported.`
    );
  }

  if (typeof Worker !== 'undefined') {
    return new Promise<Uint8Array>((resolve, reject) => {
      if (signal?.aborted) {
        reject(createAbortError(signal.reason));
        return;
      }
      try {
        const worker = new Worker(
          new URL('../workers/media.worker.ts', import.meta.url),
          { type: 'module' }
        );
        let settled = false;
        const onAbort = () => {
          if (settled) return;
          settled = true;
          worker.terminate();
          reject(createAbortError(signal?.reason));
        };
        const cleanup = () => {
          signal?.removeEventListener('abort', onAbort);
        };
        signal?.addEventListener('abort', onAbort, { once: true });

        worker.onmessage = (e: MessageEvent<{ buffer?: ArrayBuffer; error?: string; errorCode?: UnsupportedMediaCode }>) => {
          if (settled) return;
          settled = true;
          cleanup();
          worker.terminate();
          if (e.data.error) {
            if (e.data.errorCode) {
              reject(new UnsupportedMediaFormatError(e.data.errorCode, e.data.error));
            } else {
              reject(new Error(e.data.error));
            }
          } else if (e.data.buffer) {
            resolve(new Uint8Array(e.data.buffer));
          } else {
            reject(new Error('Media worker returned an empty response.'));
          }
        };
        worker.onerror = err => {
          if (settled) return;
          settled = true;
          cleanup();
          worker.terminate();
          reject(err);
        };
        worker.postMessage({ buffer, mimeType, originalName }, [buffer]);
      } catch {
        const bytes = new Uint8Array(buffer);
        try {
          resolve(sanitizeMp4InPlaceZeroCopy(bytes));
        } finally {
          bytes.fill(0);
        }
      }
    });
  }

  const bytes = new Uint8Array(buffer);
  try {
    return sanitizeMp4InPlaceZeroCopy(bytes);
  } finally {
    bytes.fill(0);
  }
}

export async function sanitizeMedia(
  file: File | Blob,
  options: MediaSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  const signal = options.signal;
  if (signal?.aborted) throw createAbortError(signal.reason);

  const fileName = file instanceof File ? file.name : '';
  const fileMime = (file.type || '').toLowerCase();

  if (isImageMimeType(fileMime, fileName)) {
    throw new UnsupportedMediaFormatError(
      'IMAGE_IN_MEDIA_PIPELINE',
      'Image payload rejected from media pipeline: MIME="' + fileMime + '" name="' + fileName + '". Image assets must route exclusively through canvas re-synthesis.'
    );
  }
  if (isStandaloneAudioFormat(fileMime, fileName)) {
    throw new UnsupportedMediaFormatError(
      'AUDIO_UNSUPPORTED',
      'Standalone audio format rejected: MIME="' + fileMime + '" name="' + fileName + '". Standalone audio is not supported; only images and MP4/MOV videos are accepted.'
    );
  }

  if (isMkvOrWebm(fileMime, fileName)) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      'MKV/WebM container rejected: MIME="' + fileMime + '" name="' + fileName + '". Only MP4 and MOV container metadata sanitization is supported.'
    );
  }
  if (file.size > MAX_MEDIA_FILE_BYTES) {
    throw new MediaFileSizeLimitError(file.size, MAX_MEDIA_FILE_BYTES);
  }

  const headerBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (isMkvOrWebm(fileMime, fileName, headerBytes)) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      'MKV/WebM container rejected: MIME="' + fileMime + '" name="' + fileName + '". Only MP4 and MOV container metadata sanitization is supported.'
    );
  }
  if (!isMp4OrMov(headerBytes)) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      'Unsupported video container: MIME="' + fileMime + '" name="' + fileName + '". Only valid ISOBMFF MP4 and QuickTime MOV files are supported.'
    );
  }

  onProgress?.(15);
  const originalName = file instanceof File ? file.name : 'unnamed_video';
  const auditBefore = await analyzeForensics(file, originalName);
  if (signal?.aborted) throw createAbortError(signal.reason);
  onProgress?.(35);

  const effectiveMime =
    fileMime === 'video/quicktime' || /\.mov$/i.test(fileName)
      ? 'video/quicktime'
      : 'video/mp4';

  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw createAbortError(signal.reason);

  let cleanBytes: Uint8Array | null = null;
  try {
    cleanBytes = await sanitizeMediaWithWorker(arrayBuffer, effectiveMime, originalName, signal);
    if (signal?.aborted) throw createAbortError(signal.reason);
    onProgress?.(75);

    const finalized = await finalizeSanitizedOutput(cleanBytes, effectiveMime);
    if (signal?.aborted) throw createAbortError(signal.reason);
    onProgress?.(100);

    return {
      blob: finalized.blob,
      originalName,
      sanitizedName: finalized.sanitizedName,
      originalSize: file.size,
      sanitizedSize: finalized.sanitizedSize,
      format: finalized.format,
      sha256: finalized.sha256,
      defenseLevel: options.defenseLevel,
      auditBefore,
      auditAfter: finalized.auditAfter,
      processedAt: Date.now(),
    };
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw err;
  } finally {
    if (cleanBytes) {
      cleanBytes.fill(0);
    }
  }
}
