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
6. **Cross-Correlation & File System Leaks:** Deterministic content hashes enable correlation across seized devices. Standard ZIP utilities inject host OS timestamps and UID or GID permissions.
7. **Sub-Perceptual Steganography:** Game engines and proprietary software inject invisible UID watermarks and coordinate grids preserved by naive lossless compressors.

---

## 2. Sanitization Architecture

Dodecoder avoids in-place tag editing. Instead, it reconstructs and normalizes media bitstreams in memory:

- **Mathematical PRNU Disruption:**
  - Applies a non-deterministic Inverse Affine Transformation with random rotation in range 0.1° to 0.3° combined with anisotropic scaling driven by hardware entropy via `crypto.getRandomValues`.
  - Employs a high-performance Digital Differential Analyzer loop with a 16-tap Catmull-Rom bicubic interpolation kernel and XorShift32 micro-dithering, collapsing Peak-to-Correlation Energy without visible quality loss.
- **Intelligent Auto-Chunking Matrix:**
  - Evaluates input headers and payload entropy in memory to route each file into its minimal container layout:
    - **Camera Capture:** High localized entropy, ISO noise floor, JPEG APP1 markers $\to$ **Pure VP8 Lossy**. Strips APP0-APP15, drops ICC profiles, applies lossy quantization, omits VP8X header.
    - **UI Screenshot or Text:** Uniform color planes, low unique color count, sharp edge transitions $\to$ **Pure VP8L Lossless**. Preserves pixel-exact glyph clarity, omits VP8X header, keeps file size minimal.
    - **Alpha Media:** Explicit alpha transparency byte detected in pixel stream $\to$ **Targeted VP8X Extended**. Flags only the ALPH bitmask `0x10`, discards ICCP, EXIF, and XMP chunks.
- **Deep Decontamination Pipeline (Anti-Steganography):**
  - Breaks matrix alignment and destroys sub-perceptual tracking markers before containerization:
    - **Spatial Micro-Resampling:** Scales the canvas to 99.5%, then resamples back to 100% using Catmull-Rom bicubic interpolation to recalculate weighted pixel averages across the raster.
    - **Hardware-Accelerated 3x3 Median Filter:** WebGL fragment shader calculates the median value of every 3x3 neighborhood with automatic CPU fallback, eliminating low-amplitude periodic modulations while keeping edge boundaries sharp.
    - **Visibility-Threshold Dithering:** Injects deterministic pseudo-random offsets in range -2 to 2 discrete levels across RGB channels in Uint8ClampedArray, corrupting watermark parity checks without human-visible variance.
    - **Enforced Lossy Quantization:** Overrides format routing to force Lossy VP8 quantization, running high frequencies through standard quantization tables to eradicate leftover carrier signals.
- **CSPRNG Ephemeral Salting & 128-bit Cryptographic Naming:**
  - Generates 256-bit cryptographically secure salts prepended to sanitized bitstreams before SHA-256 derivation.
  - Slices the first 32 hexadecimal characters (128 bits of entropy) and applies strict regular expression sanitization to eliminate chained extensions like `.jpg.webp`.
  - Wipes salt and combined memory buffers with zeroes immediately after derivation.
- **Zero-Trace Standalone PKZIP Builder:**
  - Autonomous binary serializer enforcing MS-DOS attributes.
  - Sets DOS timestamps to Jan 1, 1980 00:00:00 UTC and enforces zero extra fields, preventing UNIX timestamps and UID or GID leakage.
- **Deep Recursive ISOBMFF / MP4 Sanitization:**
  - Recursively traverses `moov` > `trak` > `mdia` container hierarchies to purge proprietary metadata.
  - Resets creation and modification timestamps in all header boxes.
  - Scans `mdat` payloads to zero out embedded encoder banners without mutating sample table offsets.
- **Fast-Track Bypass 1:1 Bitstream:**
  - Evaluates suspicious metadata tags via low-level DataView parsing prior to canvas decoding.
  - When suspicious tag count is 0 and extreme sanitization is disabled, returns the exact 1:1 bitstream under a salted ephemeral name.
- **Post-Processing Bloat Fallback:**
  - When canvas re-encoding results in a blob larger than the input file, the canvas output is discarded and surgical binary stripping is applied directly to original bytes.

---

## 3. Supported Formats & Automation

Format detection is automated upon file ingestion:

- **Images:** JPEG, PNG, WebP, BMP, TIFF. Canvas bitmap decimation, auto-chunking matrix, PRNU affine transformations, ICC calibration purge, optional extreme steganography decontamination, and adjustable compression.
- **Video:** MP4, MOV. Recursive box sanitization, timestamp zeroing, and NAL SEI banner wiping.
- **Audio:** MP3, WAV, OGG. Extraction of pure audio frames and complete stripping of ID3 tags.
- **Batch Processing:** Concurrently process multiple media files with single-click zero-trace ZIP export.

---

## 4. Privacy & Processing Guarantees

1. **Zero Server / Zero Network:** All processing executes locally in browser memory. No data, telemetry, or device identifiers leave the client.
2. **Ephemeral Memory Hygiene:** Object URLs are explicitly revoked, and sensitive hashing buffers are zero-filled in memory.
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

# Run automated forensic test suite (13 tests covering PRNU, salting, markers, ZIP, ISOBMFF, ICC, ALPH, bypass, bloat fallback, 128-bit naming, and anti-steganography)
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
* **Data Minimization:** Built in alignment with GDPR Art. 5(1)(c) and LGPD Art. 6, III, empowering users to eliminate unnecessary personal tracking data prior to public release.
* **Disclaimer:** Provided as a defensive privacy and media anti-forensics tool. Users are responsible for complying with applicable local laws and regulations.
