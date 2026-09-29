# Dodecoder — Client-Side Media Sanitization & Anti-Forensics

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Security: Zero-Server](https://img.shields.io/badge/Security-Zero--Server-10b981.svg)](#privacy--processing-guarantees)
[![Dependencies: 0 Runtime](https://img.shields.io/badge/Dependencies-0%20Runtime-black.svg)](#sanitization-architecture)
[![Platform: Static / GitHub Pages](https://img.shields.io/badge/Platform-Static%20%2F%20Pages-black.svg)](#development--deployment)

A client-side static web application for reconstructive media sanitization across images, video, and audio. Eliminates metadata, container fingerprints, and device sensor signatures directly in browser memory with zero backend, zero third-party runtime dependencies, zero analytics, and zero outbound network traffic.

Hosted on GitHub Pages: [mochilamv.github.io/dodecoder](https://mochilamv.github.io/dodecoder/)

---

## 1. Forensic Threat Model

Standard metadata strippers delete select tags while leaving underlying physical and algorithmic characteristics intact. Media files can be tracked through multiple forensic layers:

1. **Metadata & Location:** EXIF tags, GPS coordinates, camera serial numbers, and device timestamps.
2. **Embedded Thumbnails:** IFD1 previews retaining unedited content or GPS coordinates.
3. **Proprietary MakerNotes:** Binary blocks storing camera settings, firmware versions, and sensor temperatures.
4. **Sensor Silicon Noise:** Microscopic imperfections in camera silicon sensors leave a unique Photo Response Non-Uniformity pattern across images, enabling hardware identification. Rigid translations fail against cross-correlation algorithms.
5. **Container & Codec Signatures:** Distinct DQT and Huffman tables, encoder banners, and container atoms expose software pipelines and capture times.
6. **Cross-Correlation & File System Leaks:** Deterministic content hashes enable correlation across seized devices, while standard ZIP utilities inject host OS timestamps and permissions.
7. **Sub-Perceptual Steganography:** Game engines and proprietary software inject invisible UID watermarks and coordinate grids preserved by naive lossless compressors.

---

## 2. Sanitization Architecture

Dodecoder reconstructs and normalizes media bitstreams directly in memory:

- **Mathematical PRNU Disruption:**
  - Applies a non-deterministic Inverse Affine Transformation with random rotation in range 0.1° to 0.3° combined with anisotropic scaling driven by hardware entropy via `crypto.getRandomValues`.
  - Employs a high-performance Digital Differential Analyzer loop with a 16-tap Catmull-Rom bicubic interpolation kernel and XorShift32 micro-dithering, collapsing Peak-to-Correlation Energy without visible quality loss.
- **Unified Lossy VP8 Pipeline:**
  - 100 percent of decoded image payloads route exclusively through the lossy VP8 encoder.
  - Complete elimination of WebP Lossless VP8L, screenshot detection, and image variance heuristics.
  - Encoder quality is locked strictly to 0.60 to disrupt PRNU sensor prints and carrier grids.
  - Visual text ringing and UI artifacting are explicit and accepted outcomes of the quantization matrix.
- **Unconditional Stochastic Affine Perturbation & Noise Dithering:**
  - Executes random rotation in range 0.1° to 0.3° combined with anisotropic scaling driven by hardware entropy via `crypto.getRandomValues`.
  - Executes random noise dithering unconditionally across all canvas contexts, collapsing Peak-to-Correlation Energy.
  - Applies forced YUV 4:2:0 Chroma Subsampling across all processed images, averaging Cb and Cr in 2x2 blocks to eradicate color-channel anchored steganographic payloads.
- **Extreme Sanitization & Deep Decontamination:**
  - Optional multi-stage spatial micro-resampling, hardware-accelerated 3x3 median filtering, and visibility dithering for high-threat threat models.
- **Idempotent 128-bit SHA-256 Naming:**
  - Computes pure SHA-256 exclusively on the sanitized bitstream without random salt to restore deduplication idempotency across systems.
  - Slices strictly to the first 32 hexadecimal characters, providing 128 bits of entropy formatted as `[32_character_hex].[extension]`.
  - Strips chained extensions such as `.jpg.webp` to a single clean target format.
- **ISOBMFF Video Integrity & In-Place Mutation:**
  - Protects MP4 and MOV containers by maintaining original file size strictly to preserve `stco` and `co64` frame pointer alignment.
  - Replaces proprietary metadata box types `udta`, `uuid`, `meta`, and `ilst` with `0x66726565` `free` padding boxes, overwriting payload contents with `0x00`.
  - Zeroes creation and modification timestamps in `mvhd`, `tkhd`, and `mdhd` boxes in-place.
  - Zeroes embedded encoder banners such as `x264 - core` within `mdat` blocks.
- **Memory Stability & Worker Offloading:**
  - Offloads heavy DataView iterations and structural video processing to Web Workers via zero-copy Transferable Objects.
  - Enforces strict memory hygiene by calling `URL.revokeObjectURL` on stale blobs, running `ctx.clearRect` on all canvas contexts, and reassigning heavy byte array buffers to null for immediate garbage collection.
- **Zero-Trace Standalone PKZIP Builder:**
  - Autonomous binary serializer enforcing MS-DOS attributes.
  - Sets DOS timestamps to Jan 1, 1980 00:00:00 UTC and enforces zero extra fields, preventing UNIX timestamps and UID or GID leakage.
- **Mandatory One-Way Image Re-Synthesis:**
  - 100 percent of image assets strictly route through canvas decoding with stochastic affine perturbation.
  - Fast-Track 1:1 bypass is permanently disabled across JPEG, PNG, WebP, BMP, and TIFF to prevent PRNU and sensor fingerprint leakage.
  - Guaranteed cryptographic divergence: output SHA-256 strictly diverges from input SHA-256 for all images.
  - In-place structural manipulation via DataView and free atom substitution is isolated strictly to MP4, MOV, and audio assets.
  - Bloat fallback routines and size inflation warnings are completely removed.

---

## 3. Supported Formats & Automation

Format detection is automated upon file ingestion:

- **Images:** JPEG, PNG, WebP, BMP, TIFF. Canvas bitmap decimation, auto-chunking matrix, PRNU affine transformations, ICC calibration purge, optional extreme steganography decontamination, and 60% locked quantization.
- **Video:** MP4, MOV. In-place box mutation to free atoms, timestamp zeroing, and NAL SEI banner wiping with absolute file size preservation.
- **Audio:** MP3, WAV, OGG. Extraction of pure audio frames and complete stripping of ID3 tags.
- **Batch Processing:** Concurrently process multiple media files with single-click zero-trace ZIP export.

---

## 4. Privacy & Processing Guarantees

1. **Zero Server / Zero Network:** All processing executes locally in browser memory. No data, telemetry, or device identifiers leave the client.
2. **Ephemeral Memory Hygiene:** Object URLs are explicitly revoked, canvas surfaces are cleared, and memory references are nulled.
3. **Monochromatic OLED Interface:** Minimalist True Black `#000000` design optimized for focus, battery efficiency, and high contrast.

---

## 5. Inspection & Verification

Dodecoder includes an integrated forensic inspection modal to audit files before and after sanitization:

- Side-by-side media previews for images, video, and audio.
- Detailed tag table detailing purged metadata attributes.
- Binary marker and container segment parser validating elimination of vendor chunks.
- Cryptographic SHA-256 validation.

---

## 6. Development & Deployment

### Local Development
```bash
# Clone the repository
git clone https://github.com/mochilamv/dodecoder.git
cd dodecoder

# Install development dependencies
npm install

# Run automated forensic test suite
npm test

# Start local dev server
npm run dev
```

### Static Build
```bash
npm run build
```
Compiled, zero-dependency static assets are output to `./dist`.

### Deploy to GitHub Pages
1. Push to GitHub: `git push origin main`
2. Configure **Settings > Environments > github-pages**: ensure `main` is authorized in deployment branch rules.
3. Live production: [https://mochilamv.github.io/dodecoder/](https://mochilamv.github.io/dodecoder/)

---

## 7. Authors, Legal & Licensing
* **Authors:** Created by **Mochilamv** & **Antigravity AI**.
* **License:** Licensed under the **MIT License**.
* **Data Minimization:** Built in alignment with GDPR Art. 5.1.c and LGPD Art. 6, III, empowering users to eliminate unnecessary personal tracking data prior to public release.
* **Disclaimer:** Provided as a defensive privacy and media anti-forensics tool. Users are responsible for complying with applicable local laws and regulations.
