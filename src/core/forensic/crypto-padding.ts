const HEADER_SIZE = 8;
const MIN_ALLOCATION_FLOOR = 16;
const RNG_MAX = 65536;

export function computeDynamicPaddedSize(
  payloadSize: number,
  minHeader: number = HEADER_SIZE
): number {
  if (
    !Number.isFinite(payloadSize) ||
    payloadSize <= 0 ||
    payloadSize > Number.MAX_SAFE_INTEGER
  ) {
    throw new Error('Invalid payload size: must be a positive safe integer');
  }

  const minRequired = payloadSize + minHeader;

  if (minRequired <= MIN_ALLOCATION_FLOOR) {
    return MIN_ALLOCATION_FLOOR;
  }

  const exp = Math.floor(Math.log2(minRequired));
  const mantissaBits = Math.max(1, Math.floor(Math.log2(exp)));
  const step = Math.max(minHeader, 2 ** (exp - mantissaBits));

  let targetSize = Math.ceil(minRequired / step) * step;

  if (targetSize % 2 !== 0) {
    targetSize += 1;
  }

  if (
    !Number.isFinite(targetSize) ||
    targetSize < minRequired ||
    targetSize > Number.MAX_SAFE_INTEGER
  ) {
    throw new Error('Padded size overflow or invariant violation');
  }

  return targetSize;
}

export async function applyCryptographicPadding(blob: Blob, type: string, allowSimpleWebp: boolean = false): Promise<Blob> {
  if (blob.size > Number.MAX_SAFE_INTEGER) throw new Error('Blob too large');

  const newTarget = computeDynamicPaddedSize(blob.size, HEADER_SIZE);
  const finalPad = newTarget - blob.size;
  const finalPayloadSize = finalPad - HEADER_SIZE;

  const headerBuf = await blob.slice(0, 12).arrayBuffer();
  if (headerBuf.byteLength < 12) throw new Error('Blob too small to parse');
  const dv = new DataView(headerBuf);

  const isMp4 = type === 'video/mp4' || type === 'video/quicktime';
  const isRiff = type === 'image/webp' || type === 'audio/wav';

  if (!isMp4 && !isRiff) throw new Error('Unsupported type for padding');

  if (isMp4) {
    const ftyp = String.fromCharCode(dv.getUint8(4), dv.getUint8(5), dv.getUint8(6), dv.getUint8(7));
    if (ftyp !== 'ftyp') throw new Error('Invalid ISOBMFF ftyp');
  } else if (isRiff) {
    const riff = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (riff !== 'RIFF') throw new Error('Invalid RIFF header');
    const expectedSize = dv.getUint32(4, true) + 8;
    if (blob.size % 2 !== 0) throw new Error('RIFF size must be even');
    if (blob.size !== expectedSize && !allowSimpleWebp) throw new Error('RIFF size mismatch');
  }

  const payloadBox = new Uint8Array(finalPad);
  const boxDv = new DataView(payloadBox.buffer);

  if (isMp4) {
    boxDv.setUint32(0, finalPad, false);
    payloadBox[4] = 0x66; // f
    payloadBox[5] = 0x72; // r
    payloadBox[6] = 0x65; // e
    payloadBox[7] = 0x65; // e
  } else if (isRiff) {
    payloadBox[0] = 0x4A; // J
    payloadBox[1] = 0x55; // U
    payloadBox[2] = 0x4E; // N
    payloadBox[3] = 0x4B; // K
    boxDv.setUint32(4, finalPayloadSize, true);
  }

  let offset = HEADER_SIZE;
  while (offset < finalPad) {
    const writeSize = Math.min(RNG_MAX, finalPad - offset);
    crypto.getRandomValues(new Uint8Array(payloadBox.buffer, offset, writeSize));
    offset += writeSize;
  }

  let parts: BlobPart[] = [blob, payloadBox];

  if (isRiff) {
    const originalSize = blob.size;
    const newFileSize = originalSize + finalPad;
    const newRiffHeader = new Uint8Array(headerBuf.slice(0));
    const riffDv = new DataView(newRiffHeader.buffer);
    riffDv.setUint32(4, newFileSize - 8, true);
    parts = [newRiffHeader, blob.slice(12), payloadBox];
  }

  const paddedBlob = new Blob(parts, { type });

  if (paddedBlob.size !== newTarget) throw new Error('Postcondition failed: size mismatch');
  if (paddedBlob.type !== type) throw new Error('Postcondition failed: type mismatch');

  return paddedBlob;
}
