import { DefenseLevel, OutputFormat, SanitizedResult } from './types';
import { sanitizeImage } from './image/image-sanitizer';
import { sanitizeMedia } from './media/media-sanitizer';

export interface PipelineOptions {
  defenseLevel?: DefenseLevel;
  outputFormat?: OutputFormat;
  quality?: number;
  extremeSanitization?: boolean;
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
  const extremeSanitization = true;

  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(name);
  const isVideoOrAudio = mime.startsWith('video/') || mime.startsWith('audio/') || /\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(name);

  if (isImage) {
    const isLossless = mime === 'image/png' || name.toLowerCase().endsWith('.png');
    const outputFormat = isLossless ? 'image/png' : 'image/webp';
    return await sanitizeImage(file, {
      defenseLevel,
      outputFormat,
      quality: isLossless ? undefined : quality,
      extremeSanitization,
    }, onProgress);
  }

  if (isVideoOrAudio) {
    return await sanitizeMedia(file, {
      defenseLevel,
    }, onProgress);
  }

  // No fallback: unrecognized file types are strictly rejected
  throw new Error(
    `Unsupported file type: MIME="${mime}" name="${name}". ` +
    'Only image (JPEG, PNG, WebP, BMP, TIFF, GIF) and media (MP4, MOV, MKV, WebM, MP3, WAV, OGG, AAC, M4A) formats are accepted.'
  );
}
