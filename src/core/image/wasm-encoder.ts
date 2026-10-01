let wasmInstance: WebAssembly.Instance | null = null;

export async function getWasmEncoder(): Promise<WebAssembly.Instance> {
  if (wasmInstance) return wasmInstance;

  let buffer: ArrayBuffer;
  const isNode = typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process?.versions?.node;

  if (isNode) {
    const fs = await import('node:fs' as string);
    const path = await import('node:path' as string);
    const wasmPath = path.resolve((globalThis as any).process.cwd(), 'src/core/wasm/deterministic_encoder.wasm');
    const nodeBuf = fs.readFileSync(wasmPath);
    buffer = nodeBuf.buffer.slice(nodeBuf.byteOffset, nodeBuf.byteOffset + nodeBuf.byteLength);
  } else {
    const wasmUrl = new URL('../wasm/deterministic_encoder.wasm', import.meta.url).href;
    const response = await fetch(wasmUrl);
    buffer = await response.arrayBuffer();
  }

  const { instance } = await WebAssembly.instantiate(buffer, {});
  wasmInstance = instance;
  return wasmInstance;
}

export async function encodeDeterministicWebp(
  rgba: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number
): Promise<Uint8Array> {
  const instance = await getWasmEncoder();
  const { wasm_alloc, wasm_free, encode_deterministic_webp, get_output_len, memory } =
    instance.exports as {
      wasm_alloc: (len: number) => number;
      wasm_free: (ptr: number, len: number) => void;
      encode_deterministic_webp: (w: number, h: number, ptr: number, len: number) => number;
      get_output_len: () => number;
      memory: WebAssembly.Memory;
    };

  const len = rgba.length;
  const inPtr = wasm_alloc(len);

  try {
    const memView = new Uint8Array(memory.buffer);
    memView.set(rgba, inPtr);

    const outPtr = encode_deterministic_webp(width, height, inPtr, len);
    const outLen = get_output_len();

    const result = new Uint8Array(outLen);
    result.set(new Uint8Array(memory.buffer, outPtr, outLen));
    return result;
  } finally {
    wasm_free(inPtr, len);
  }
}
