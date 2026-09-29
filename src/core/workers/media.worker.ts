import {
  sanitizeMp4InPlaceZeroCopy,
  sanitizeAudioHeadersZeroCopy,
  isMp4OrMov,
  isAudioFile,
} from '../media/media-sanitizer';

self.onmessage = (
  event: MessageEvent<{ buffer: ArrayBuffer; mimeType: string; originalName: string }>
) => {
  const { buffer, mimeType, originalName } = event.data;
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
