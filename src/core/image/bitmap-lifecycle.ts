/**
 * Scoped ImageBitmap ownership helper ensuring deterministic close() on
 * every exit path (success, throw, early return, abort) without double-closing
 * or closing transferred/still-referenced bitmaps.
 */

export interface ManagedBitmapHandle {
  readonly bitmap: ImageBitmap;
  /**
   * Relinquishes automatic close() ownership when the bitmap is transferred
   * (e.g. via postMessage transfer list) or retained by the caller.
   */
  releaseOwnership(): ImageBitmap;
}

export function createAbortError(reason?: unknown): Error {
  if (reason instanceof Error && reason.name === 'AbortError') {
    return reason;
  }
  const err = new Error(
    typeof reason === 'string' && reason.length > 0 ? reason : 'Image processing aborted'
  );
  err.name = 'AbortError';
  return err;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError';
}

export async function withManagedImageBitmap<T>(
  factory: () => Promise<ImageBitmap>,
  use: (handle: ManagedBitmapHandle) => Promise<T> | T,
  signal?: AbortSignal
): Promise<T> {
  if (signal?.aborted) {
    throw createAbortError(signal.reason);
  }

  const bitmap = await factory();
  let owned = true;
  let closed = false;

  const handle: ManagedBitmapHandle = {
    bitmap,
    releaseOwnership(): ImageBitmap {
      owned = false;
      return bitmap;
    },
  };

  try {
    if (signal?.aborted) {
      throw createAbortError(signal.reason);
    }
    return await use(handle);
  } finally {
    if (owned && !closed) {
      closed = true;
      bitmap.close();
    }
  }
}
