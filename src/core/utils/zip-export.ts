import JSZip from 'jszip';
import { SanitizedResult } from '../types';
import { generateHashedName } from '../forensic/hash-naming';

/**
 * Normalizes all file timestamps inside a ZIP archive to MS-DOS Epoch (1980-01-01 00:00:00 UTC).
 * Prevents OS filesystem timestamps from leaking the batch processing or download time.
 */
export async function createSanitizedZipBundle(
  items: SanitizedResult[],
  onProgress?: (percent: number) => void
): Promise<{ zipBlob: Blob; zipFileName: string }> {
  const zip = new JSZip();
  // Fixed timestamp: Jan 1, 1980 00:00:00 UTC
  const fixedDate = new Date('1980-01-01T00:00:00.000Z');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const arrayBuffer = await item.blob.arrayBuffer();
    zip.file(item.sanitizedName, arrayBuffer, {
      date: fixedDate,
      comment: '',
    });
    onProgress?.(Math.round(((i + 1) / items.length) * 50));
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    metadata => {
      onProgress?.(50 + Math.round(metadata.percent / 2));
    }
  );

  const zipBuffer = await zipBlob.arrayBuffer();
  const zipFileName = await generateHashedName(zipBuffer, 'zip', 12);

  return {
    zipBlob,
    zipFileName: `bundle_${zipFileName}`,
  };
}

/**
 * Triggers a client-side ephemeral download without persisting history in application storage.
 */
export function triggerEphemeralDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke object URL after a short timeout to free RAM
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
