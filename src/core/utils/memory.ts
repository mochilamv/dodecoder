/**
 * Memory Safety and Anti-Residual Footprint Utilities
 */

/**
 * Overwrites sensitive Uint8Array buffers with zeros before garbage collection.
 */
export function wipeBuffer(buffer: Uint8Array | ArrayBuffer): void {
  try {
    if (buffer instanceof Uint8Array) {
      buffer.fill(0);
    } else {
      const view = new Uint8Array(buffer);
      view.fill(0);
    }
  } catch {
    // ArrayBuffer may be detached or non-resizable
  }
}

/**
 * Safely releases object URLs
 */
export function revokeUrls(urls: string[]): void {
  for (const url of urls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  }
}

/**
 * Zeroes out canvas dimensions to signal GPU/raster memory release
 */
export function releaseCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): void {
  try {
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    // Ignore
  }
}
