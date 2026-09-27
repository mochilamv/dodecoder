# Dodecoder — Client-Side Media Sanitization & Anti-Forensics

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Security: Zero-Server](https://img.shields.io/badge/Security-Client--Side%20(Zero--Server)-10b981.svg)](#privacy--processing-guarantees)
[![Dependencies: 0 Runtime](https://img.shields.io/badge/Dependencies-0%20Runtime-black.svg)](#sanitization-architecture)
[![Platform: Static / GitHub Pages](https://img.shields.io/badge/Platform-Static%20%2F%20Pages-black.svg)](#development--deployment)

A client-side static web application for **reconstructive media sanitization** (images, video, audio). Eliminates metadata, container fingerprints, and device sensor signatures directly in browser memory with **zero backend, zero third-party runtime dependencies, zero analytics, and zero outbound network traffic**.

Hosted on GitHub Pages: [mochilamv.github.io/dodecoder](https://mochilamv.github.io/dodecoder/)

---

## 1. Forensic Threat Model

Standard metadata strippers merely delete select tags while leaving underlying physical and algorithmic characteristics intact. Media files can be tracked through multiple forensic layers:

1. **Metadata & Location:** EXIF, GPS coordinates, camera serial numbers, and device timestamps.
2. **Embedded Thumbnails:** IFD1 previews often retain unedited image content or GPS data.
3. **Proprietary MakerNotes:** Binary blocks storing camera settings, firmware versions, and sensor temperatures.
4. **Sensor Silicon Noise (PRNU):** Microscopic imperfections in camera silicon sensors leave a unique Photo Response Non-Uniformity pattern across images, enabling hardware identification. Simple micro-cropping is ineffective as rigid translations fail against cross-correlation algorithms.
5. **Container & Codec Signatures:** Distinct DQT/Huffman tables, encoder metadata banners (e.g. `x264 - core`), and container atoms (`udta`, `uuid`, `mdhd`) expose software pipelines and capture times.
6. **Cross-Correlation & File System Leaks:** Deterministic content hashes enable correlation across seized devices, and standard ZIP utilities inject host OS timestamps (`0x5455`) and UID/GID permissions (`0x7875`).

---

## 2. Sanitization Architecture

Dodecoder does not perform in-place tag editing. Instead, it fully reconstructs and normalizes media bitstreams in memory with zero external runtime dependencies:

- **Mathematical PRNU Disruption (Affine + Bicubic):**
  - Applies a non-deterministic Inverse Affine Transformation: random rotation ($\theta \in [0.1^\circ, 0.3^\circ]$) combined with anisotropic scaling ($|s_x - s_y| \ge 0.0005$) driven by hardware entropy (`crypto.getRandomValues`).
  - Utilizes a high-performance Digital Differential Analyzer (DDA) loop with a 16-tap Catmull-Rom ($\alpha = -0.5$) bicubic interpolation kernel and XorShift32 micro-dithering, collapsing Peak-to-Correlation Energy (PCE) without visible quality degradation.
- **CSPRNG Ephemeral Salting (Anti-Correlation):**
  - Generates 256-bit cryptographically secure salts via `crypto.getRandomValues()` prepended to sanitized bitstreams before SHA-256 derivation.
  - Salt and temporary combined buffers are explicitly overwritten with zeroes (`salt.fill(0)`) immediately after generation, neutralizing cross-device database correlation.
- **Zero-Trace Standalone PKZIP Builder:**
  - Employs an autonomous, zero-dependency binary serializer (`DataView`) enforcing MS-DOS/FAT attributes (`version made by = 0x0014`).
  - Hardcodes DOS timestamps to standard epoch (`0x0021` / `0x0000` = Jan 1, 1980 00:00:00 UTC) and enforces `extra_field_length = 0`, permanently preventing UNIX timestamps and UID/GID leaks.
- **Deep Recursive ISOBMFF / MP4 Sanitization:**
  - Recursively traverses `moov` > `trak` > `mdia` container hierarchies to purge proprietary metadata (`udta`, `meta`, `uuid`, `ilst`).
  - Resets creation and modification timestamps in all header boxes (`mvhd`, `tkhd`, `mdhd`).
  - Scans `mdat` payloads to zero out embedded encoder banners (such as `x264 - core ...`) without mutating sample table offsets.
- **Display Calibration & ICC Profile Decimation (Zero-Copy):**
  - Neutralizes monitor-specific calibration curves and display fingerprints injected by browser canvas encoders (`toBlob` / `convertToBlob`).
  - Systematically parses bitstreams to excise `iCCP` (ICC Profile), `cHRM` (Primary Chromaticities), and `gAMA` chunks from PNG streams.
  - Strips `APP2` (`ICC_PROFILE`) and vendor metadata markers from JPEG containers.
  - Expunges `ICCP` chunks and clears ICC/metadata header flags in WebP (`VP8X`), preventing display hardware attribution.
- **Fast-Track Bypass ("Strip Only" 1:1 Bitstream):**
  - Evaluates suspicious metadata tags via low-level DataView parsing prior to canvas decoding.
  - Checks for APP1/Exif, APP1/XMP, APP2/ICC_PROFILE, and IFD1 (following the next-IFD pointer in TIFF headers) in JPEG, and `eXIf`, `iCCP`, `tEXt`, `zTXt`, `iTXt` in PNG.
  - If suspicious tag count is 0, completely bypasses canvas rendering and noise dithering, returning the exact 1:1 bitstream with an ephemeral salted name.
- **Intelligent Compression Routing (Lossy vs. Lossless):**
  - Automatically identifies non-photographic images (screenshots, memes, text) via: (a) declared PNG MIME/extension; (b) `/screenshot/i` filename regex; (c) downscaled 48x48 color variance analysis (quantized unique colors < 32).
  - Routes flat/non-photographic images to WebP Lossless without noise injection, eliminating artificial entropy injection in solid color areas.
  - Restricts stochastic noise injection and Lossy 85% compression strictly to photographic JPEGs where physical PRNU silicon noise actually exists.
- **Post-Processing Bloat Fallback:**
  - If canvas re-encoding results in a clean blob larger than the original input file, the canvas output is discarded.
  - Applies surgical binary stripping of metadata segments/chunks directly on the original bitstream, guaranteeing zero size inflation and flagging the UI with a `"Tamanho inflado por injeção de entropia"` alert.
- **Audio ID3 Stripping:**
  - Extracts pure audio payload frames from MP3/WAV/OGG files, discarding ID3v1 and ID3v2 tags.

---

## 3. Supported Formats & Automation

Format detection is automated upon file ingestion:

- **Images (JPEG, PNG, WebP, BMP, TIFF):** Canvas bitmap decimation, intelligent lossy/lossless routing, PRNU affine transformations, ICC/display calibration purge, and user-adjustable encoder compression.
- **Video (MP4, MOV):** Container-level recursive box sanitization, timestamp zeroing, and NAL SEI banner wiping.
- **Audio (MP3, WAV, OGG):** Automatic removal of ID3v1 and ID3v2 metadata frames.
- **Batch Processing:** Concurrently process multiple media files with single-click zero-trace ZIP export.

---

## 4. Privacy & Processing Guarantees

1. **Zero Server / Zero Network:** All processing executes locally in browser memory. No data, telemetry, or device identifiers leave the client.
2. **Ephemeral Memory Hygiene:** Object URLs are explicitly revoked, and sensitive hashing buffers are zero-filled in memory.
3. **Monochromatic OLED Interface:** Minimalist True Black (`#000000`) HUD design optimized for focus, battery efficiency, and high contrast.

---

## 5. Inspection & Verification

Dodecoder includes an integrated forensic inspection modal to audit files before and after sanitization:

- Side-by-side media previews for images, video, and audio.
- Detailed tag table detailing purged metadata attributes.
- Binary marker and container segment parser validating the elimination of vendor chunks.
- Cryptographic SHA-256 validation.

---

## 6. Development & Deployment

### Local Development
```bash
# Clone the repository
git clone https://github.com/mochilamv/dodecoder.git
cd dodecoder

# Install dependencies (development tools only)
npm install

# Run the automated forensic test suite (9 tests covering PRNU, salting, markers, ZIP, ISOBMFF, ICC, ALPH, bypass, and bloat fallback)
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
2. Configure **Settings > Environments > github-pages**: ensure `main` is authorized in deployment branch rules (or configure **Settings > Pages** to deploy via GitHub Actions).
3. Live production: [https://mochilamv.github.io/dodecoder/](https://mochilamv.github.io/dodecoder/)

---

## 7. Authors, Legal & Licensing
* **Authors:** Created by **Mochilamv** & **Antigravity (AI)**.
* **License:** Licensed under the **MIT License** (Copyright &copy; 2026 Mochilamv & Antigravity).
* **Data Minimization:** Built in strict alignment with **GDPR (EU) Art. 5(1)(c)** and **LGPD (Brazil) Art. 6º, III** (*Princípio da Necessidade*), empowering users to eliminate unnecessary personal tracking data prior to public release.
* **Disclaimer:** Provided as a defensive privacy and media anti-forensics tool. Users are responsible for complying with applicable local laws and regulations.
