/**
 * Cryptographic Hashing and Name Sanitization
 * Eliminates temporal, camera sequential, and OS filesystem attribution.
 */

/**
 * Computes SHA-256 hash of an ArrayBuffer or Uint8Array.
 */
export async function computeSha256(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const data = buffer instanceof Uint8Array ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) : buffer;
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an anti-forensic sanitized filename based on the SHA-256 of the cleaned payload.
 *
 * @param buffer Sanitized file byte content
 * @param extension Target extension (e.g. 'webp', 'jpeg', 'mp4')
 * @param chars Number of hash characters to use (default: 16)
 */
export async function generateHashedName(
  buffer: ArrayBuffer | Uint8Array,
  extension: string,
  chars: number = 16
): Promise<string> {
  const hash = await computeSha256(buffer);
  const cleanExt = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin';
  return `${hash.slice(0, chars)}.${cleanExt}`;
}

/**
 * Generates a CSPRNG-randomized filename using window.crypto.getRandomValues
 */
export function generateRandomName(extension: string, bytes: number = 8): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  const cleanExt = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin';
  return `${hex}.${cleanExt}`;
}
