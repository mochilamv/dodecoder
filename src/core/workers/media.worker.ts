import {
  sanitizeMp4InPlaceZeroCopy,
  sanitizeAudioHeadersZeroCopy,
  isMp4OrMov,
  isAudioFile,
  isImageMimeType,
} from '../media/media-sanitizer';

self.onmessage = (
  event: MessageEvent<{ buffer: ArrayBuffer; mimeType: string; originalName: string }>
) => {
  const { buffer, mimeType, originalName } = event.data;

  // Hard boundary: reject all image payloads from in-place manipulation
  if (isImageMimeType(mimeType, originalName)) {
    throw new Error(
      `Image payload rejected from media worker: MIME="${mimeType}" name="${originalName}". ` +
      'Image assets must route exclusively through canvas re-synthesis.'
    );
  }

  const bytes = new Uint8Array(buffer);

  let cleanBytes: Uint8Array;
  if (isMp4OrMov(bytes)) {
    cleanBytes = sanitizeMp4InPlaceZeroCopy(bytes);
  } else if (isAudioFile(mimeType, originalName)) {
    cleanBytes = sanitizeAudioHeadersZeroCopy(bytes);
  } else {
    cleanBytes = bytes;
  }

  // Zero-copy transfer of output buffer back to main thread
  const resultBuffer = cleanBytes.buffer;
  (self as any).postMessage(
    { buffer: resultBuffer, mimeType, originalName },
    [resultBuffer]
  );
};
