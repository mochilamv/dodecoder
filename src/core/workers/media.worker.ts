import {
  sanitizeMp4InPlaceZeroCopy,
  isMp4OrMov,
  isMkvOrWebm,
  isStandaloneAudioFormat,
  isImageMimeType,
  UnsupportedMediaFormatError,
} from '../media/media-sanitizer';

export interface MediaWorkerJobInput {
  buffer: ArrayBuffer;
  mimeType: string;
  originalName: string;
}

export interface MediaWorkerJobResult {
  buffer: ArrayBuffer;
  mimeType: string;
  originalName: string;
}

/**
 * Extracts a standalone ArrayBuffer covering strictly [byteOffset .. byteOffset + byteLength)
 * so transferred worker payloads never leak surrounding bytes from an oversized backing buffer.
 */
export function extractTransferableExactSlice(bytes: Uint8Array): ArrayBuffer {
  if (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
    return bytes.buffer as ArrayBuffer;
  }
  const exact = new Uint8Array(bytes.byteLength);
  exact.set(bytes);
  return exact.buffer;
}

export function processMediaWorkerJob(input: MediaWorkerJobInput): MediaWorkerJobResult {
  const { buffer, mimeType, originalName } = input;

  // Hard boundary: reject all image payloads from in-place manipulation
  if (isImageMimeType(mimeType, originalName)) {
    throw new UnsupportedMediaFormatError(
      'IMAGE_IN_MEDIA_PIPELINE',
      `Image payload rejected from media worker: MIME="${mimeType}" name="${originalName}". ` +
      'Image assets must route exclusively through canvas re-synthesis.'
    );
  }

  if (isStandaloneAudioFormat(mimeType, originalName)) {
    throw new UnsupportedMediaFormatError(
      'AUDIO_UNSUPPORTED',
      `Standalone audio payload rejected from media worker: MIME="${mimeType}" name="${originalName}".`
    );
  }

  const bytes = new Uint8Array(buffer);
  let cleanBytes: Uint8Array | null = null;
  try {
    if (isMkvOrWebm(mimeType, originalName, bytes)) {
      throw new UnsupportedMediaFormatError(
        'CONTAINER_UNSUPPORTED',
        `MKV/WebM container rejected from media worker: MIME="${mimeType}" name="${originalName}".`
      );
    }

    if (!isMp4OrMov(bytes)) {
      throw new UnsupportedMediaFormatError(
        'CONTAINER_UNSUPPORTED',
        `Unsupported media container rejected from media worker: MIME="${mimeType}" name="${originalName}".`
      );
    }

    cleanBytes = sanitizeMp4InPlaceZeroCopy(bytes);
    const resultBuffer = extractTransferableExactSlice(cleanBytes);
    if (cleanBytes.buffer !== resultBuffer) {
      cleanBytes.fill(0);
    }
    return { buffer: resultBuffer, mimeType, originalName };
  } finally {
    bytes.fill(0);
  }
}

if (typeof self !== 'undefined') {
  self.onmessage = (event: MessageEvent<MediaWorkerJobInput>) => {
    try {
      const result = processMediaWorkerJob(event.data);
      (self as any).postMessage(result, [result.buffer]);
    } catch (err: unknown) {
      if (err instanceof UnsupportedMediaFormatError) {
        (self as any).postMessage({ error: err.message, errorCode: err.code });
      } else {
        const message = err instanceof Error ? err.message : 'Media worker processing failed';
        (self as any).postMessage({ error: message });
      }
    }
  };
}
