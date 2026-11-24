import { DefenseLevel, SanitizedResult } from './types';
import { sanitizeImage } from './image/image-sanitizer';
import {
  sanitizeMedia,
  isStandaloneAudioFormat,
  isMkvOrWebm,
  UnsupportedMediaFormatError,
} from './media/media-sanitizer';
import { createAbortError } from './image/bitmap-lifecycle';

export { finalizeSanitizedOutput } from './forensic/finalize-output';

export interface PipelineOptions {
  defenseLevel?: DefenseLevel;
  signal?: AbortSignal;
}

/**
 * Unified Anti-Forensic Processing Pipeline
 * Primary priority: full pixel-level image anti-forensics (pure TypeScript, WebP output).
 * Secondary scope: in-memory MP4/MOV container metadata sanitization without re-encoding.
 */
export async function processMediaFile(
  file: File,
  options: PipelineOptions = {},
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  const defenseLevel: DefenseLevel = options.defenseLevel || 'paranoid';

  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(name);
  if (isStandaloneAudioFormat(mime, name)) {
    throw new UnsupportedMediaFormatError(
      'AUDIO_UNSUPPORTED',
      `Standalone audio format is not supported: MIME="${mime}" name="${name}". Only images (JPEG, PNG, WebP, BMP, TIFF, GIF) and MP4/MOV videos are accepted.`
    );
  }

  if (isMkvOrWebm(mime, name)) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      `MKV/WebM video containers are not supported: MIME="${mime}" name="${name}". Only MP4 and MOV container metadata sanitization is supported.`
    );
  }

  const isSupportedVideo =
    mime === 'video/mp4' ||
    mime === 'video/quicktime' ||
    /\.(mp4|mov)$/i.test(name);

  if (!isSupportedVideo && mime.startsWith('video/')) {
    throw new UnsupportedMediaFormatError(
      'CONTAINER_UNSUPPORTED',
      `Unsupported video container: MIME="${mime}" name="${name}". Only MP4 and MOV container metadata sanitization is supported.`
    );
  }

  if (options.signal?.aborted) {
    throw createAbortError(options.signal.reason);
  }

  if (isImage) {
    const sanitized = await sanitizeImage(file, {
      defenseLevel,
      signal: options.signal,
    }, onProgress);
    if (options.signal?.aborted) {
      throw createAbortError(options.signal.reason);
    }
    if (sanitized.sha256 === sanitized.auditBefore.sha256) {
      throw new Error('Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input');
    }
    return sanitized;
  }

  if (isSupportedVideo) {
    return sanitizeMedia(file, {
      defenseLevel,
      signal: options.signal,
    }, onProgress);
  }

  // No fallback: unrecognized file types are strictly rejected
  throw new Error(
    `Unsupported file type: MIME="${mime}" name="${name}". ` +
    'Only image (JPEG, PNG, WebP, BMP, TIFF, GIF) and video (MP4, MOV) formats are accepted.'
  );
}
