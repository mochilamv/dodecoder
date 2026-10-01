export interface EphemeralOpfsSession {
  key: CryptoKey;
  zeroize: () => void;
  encryptChunk: (chunk: Uint8Array) => Promise<Uint8Array>;
  decryptChunk: (encrypted: Uint8Array) => Promise<Uint8Array>;
  createEncryptStream: () => TransformStream<Uint8Array, Uint8Array>;
  createDecryptStream: () => TransformStream<Uint8Array, Uint8Array>;
}

export async function createEphemeralOpfsSession(): Promise<EphemeralOpfsSession> {
  const rawKey = new Uint8Array(32);
  crypto.getRandomValues(rawKey);

  let activeCryptoKey: CryptoKey | null = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  let isZeroized = false;

  const encryptChunk = async (chunk: Uint8Array): Promise<Uint8Array> => {
    if (isZeroized || !activeCryptoKey) {
      throw new Error('Ephemeral OPFS key session has been zeroized.');
    }
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      activeCryptoKey,
      chunk as Uint8Array<ArrayBuffer>
    );

    const cipherBytes = new Uint8Array(ciphertext);
    const packet = new Uint8Array(4 + 12 + cipherBytes.length);
    const view = new DataView(packet.buffer);
    view.setUint32(0, cipherBytes.length, false);
    packet.set(iv, 4);
    packet.set(cipherBytes, 16);
    return packet;
  };

  const decryptChunk = async (packet: Uint8Array): Promise<Uint8Array> => {
    if (isZeroized || !activeCryptoKey) {
      throw new Error('Ephemeral OPFS key session has been zeroized.');
    }
    if (packet.length < 16) {
      throw new Error('Corrupted encrypted packet.');
    }
    const view = new DataView(packet.buffer, packet.byteOffset, packet.byteLength);
    const cipherLen = view.getUint32(0, false);
    const iv = packet.subarray(4, 16);
    const ciphertext = packet.subarray(16, 16 + cipherLen);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any },
      activeCryptoKey,
      ciphertext as any
    );
    return new Uint8Array(decrypted);
  };

  const createEncryptStream = (): TransformStream<Uint8Array, Uint8Array> => {
    return new TransformStream({
      async transform(chunk, controller) {
        const encrypted = await encryptChunk(chunk);
        controller.enqueue(encrypted);
      }
    });
  };

  const createDecryptStream = (): TransformStream<Uint8Array, Uint8Array> => {
    let pending = new Uint8Array(0);

    return new TransformStream({
      async transform(chunk, controller) {
        const merged = new Uint8Array(pending.length + chunk.length);
        merged.set(pending, 0);
        merged.set(chunk, pending.length);
        pending = merged;

        while (pending.length >= 16) {
          const view = new DataView(pending.buffer, pending.byteOffset, pending.byteLength);
          const cipherLen = view.getUint32(0, false);
          const totalPacketLen = 4 + 12 + cipherLen;

          if (pending.length < totalPacketLen) break;

          const packet = pending.subarray(0, totalPacketLen);
          const decrypted = await decryptChunk(packet);
          controller.enqueue(decrypted);

          pending = pending.subarray(totalPacketLen);
        }
      }
    });
  };

  const zeroize = (): void => {
    rawKey.fill(0);
    activeCryptoKey = null;
    isZeroized = true;
  };

  return {
    get key() {
      if (isZeroized || !activeCryptoKey) throw new Error('Key zeroized');
      return activeCryptoKey;
    },
    zeroize,
    encryptChunk,
    decryptChunk,
    createEncryptStream,
    createDecryptStream
  };
}
