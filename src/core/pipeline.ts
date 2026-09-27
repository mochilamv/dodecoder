import { DefenseLevel, OutputFormat, SanitizedResult } from './types';
import { sanitizeImage } from './image/image-sanitizer';
import { sanitizeMedia } from './media/media-sanitizer';

export interface PipelineOptions {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality?: number;
}

/**
 * Unified Anti-Forensic Processing Pipeline
 * Intelligently routes media to the appropriate reconstructive sanitizer.
 */
export async function processMediaFile(
  file: File,
  options: PipelineOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(name);
  const isVideoOrAudio = mime.startsWith('video/') || mime.startsWith('audio/') || /\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(name);

  if (isImage) {
    return await sanitizeImage(file, {
      defenseLevel: options.defenseLevel,
      outputFormat: options.outputFormat,
      quality: options.quality ?? 0.92,
    }, onProgress);
  }

  if (isVideoOrAudio) {
    return await sanitizeMedia(file, {
      defenseLevel: options.defenseLevel,
    }, onProgress);
  }

  // Generic fallback: treat as image if decodable, or pass-through
  try {
    return await sanitizeImage(file, {
      defenseLevel: options.defenseLevel,
      outputFormat: options.outputFormat,
      quality: options.quality ?? 0.92,
    }, onProgress);
  } catch {
    return await sanitizeMedia(file, {
      defenseLevel: options.defenseLevel,
    }, onProgress);
  }
}
