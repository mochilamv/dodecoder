# Dodecoder

Pure TypeScript, zero-WebAssembly client-side anti-forensics engine. Primary focus is pixel-level image decontamination and sensor fingerprint disruption in browser memory; secondary scope is honest, in-memory MP4/MOV container metadata scrubbing without bitstream re-encoding.

## 1. Scope and Threat Model

Dodecoder executes strictly client-side in pure TypeScript with zero runtime dependencies and zero WebAssembly binaries (`0 .wasm` artifacts in `src/` and `dist/`).

### Primary Priority: Images (Full Pixel Re-Synthesis)
Mitigates:
1. Metadata and Location: EXIF, GPS coordinates, serial numbers, timestamps, XMP, and ICC/display calibration profiles (`iCCP`, `cHRM`, `gAMA`, `APP2`, WebP `ICCP`).
2. Embedded Thumbnails: IFD1 preview buffers eliminated by full pixel decode and re-encode.
3. MakerNotes: Proprietary OEM binary structures eliminated by one-way raster reconstruction.
4. Sensor Silicon Noise (PRNU): Attenuated via Daubechies-4 DWT + 5x5 subband Wiener filtering and desynchronized via bicubic micro-affine transforms.
5. Steganography: Mitigated via spatial micro-resampling, 3x3 median filtering, forced YUV 4:2:0 chroma subsampling, CSPRNG visibility dithering, heteroscedastic CMOS noise, and alpha-channel anti-steganography.
6. Container Signatures: Emits strictly RFC 9649 WebP containers using a strict chunk whitelist with zero container padding and zero `JUNK` chunks.

### Secondary Scope: MP4 and MOV Video (Container Metadata Only)
Mitigates:
1. Container Metadata Atoms: Scrubs `udta`, `meta`, `ilst`, `uuid`, `cprt`, `XMP_`, `keys`, QuickTime `0xA9`-prefixed atoms, and residual payloads inside pre-existing `free`/`skip` boxes in-place with zero-filled `free` boxes of identical size.
2. Track and Handler Leaks: Removes non-`vide`/`soun` tracks (e.g., subtitle/text/telemetry tracks) via in-place `free` replacement and zeroes `hdlr.name`, `pre_defined`, and QuickTime `component_manufacturer` while keeping `handler_type` intact.
3. Container Timestamps: Zeroes `creation_time` and `modification_time` in `mvhd`, `tkhd`, and `mdhd` honoring FullBox version 0 (32-bit) and version 1 (64-bit) layouts without corrupting `timescale`, `track_ID`, or `duration`.
4. Explicit Non-Goals for Video: Dodecoder performs in-memory container metadata scrubbing only. It does NOT perform frame or bitstream re-encoding (no WebCodecs transcoding, no OPFS disk staging, and no `mdat` mutation), so H.264/H.265/AAC bitstreams and `stco`/`co64` chunk offsets remain playable, while bitstream-level encoder SEI payloads remain unchanged.

### Explicitly Unsupported Formats
- Standalone Audio: Permanently removed. MP3, WAV, OGG, FLAC, AAC, and M4A inputs are explicitly rejected at the pipeline boundary (`UnsupportedMediaFormatError` with code `AUDIO_UNSUPPORTED`). No ENF filtering or ID3 stripping is performed.
- MKV and WebM Containers: Explicitly rejected at the pipeline boundary (`UnsupportedMediaFormatError` with code `CONTAINER_UNSUPPORTED`).

## 2. Architecture and Pipeline

### Image Sanitization Pipeline (`src/core/image/`, `src/core/workers/image.worker.ts`)
- Pre-Decode Decompression-Bomb Guard (`src/core/image/image-header-guard.ts`): Pure header dimension parser supporting JPEG, PNG, WebP (VP8, VP8L, VP8X), GIF, BMP, and TIFF. Enforces `MAX_IMAGE_DIMENSION = 16384` and `MAX_IMAGE_PIXELS = 64_000_000` with a strict fail-closed policy on invalid or unrecognized headers before `createImageBitmap` is ever invoked.
- Single-Pass Worker Decode and 1920px Cap: Decodes once inside `withManagedImageBitmap` (`src/core/image/bitmap-lifecycle.ts`, guaranteeing deterministic `ImageBitmap.close()` on success, error, or abort), caps maximum edge to 1920px with `imageSmoothingQuality = 'high'`, and processes directly on a single canvas without intermediate PNG round-trips or outer 2048px tile loops. Animated GIF/APNG/WebP inputs are flattened to a single static frame.
- PRNU Defense (`src/core/image/prnu-defense.ts`):
  1. 1-level Daubechies-4 (8-tap) 2D DWT with 5x5 subband adaptive Wiener filter (`ACTIVE_TILE_SIZE = 512`, `DWT_TILE_HALO = 16`, untouched source halo snapshot for multi-tile reads, calibrated `CALIBRATED_MAX_DELTA_LUMA = 8.0`).
  2. Bicubic Keys (`a = -0.5`) micro-affine desynchronization (rotation in +/- [0.1, 0.3] deg, anisotropic scale in [0.995, 0.999]) with premultiplied alpha handling and circular ring-buffer memory management.
- Deep Decontamination (`src/core/image/decontamination.ts`, `src/core/image/poisson-gaussian.ts`):
  1. Spatial micro-resampling (premultiplied alpha Catmull-Rom bicubic).
  2. 3x3 median filter (WebGL shader with explicit `UNPACK_FLIP_Y_WEBGL` and GPU resource cleanup, with deterministic CPU `median9` fallback).
  3. Forced YUV 4:2:0 chroma subsampling.
  4. CSPRNG visibility dithering (`crypto.getRandomValues`, <= 65536 B chunks).
  5. Heteroscedastic CMOS Poisson-Gaussian noise (`sigma^2 = 0.02 * I + 1.0`, preserving zero RGB under `alpha = 0`).
  6. Alpha anti-steganography (`sanitizeAlphaChannel`: `|delta alpha| <= 3`, snaps near-opaque `[252..255]` to `255` and drops alpha channel on opaque outputs, zeroes RGB under `alpha <= 3`).
- Native RFC 9649 WebP Encoding (`src/core/image/icc-sanitizer.ts`): Encodes via native canvas WebP (`WEBP_QUALITY = 0.6`, failing closed with `WEBP_ENCODE_UNSUPPORTED` rather than silently emitting PNG), then filters RIFF chunks through a strict whitelist (`VP8 `, `VP8L`, `ALPH`, `ANIM`, `ANMF`, reconstructed `VP8X` only when needed) with zero `JUNK` chunk and zero container padding.

### MP4/MOV Container Sanitization (`src/core/media/media-sanitizer.ts`, `src/core/workers/media.worker.ts`)
- Enforces an explicit 256 MiB (`268435456` bytes) in-memory ceiling before `arrayBuffer()` allocation (`MediaFileSizeLimitError`), runs strictly in-memory in a dedicated worker (with main-thread fallback), and transfers only the exact sanitized `Uint8Array` slice (`byteOffset === 0`, `byteLength === buffer.byteLength`), zeroizing intermediate buffers in `try/finally`.
- Validates ISOBMFF box bounds for `boxSize === 0` (to container EOF), `boxSize === 1` (64-bit `largesize >= 16`), and invalid `2 <= boxSize < 8` safely without throwing, recursing through both movie (`moov`/`trak`/`mdia`) and fragmented (`moof`/`traf`) containers.
- Leaves `mdat` untouched and replaces scrubbed metadata boxes and non-`vide`/`soun` tracks with exact-size zero-filled `free` boxes so `stco`/`co64` offsets remain valid for playback.

### Output Finalization, SHA-256 Naming, and PKZIP Export
- Authoritative Finalization (`src/core/forensic/finalize-output.ts`): `finalizeSanitizedOutput` snapshots the exact final delivered bytes and derives `sha256`, `sanitizedName` (`<first 32 hex chars of SHA-256>.<ext>`), `sanitizedSize`, `format`, and `auditAfter` over 100% of those bytes.
  - Images: Re-running the same image produces a distinct SHA-256 and filename on every run due to CSPRNG pixel perturbation (non-idempotent by design).
  - MP4/MOV: Re-running the same video produces an identical, deterministic SHA-256 and filename because container metadata scrubbing is deterministic and adds no random padding.
- Zero-Trace PKZIP Builder (`src/core/utils/zip-export.ts`): Pure DataView STORED archive writer enforcing MS-DOS attributes and static timestamps (`1980-01-01 00:00:00`, zero extra fields), deterministic cascading filename deduplication (`deduplicateZipEntryNames`) strictly before pre-allocation non-ZIP64 bounds validation (`assertZipFits`, strictly below `0xFFFF` entries and `0xFFFFFFFF` bytes), and buffer zeroization in `try/finally`.
- Security Hardening (`index.html`, `src/ui/`): DOM-API-only rendering (zero `innerHTML` interpolation of untrusted filenames, MIME types, or errors; Unicode BiDi/control stripping), `AbortController` queue cancellation and resource cleanup, hardened non-throwing EXIF/marker inspectors (`src/core/forensic/exif-inspector.ts`, `src/core/forensic/marker-parser.ts`), and strict meta CSP without `'unsafe-inline'`, `'unsafe-eval'`, `'wasm-unsafe-eval'`, or wildcard `img-src *`/`media-src *`.

## 3. Supported Formats

- Images (primary): JPEG, PNG, WebP, BMP, TIFF, GIF (static frame output as RFC 9649 WebP).
- Video (secondary, container metadata only): MP4, MOV.
- Rejected explicitly: MKV, WebM, MP3, WAV, OGG, FLAC, AAC, M4A, and unrecognized file types.

## 4. Development, Build, and Local CSP Verification

### Requirements
- Node.js 20 or higher
- npm 10 or higher

### Commands
```bash
# Install devDependencies
npm install

# Run automated Node test suite
npm test

# Type-check strictly without emitting files
npx tsc --noEmit

# Build production static bundle to ./dist
npm run build

# Preview production bundle locally (use this for CSP verification)
npm run preview

# Start Vite development server (HMR only)
npm run dev
```

### Local Browser CSP Verification Note
The meta Content-Security-Policy in `index.html` intentionally omits `'unsafe-inline'`, `'unsafe-eval'`, and `'wasm-unsafe-eval'`. Vite's development server (`npm run dev`) injects HMR client scripts that conflict with strict production CSP. Always verify browser runtime behavior and zero CSP console violations against the built output using `npm run build && npm run preview`.

## 5. Deployment

Static production assets are emitted to `./dist` and deployed via GitHub Actions on push to `main` (`.github/workflows/deploy.yml`).

## 6. License

MIT License. Copyright (c) 2026 Mochilamv & Antigravity (AI).
