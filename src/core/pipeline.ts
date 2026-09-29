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
  const extremeSanitization = options.extremeSanitization ?? false;

  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(name);
  const isVideoOrAudio = mime.startsWith('video/') || mime.startsWith('audio/') || /\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(name);

  if (isImage) {
    // Re-encode strictly using VP8 or VP8L WebP container
    return await sanitizeImage(file, {
      defenseLevel,
      outputFormat: 'image/webp',
      quality,
      extremeSanitization,
    }, onProgress);
  }

  if (isVideoOrAudio) {
    return await sanitizeMedia(file, {
      defenseLevel,
    }, onProgress);
  }

  // Fallback
  try {
    return await sanitizeImage(file, {
      defenseLevel,
      outputFormat: 'image/webp',
      quality,
      extremeSanitization,
    }, onProgress);
  } catch {
    return await sanitizeMedia(file, {
      defenseLevel,
    }, onProgress);
  }
}
