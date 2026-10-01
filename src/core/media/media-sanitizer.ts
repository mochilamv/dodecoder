import { DefenseLevel, SanitizedResult } from '../types';
import { analyzeForensics } from '../forensic/exif-inspector';
import { generateSanitizedName } from '../forensic/hash-naming';
import { isWebCodecsSupported, resynthesizeMediaWebCodecs } from './webcodecs-resynthesizer';
import { createEphemeralOpfsSession } from './encrypted-stream';

export interface MediaSanitizerOptions {
  defenseLevel: DefenseLevel;
}

export function isImageMimeType(mimeType: string, name: string): boolean {
  return mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(name);
}

export const FOURCC_FTYP = 0x66747970;
export const FOURCC_MOOV = 0x6d6f6f76;
export const FOURCC_MVHD = 0x6d766864;
export const FOURCC_TKHD = 0x746b6864;
export const FOURCC_MDHD = 0x6d646864;
export const FOURCC_UDTA = 0x75647461;
export const FOURCC_META = 0x6d657461;
export const FOURCC_ILST = 0x696c7374;
export const FOURCC_UUID = 0x75756964;
export const FOURCC_MDAT = 0x6d646174;
export const FOURCC_FREE = 0x66726565; 

// Sub-boxes for tracking hdlr
export const FOURCC_TRAK = 0x7472616b;
export const FOURCC_MDIA = 0x6d646961;
export const FOURCC_MINF = 0x6d696e66;
export const FOURCC_STBL = 0x7374626c;
export const FOURCC_DINF = 0x64696e66;
export const FOURCC_HDLR = 0x68646c72;

export function isMp4OrMov(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = view.getUint32(4, false);
  return tag === FOURCC_FTYP || tag === FOURCC_MOOV;
}

export function isAudioFile(mimeType: string, name: string): boolean {
  return mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(name);
}

function sanitizeMdatInPlace(bytes: Uint8Array): void {
  const banner = new TextEncoder().encode('x264 - core');
  for (let i = 0; i <= bytes.length - banner.length; i++) {
    let match = true;
    for (let j = 0; j < banner.length; j++) {
      if (bytes[i + j] !== banner[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      for (let k = 0; k < 256 && i + k < bytes.length; k++) {
        bytes[i + k] = 0;
      }
    }
  }
}

export function sanitizeAudioHeadersZeroCopy(bytes: Uint8Array): Uint8Array {
  let startOffset = 0;
  let endOffset = bytes.length;

  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    startOffset = 10 + size;
  }

  if (bytes.length >= 128) {
    const tagIdx = bytes.length - 128;
    if (bytes[tagIdx] === 0x54 && bytes[tagIdx + 1] === 0x41 && bytes[tagIdx + 2] === 0x37) {
      endOffset = tagIdx;
    }
  }

  return bytes.subarray(startOffset, endOffset);
}

export async function sanitizeMediaWithWorker(
  buffer: ArrayBuffer,
  mimeType: string,
  originalName: string
): Promise<Uint8Array> {
  if (isImageMimeType(mimeType, originalName)) {
    throw new Error('Image payload rejected from media pipeline.');
  }

  if (typeof Worker !== 'undefined') {
    return new Promise<Uint8Array>((resolve, reject) => {
      try {
        const worker = new Worker(
          new URL('../workers/media.worker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = (e: MessageEvent<{ buffer: ArrayBuffer }>) => {
          const result = new Uint8Array(e.data.buffer);
          worker.terminate();
          resolve(result);
        };
        worker.onerror = err => { worker.terminate(); reject(err); };
        worker.postMessage({ buffer, mimeType, originalName }, [buffer]);
      } catch {
        const bytes = new Uint8Array(buffer);
        resolve(isMp4OrMov(bytes) ? sanitizeMp4InPlaceZeroCopy(bytes) : isAudioFile(mimeType, originalName) ? sanitizeAudioHeadersZeroCopy(bytes) : bytes);
      }
    });
  }

  const bytes = new Uint8Array(buffer);
  if (isMp4OrMov(bytes)) return sanitizeMp4InPlaceZeroCopy(bytes);
  else if (isAudioFile(mimeType, originalName)) return sanitizeAudioHeadersZeroCopy(bytes);
  return bytes;
}

export function sanitizeMp4InPlaceZeroCopy(input: Uint8Array): Uint8Array {
  const output = new Uint8Array(input.length);
  output.set(input);
  const view = new DataView(output.buffer, output.byteOffset, output.byteLength);
  sanitizeBoxListInPlace(output, view, 0, output.length);
  return output;
}

function sanitizeBoxListInPlace(bytes: Uint8Array, view: DataView, start: number, end: number): void {
  let offset = start;
  while (offset + 8 <= end) {
    const boxSize = view.getUint32(offset, false);
    const boxType = view.getUint32(offset + 4, false);
    let actualSize = boxSize;
    let headerSize = 8;

    if (boxSize === 0) actualSize = end - offset;
    else if (boxSize === 1) {
      if (offset + 16 > end) break;
      actualSize = Number(view.getBigUint64(offset + 8, false));
      headerSize = 16;
    }

    if (actualSize < headerSize || offset + actualSize > end) break;

    const isMetadata = boxType === FOURCC_UDTA || boxType === FOURCC_META || boxType === FOURCC_UUID || boxType === FOURCC_ILST;
    
    if (isMetadata) {
      view.setUint32(offset + 4, FOURCC_FREE, false);
      bytes.fill(0, offset + headerSize, offset + actualSize);
      offset += actualSize;
      continue;
    }

    if (boxType === FOURCC_TRAK) {
      const isAllowed = checkTrakHandlerAllowed(view, offset + headerSize, offset + actualSize);
      if (!isAllowed) {
        view.setUint32(offset + 4, FOURCC_FREE, false);
        bytes.fill(0, offset + headerSize, offset + actualSize);
        offset += actualSize;
        continue;
      }
    }

    const isContainer = boxType === FOURCC_MOOV || boxType === FOURCC_TRAK || boxType === FOURCC_MDIA || boxType === FOURCC_MINF || boxType === FOURCC_STBL || boxType === FOURCC_DINF;
    if (isContainer) {
      sanitizeBoxListInPlace(bytes, view, offset + headerSize, offset + actualSize);
    } else if (boxType === FOURCC_MDAT) {
      sanitizeMdatInPlace(bytes.subarray(offset + headerSize, offset + actualSize));
    } else if ((boxType === FOURCC_MVHD || boxType === FOURCC_TKHD || boxType === FOURCC_MDHD) && actualSize >= headerSize + 20) {
      const version = bytes[offset + headerSize];
      if (version === 0) {
        view.setUint32(offset + headerSize + 4, 0, false);
        view.setUint32(offset + headerSize + 8, 0, false);
      } else if (version === 1 && actualSize >= headerSize + 28) {
        view.setBigUint64(offset + headerSize + 4, 0n, false);
        view.setBigUint64(offset + headerSize + 12, 0n, false);
      }
    }
    offset += actualSize;
  }
}

function checkTrakHandlerAllowed(view: DataView, start: number, end: number): boolean {
  let mdiaStart = -1;
  let mdiaEnd = -1;

  let offset = start;
  while (offset + 8 <= end) {
    const bSize = view.getUint32(offset, false);
    const bType = view.getUint32(offset + 4, false);
    let actSize = bSize === 1 ? Number(view.getBigUint64(offset + 8, false)) : bSize;
    if (actSize === 0) actSize = end - offset;
    
    if (bType === FOURCC_MDIA) {
      mdiaStart = offset + (bSize === 1 ? 16 : 8);
      mdiaEnd = offset + actSize;
      break;
    }
    offset += actSize;
  }

  if (mdiaStart !== -1) {
    let o = mdiaStart;
    while (o + 8 <= mdiaEnd) {
      const bSize = view.getUint32(o, false);
      const bType = view.getUint32(o + 4, false);
      let actSize = bSize === 1 ? Number(view.getBigUint64(o + 8, false)) : bSize;
      if (actSize === 0) actSize = mdiaEnd - o;

      if (bType === FOURCC_HDLR && actSize >= 24) {
        const handlerSize = bSize === 1 ? 16 : 8;
        const hdlrType = view.getUint32(o + handlerSize + 8, false);
        if (hdlrType === 0x76696465 || hdlrType === 0x736f756e) {
          return true; // vide or soun
        }
        return false;
      }
      o += actSize;
    }
  }
  return false;
}

export async function sanitizeMedia(
  file: File | Blob,
  options: MediaSanitizerOptions,
  onProgress?: (percent: number) => void
): Promise<SanitizedResult> {
  const fileName = file instanceof File ? file.name : '';
  const fileMime = file.type || '';
  if (isImageMimeType(fileMime, fileName)) {
    throw new Error('Image payload rejected from media pipeline: MIME="' + fileMime + '" name="' + fileName + '". Image assets must route exclusively through canvas re-synthesis.');
  }

  onProgress?.(15);
  const originalName = file instanceof File ? file.name : 'unnamed_media';
  const auditBefore = await analyzeForensics(file, originalName);
  onProgress?.(35);

  const ext = originalName.split('.').pop() || 'mp4';
  let cleanBlob: Blob;

  const headerBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const isMp4 = isMp4OrMov(headerBytes);


  let isOpfsEncrypted = false;
  let isWebcodecsUsed = false;

  if (isWebCodecsSupported()) {
    try {
      const res = await resynthesizeMediaWebCodecs(file, onProgress);
      cleanBlob = res.blob;
      isWebcodecsUsed = true;
    } catch {
      // Fallback to streaming/sanitizing
    }
  }

  // Try OPFS Streaming for MP4/MOV with Ephemeral AES-GCM encryption
  if (!isWebcodecsUsed && isMp4 && 'storage' in navigator && 'getDirectory' in navigator.storage) {
    const session = await createEphemeralOpfsSession();
    try {
      const root = await navigator.storage.getDirectory();
      const draftHandle = await root.getFileHandle(`temp_${Date.now()}.${ext}`, { create: true });
      const writable = await draftHandle.createWritable();

      const reader = file.stream().getReader();
      let pos = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sanitizeMdatInPlace(value);
        const encryptedPacket = await session.encryptChunk(value);
        await writable.write({ type: 'write', position: pos, data: encryptedPacket as any });
        pos += encryptedPacket.length;
      }
      await writable.close();
      isOpfsEncrypted = true;

      const opfsFile = await draftHandle.getFile();
      const finalWritable = await draftHandle.createWritable({ keepExistingData: true });

      let offset = 0;
      const totalSize = opfsFile.size;

      while (offset + 8 <= totalSize) {
        const headerBuf = await opfsFile.slice(offset, offset + 16).arrayBuffer();
        const headerView = new DataView(headerBuf);
        const boxSize = headerView.getUint32(0, false);
        const boxType = headerView.getUint32(4, false);
        let actSize = boxSize;
        let headerSize = 8;

        if (boxSize === 0) actSize = totalSize - offset;
        else if (boxSize === 1) {
          actSize = Number(headerView.getBigUint64(8, false));
          headerSize = 16;
        }

        if (actSize < headerSize || offset + actSize > totalSize) break;

        if (boxType === FOURCC_MOOV) {
          const moovBuf = await opfsFile.slice(offset, offset + actSize).arrayBuffer();
          const moovBytes = new Uint8Array(moovBuf);
          const moovView = new DataView(moovBytes.buffer);
          sanitizeBoxListInPlace(moovBytes, moovView, headerSize, actSize);
          await finalWritable.write({ type: 'write', position: offset, data: moovBytes });
        }
        offset += actSize;
      }

      await finalWritable.close();
      const finalOpfsFile = await draftHandle.getFile();
      cleanBlob = finalOpfsFile;
    } catch (err) {
      console.warn('OPFS failed, falling back to memory', err);
      const arrayBuffer = await file.arrayBuffer();
      const cleanBytes = await sanitizeMediaWithWorker(arrayBuffer, fileMime, originalName);
      cleanBlob = new Blob([cleanBytes as any], { type: fileMime || 'video/mp4' });
    } finally {
      session.zeroize();
    }
  } else if (!isWebcodecsUsed) {
    const arrayBuffer = await file.arrayBuffer();
    const cleanBytes = await sanitizeMediaWithWorker(arrayBuffer, fileMime, originalName);
    cleanBlob = new Blob([cleanBytes as any], { type: fileMime || 'video/mp4' });
  }

  onProgress?.(75);

  const sanitizedName = await generateSanitizedName(new Uint8Array(await cleanBlob!.slice(0, 1024).arrayBuffer()), ext);
  onProgress?.(90);

  const auditAfter = await analyzeForensics(cleanBlob!, sanitizedName);
  onProgress?.(100);

  return {
    blob: cleanBlob!,
    originalBlob: file,
    originalName,
    sanitizedName,
    originalSize: file.size,
    sanitizedSize: cleanBlob!.size,
    format: fileMime,
    sha256: auditAfter.sha256,
    defenseLevel: options.defenseLevel,
    auditBefore,
    auditAfter,
    processedAt: Date.now(),
    enfFiltered: true,
    webcodecsResynthesized: isWebcodecsUsed,
    opfsEncrypted: isOpfsEncrypted
  };
}
