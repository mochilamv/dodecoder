# Dodecoder — Client-Side Media Sanitization & Anti-Forensics

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Security: Zero-Server](https://img.shields.io/badge/Security-Client--Side%20(Zero--Server)-10b981.svg)](#privacy--processing-guarantees)
[![Platform: Static / GitHub Pages](https://img.shields.io/badge/Platform-Static%20%2F%20Pages-black.svg)](#development--deployment)

A client-side static web application for **reconstructive media sanitization** (images, video, audio). Eliminates metadata, container fingerprints, and device sensor signatures directly in the browser with **zero backend, zero analytics, and zero outbound network traffic**.

Hosted on GitHub Pages: [mochilamv.github.io/dodecoder](https://mochilamv.github.io/dodecoder/)

---

## 1. Forensic Threat Model

Common metadata strippers merely delete select tags while leaving underlying identifying characteristics intact. Media files can be tracked through multiple layers:

1. **Metadata & Location:** EXIF, GPS coordinates, serial numbers, timestamps.
2. **Embedded Thumbnails:** IFD1 previews often retain unedited image content or GPS data.
3. **Proprietary MakerNotes:** Binary blocks storing camera settings, firmware versions, and sensor temperatures.
4. **Sensor Noise (PRNU):** Microscopic imperfections in camera sensors leave a unique Photo Response Non-Uniformity pattern across images, enabling hardware identification.
5. **Container & Quantization:** Distinct DQT/Huffman tables and container atoms expose the software and hardware pipeline used.

---

## 2. Sanitization Architecture

Dodecoder does not perform in-place tag editing. Instead, it fully reconstructs media in memory:

- **Pure Pixel Decimation:** Decodes images to raw bitmap data via Canvas/Workers, discarding all original container headers, EXIF blocks, MakerNotes, and color profiles.
- **Sensor Noise Disruption (Anti-PRNU):** Applies non-deterministic micro-crop, sub-pixel resampling, and flat-field micro-dithering to collapse physical sensor correlation.
- **Normalized Re-Encoding:** Encodes into standard WebP, PNG, or JPEG bitstreams using standardized quantization matrices.
- **Neutral Naming & Timestamps:** Generates names based on SHA-256 content hashes and sets archive timestamps to the standard epoch (1980).

---

## 3. Supported Formats & Automation

Format detection is automated upon file ingestion:

- **Images (JPEG, PNG, WebP, BMP, TIFF):** Full canvas bitmap decimation, anti-PRNU transformations, metadata purge, and user-adjustable encoder compression.
- **Video (MP4, MOV):** Container-level sanitization stripping `udta`, `meta`, and `uuid` atoms, zeroing movie/track header creation timestamps.
- **Audio (MP3, WAV, OGG):** Automatic removal of ID3v1 and ID3v2 metadata frames.
- **Batch Processing:** Process multiple files concurrently with single-click ZIP archive export.

---

## 4. Privacy & Processing Guarantees

1. **Client-Side Execution:** All processing happens entirely in browser memory. No data is sent to external servers.
2. **Ephemeral Memory:** Object URLs are explicitly revoked when files are inspected or cleared.
3. **Monochromatic OLED Interface:** Minimalist True Black `#000000` design optimized for battery efficiency and high-contrast readability.

---

## 5. Inspection & Verification

Dodecoder provides a file inspection tool to compare inputs against sanitized outputs:

- Side-by-side media previews for images, video, and audio.
- Extracted metadata tag table showing stripped attributes.
- Container segment inspection confirming elimination of vendor markers.
- Before-and-after cryptographic SHA-256 hashes.

---

## 6. Development & Deployment

### Local Development
```bash
# Clone the repository
git clone https://github.com/mochilamv/dodecoder.git
cd dodecoder

# Install dependencies
npm install

# Run the automated test suite (8 tests covering image, video, audio, and hashing)
npm test

# Start local dev server
npm run dev
```

### Static Build
```bash
npm run build
```
The compiled, zero-dependency static assets will be in `./dist`.

### Deploy to GitHub Pages
1. Push this repository to GitHub: `git push -u origin main`
2. Go to **Settings > Pages** on your GitHub repository.
3. In **Build and deployment > Branch**, select **gh-pages** (or Source: **GitHub Actions**).
4. The site is live at: `https://mochilamv.github.io/dodecoder/`

---

## 7. Authors, Legal & Licensing
* **Authors:** Created by **Mochilamv** & **Antigravity (AI)**.
* **License:** Licensed under the **MIT License** (Copyright &copy; 2026 Mochilamv & Antigravity).
* **Data Minimization:** Built in strict alignment with **GDPR (EU) Art. 5(1)(c)** and **LGPD (Brazil) Art. 6º, III** (*Princípio da Necessidade*), empowering users to eliminate unnecessary personal tracking data prior to public release.
* **Disclaimer:** Provided as a defensive privacy and media anti-forensics tool. Users are responsible for complying with applicable local laws and regulations.
