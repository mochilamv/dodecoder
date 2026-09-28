/**
 * Cryptographic Hashing and Ephemeral Salting
 * Eliminates temporal, camera sequential, and OS filesystem attribution.
 * Implements CSPRNG Ephemeral Salting to prevent cross-device database correlation.
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
 * Strips chained extensions such as .jpg.webp or .png.webp, preserving only the final extension.
 */
export function sanitizeExtension(extension: string): string {
  const match = extension.match(/\.([a-zA-Z0-9]+)$/);
  const raw = match ? match[1] : extension;
  return raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'webp';
}

/**
 * Generates an anti-forensic sanitized filename using CSPRNG ephemeral salting.
 *
 * @param buffer Sanitized file byte content
 * @param extension Target extension, e.g. 'webp', 'jpeg', 'mp4'
 * @param chars Number of hash characters to use, default 32 for 128 bits of entropy
 */
export async function generateEphemeralSaltedName(
  buffer: ArrayBuffer | Uint8Array,
  extension: string,
  chars: number = 32
): Promise<string> {
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  // Allocate 32 bytes (256 bits) for CSPRNG salt
  const salt = new Uint8Array(32);
  crypto.getRandomValues(salt);

  // Allocate combined buffer
  const combined = new Uint8Array(salt.length + data.length);
  combined.set(salt, 0);
  combined.set(data, salt.length);

  // Compute SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Explicitly wipe the salt and the combined memory to prevent residual forensic extraction
  salt.fill(0);
  combined.fill(0);

  const cleanExt = sanitizeExtension(extension);
  const cleanHash = hexHash.slice(0, chars);
  return `${cleanHash}.${cleanExt}`;
}

/**
 * Generates a deterministic sanitized filename based on direct 128-bit SHA-256 hash.
 */
export async function generateDeterministicHashName(
  buffer: ArrayBuffer | Uint8Array,
  extension: string,
  chars: number = 32
): Promise<string> {
  const sha256Hex = await computeSha256(buffer);
  const cleanHash = sha256Hex.slice(0, chars);
  const cleanExt = sanitizeExtension(extension);
  return `${cleanHash}.${cleanExt}`;
}

/**
 * Generates a CSPRNG-randomized filename using window.crypto.getRandomValues
 */
export function generateRandomName(extension: string, bytes: number = 8): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  const cleanExt = sanitizeExtension(extension);
  return `${hex}.${cleanExt}`;
}
