import { ForensicReport } from '../types';
import { analyzeForensics } from './exif-inspector';
import { computeSha256, sanitizeExtension } from './hash-naming';

export interface FinalizedOutput {
  readonly blob: Blob;
  readonly format: string;
  readonly sha256: string;
  readonly sanitizedName: string;
  readonly sanitizedSize: number;
  readonly auditAfter: ForensicReport;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/aac': 'aac',
  'audio/mp4': 'm4a',
};

function detectDeliveredContainer(
  bytes: Uint8Array,
  declaredMime?: string
): { mime: string; ext: string } {
  const normalizedDeclared = (declaredMime || '').toLowerCase().split(';')[0].trim();

  // Inspect actual delivered container magic bytes first so container-changing
  // pipelines (e.g. PNG in -> WebP out) always reflect the output artifact.
  if (bytes.byteLength >= 12) {
    const b0 = bytes[0], b1 = bytes[1], b2 = bytes[2], b3 = bytes[3];
    const b8 = bytes[8], b9 = bytes[9], b10 = bytes[10], b11 = bytes[11];

    // RIFF .... WEBP
    if (
      b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46 &&
      b8 === 0x57 && b9 === 0x45 && b10 === 0x42 && b11 === 0x50
    ) {
      return { mime: 'image/webp', ext: 'webp' };
    }

    // RIFF .... WAVE
    if (
      b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46 &&
      b8 === 0x57 && b9 === 0x41 && b10 === 0x56 && b11 === 0x45
    ) {
      return { mime: 'audio/wav', ext: 'wav' };
    }

    // ISOBMFF .... ftyp
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
      if (normalizedDeclared === 'video/quicktime') {
        return { mime: 'video/quicktime', ext: 'mov' };
      }
      if (normalizedDeclared === 'audio/mp4') {
        return { mime: 'audio/mp4', ext: 'm4a' };
      }
      return { mime: 'video/mp4', ext: 'mp4' };
    }
  }

  // PNG signature
  if (
    bytes.byteLength >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }

  // JPEG SOI
  if (bytes.byteLength >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  if (normalizedDeclared && normalizedDeclared in MIME_TO_EXT) {
    return { mime: normalizedDeclared, ext: MIME_TO_EXT[normalizedDeclared] };
  }

  const fallbackMime = normalizedDeclared || 'application/octet-stream';
  const subType = normalizedDeclared.includes('/') ? normalizedDeclared.split('/')[1] : 'bin';
  return { mime: fallbackMime, ext: sanitizeExtension(subType || 'bin') };
}

/**
 * Single authoritative output finalization step (AUD-16).
 * Snapshots the exact delivered byte view (honoring non-zero byteOffset and
 * isolating against post-finalize caller mutation), then derives sha256,
 * sanitizedName, sanitizedSize, format, and auditAfter strictly from that
 * immutable delivered byte snapshot.
 */
export async function finalizeSanitizedOutput(
  delivered: Uint8Array | Blob,
  declaredMime?: string
): Promise<FinalizedOutput> {
  let snapshot: Uint8Array<ArrayBuffer>;
  let fallbackMime = declaredMime;

  if (delivered instanceof Uint8Array) {
    // Copy strictly [byteOffset .. byteOffset + byteLength) so non-zero views
    // never hash surrounding view.buffer bytes and later caller mutations cannot drift.
    snapshot = new Uint8Array(delivered.byteLength);
    snapshot.set(delivered);
  } else {
    fallbackMime = declaredMime || delivered.type;
    snapshot = new Uint8Array(await delivered.arrayBuffer());
  }

  const { mime, ext } = detectDeliveredContainer(snapshot, fallbackMime);
  const finalBlob = new Blob([snapshot], { type: mime });
  const sha256 = await computeSha256(snapshot);
  const sanitizedName = `${sha256.slice(0, 32)}.${sanitizeExtension(ext)}`;
  const sanitizedSize = snapshot.byteLength;
  const auditAfter = await analyzeForensics(finalBlob, sanitizedName);

  if (
    finalBlob.size !== sanitizedSize ||
    auditAfter.sha256 !== sha256 ||
    auditAfter.fileSize !== sanitizedSize ||
    auditAfter.fileName !== sanitizedName ||
    auditAfter.mimeType !== mime
  ) {
    throw new Error('Finalization invariant violated: output metadata diverged from delivered bytes');
  }

  Object.freeze(auditAfter);
  return Object.freeze({
    blob: finalBlob,
    format: mime,
    sha256,
    sanitizedName,
    sanitizedSize,
    auditAfter,
  });
}
