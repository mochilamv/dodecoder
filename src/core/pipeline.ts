import { DefenseLevel, OutputFormat, SanitizedResult } from './types';
import { sanitizeImage } from './image/image-sanitizer';
import { sanitizeMedia } from './media/media-sanitizer';
import { applyCryptographicPadding } from './forensic/crypto-padding';
import { finalizeSanitizedOutput } from './forensic/finalize-output';
import { createAbortError } from './image/bitmap-lifecycle';

export { finalizeSanitizedOutput } from './forensic/finalize-output';

export interface PipelineOptions {
  defenseLevel?: DefenseLevel;
  outputFormat?: OutputFormat;
  quality?: number;
  signal?: AbortSignal;
}

/**
 * Unified Anti-Forensic Processing Pipeline
 * Enforces maximum reconstructive sanitization by default.
 */
export async function processMediaFile(
  file: File,
  options: PipelineOptions = {},
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  // Always enforce maximum protection
  const defenseLevel: DefenseLevel = options.defenseLevel || 'paranoid';
  const quality = options.quality ?? 0.85;

  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(name);
  const isVideoOrAudio = mime.startsWith('video/') || mime.startsWith('audio/') || /\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(name);

  if (options.signal?.aborted) {
    throw createAbortError(options.signal.reason);
  }

  if (isImage) {
    const isLossless = mime === 'image/png' || name.toLowerCase().endsWith('.png');
    const outputFormat = isLossless ? 'image/png' : 'image/webp';
    const sanitized = await sanitizeImage(file, {
      defenseLevel,
      outputFormat,
      quality: isLossless ? undefined : quality,
      signal: options.signal,
    }, onProgress);
    if (options.signal?.aborted) {
      throw createAbortError(options.signal.reason);
    }
    const paddedBlob = await applyCryptographicPadding(sanitized.blob, sanitized.blob.type, true);
    if (options.signal?.aborted) {
      throw createAbortError(options.signal.reason);
    }
    const finalized = await finalizeSanitizedOutput(paddedBlob, paddedBlob.type);
    if (options.signal?.aborted) {
      throw createAbortError(options.signal.reason);
    }
    if (finalized.sha256 === sanitized.auditBefore.sha256) {
      throw new Error('Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input');
    }
    return {
      ...sanitized,
      blob: finalized.blob,
      sanitizedName: finalized.sanitizedName,
      sanitizedSize: finalized.sanitizedSize,
      format: finalized.format,
      sha256: finalized.sha256,
      auditAfter: finalized.auditAfter,
    };
  }

  if (isVideoOrAudio) {
    const sanitized = await sanitizeMedia(file, {
      defenseLevel,
    }, onProgress);
    const paddedBlob = await applyCryptographicPadding(sanitized.blob, sanitized.blob.type);
    const finalized = await finalizeSanitizedOutput(paddedBlob, paddedBlob.type);
    return {
      ...sanitized,
      blob: finalized.blob,
      sanitizedName: finalized.sanitizedName,
      sanitizedSize: finalized.sanitizedSize,
      format: finalized.format,
      sha256: finalized.sha256,
      auditAfter: finalized.auditAfter,
    };
  }

  // No fallback: unrecognized file types are strictly rejected
  throw new Error(
    `Unsupported file type: MIME="${mime}" name="${name}". ` +
    'Only image (JPEG, PNG, WebP, BMP, TIFF, GIF) and media (MP4, MOV, MKV, WebM, MP3, WAV, OGG, AAC, M4A) formats are accepted.'
  );
}
