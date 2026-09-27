# DoDecoder — Client-Side Media Anti-Forensics & Anonymization Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Security: Zero-Server](https://img.shields.io/badge/Security-Client--Side%20(Zero--Server)-10b981.svg)](#security-guarantees)
[![Platform: Static / GitHub Pages](https://img.shields.io/badge/Platform-Static%20WASM%20%2F%20Pages-black.svg)](#deployment)

A high-performance, strictly client-side static web application designed for **deep destructive and reconstructive media sanitization** (images, video, audio). Built for high-threat environments, human rights defenders, investigative journalists, whistleblowers, and privacy-conscious users.

Hosted statically on GitHub Pages with **zero backend, zero analytics, and zero outbound network traffic**.

---

## 1. The Forensic Threat Model

Standard "EXIF removers" only modify metadata tags while leaving lethal forensic vectors intact. Forensic investigators, intelligence agencies, and automated big-data scrapers analyze digital media across five distinct forensic layers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Superficial Tags       (EXIF, GPS Coordinates, Timestamp)│
├─────────────────────────────────────────────────────────────┤
│ 2. Hidden Containers      (IFD1 Thumbnails, MakerNotes, XMP)│
├─────────────────────────────────────────────────────────────┤
│ 3. Compression Signatures (DQT Matrices, Huffman Tables)    │
├─────────────────────────────────────────────────────────────┤
│ 4. Sensor Fingerprint     (PRNU - Photo Response Noise)     │
├─────────────────────────────────────────────────────────────┤
│ 5. Local System Footprint (OS atime/mtime, Serial Filenames)│
└─────────────────────────────────────────────────────────────┘
```

### Why Attribute Stripping Fails:
* **The IFD1 Thumbnail Trap:** Many tools strip the primary EXIF tags in IFD0, but leave the `IFD1` block untouched. IFD1 contains an unedited, embedded JPEG thumbnail of the original photograph—often exposing faces, locations, or wide-angle context that was cropped out of the main picture.
* **Proprietary MakerNotes:** Camera and smartphone vendors (Apple, Samsung, Sony, Xiaomi, Motorola) embed proprietary encrypted or binary blobs containing sensor temperatures, battery status, lens serials, and face-recognition coordinates.
* **Quantization Matrix Fingerprinting (DQT):** Forensic tools (such as JPEGsnoop and Amped Authenticate) inspect the 8x8 luminance and chrominance quantization tables (`0xFFDB`) to identify the exact camera model, hardware image processor (ISP), or editing software used.
* **PRNU Sensor Ballistics:** Microscopic silicon imperfections in each camera's CMOS sensor leave an invisible, unique fixed pattern noise (*Photo Response Non-Uniformity*). Wavelet cross-correlation can match an image to a physical device just like ballistic rifling marks match a bullet to a firearm barrel.

---

## 2. The DoDecoder Defense Architecture

DoDecoder never edits files in place. It performs an in-memory **destructive decimation and pure pixel reconstruction**:

```
[Raw Media Artifact]
         │
         ▼
[In-Memory Decimation via OffscreenCanvas / Web Worker]
  └─ Container and all APP1..APP15 metadata blocks discarded
         │
         ▼
[Anti-PRNU & Geometric De-synchronization Engine]
  ├─ Non-deterministic micro-crop (2 to 6 pixels)
  ├─ Sub-pixel bicubic/bilinear resampling (collapses wavelet correlation)
  ├─ Controlled high-frequency micro-dithering in flat fields
  └─ Color space normalized to standard sRGB (ICC profile eliminated)
         │
         ▼
[Clean Re-Encoding]
  └─ Re-quantized with standard IJG / WebP quantization matrices
         │
         ▼
[Forensic Naming & Filesystem Packaging]
  ├─ Filename: SHA-256(cleaned_bytes)[0..15] + extension
  └─ Batch ZIP Bundle: Normalizes all internal timestamps to MS-DOS Epoch (1980-01-01)
```

---

## 3. Defense Modes

| Defense Mode | Core Operations | Primary Defense Against |
| :--- | :--- | :--- |
| **Standard Cleanse** | 1:1 Pure bitmap decimation, complete metadata purge, DQT normalization. | EXIF, GPS, IFD1 thumbnails, MakerNotes, XMP history, camera software signatures. |
| **Hardened (Recommended)** | Standard + non-deterministic micro-crop & sub-pixel resampling. | **PRNU sensor matching**, image matrix correlation, hardware attribution. |
| **Paranoid Mode** | Hardened + pseudo-random micro-dithering in low-variance fields. | Advanced wavelet Wiener filter extraction and multi-image correlation. |

---

## 4. Privacy & Processing Guarantees

1. **Client-Side In-Memory Execution:**
   100% of image decimation, video box stripping, and cryptographic hashing runs locally in your device's memory. No files, telemetry, or analytics are ever transmitted to any external server.
2. **Video & Audio Sanitization:**
   - **MP4 / MOV:** Zero-copy container sanitization stripping `udta` (GPS, camera info), `meta`, and `uuid` atoms with 64-bit box support. Resets internal `mvhd` and `tkhd` creation/modification timestamps to 0 (Epoch 1904).
   - **MP3 / Audio:** Strips both ID3v2 (variable-length tag headers) and ID3v1 (trailing 128-byte metadata tags).
3. **Ephemeral RAM Management:**
   Processed object URLs are explicitly revoked via `revokeUrls()`, and memory buffers can be zeroed at any time using the **Purge RAM** button.
4. **True Black OLED UI:**
   Engineered with `#000000` True Black for minimum battery draw and optimal screen readability on mobile OLED displays (e.g. Motorola Moto G56, Google Pixel, Samsung Galaxy).

---

## 5. Built-in Forensic Audit Room

DoDecoder includes a side-by-side **Forensic Audit Room** for verifying media before and after sanitization:
- **Media Previews:** Live visual player comparisons for images, videos, and audio streams.
- **Leak Extraction Table:** Lists all detected tags (GPS latitude/longitude, Camera Model, Serial Numbers, Software version, MakerNotes).
- **Binary Segment Breakdown:** Verifies that dangerous container segments (`APP1`, `APP2`, `APP13`, `udta`, `meta`) have been completely replaced with only standard stream markers (`SOI`, `DQT`, `DHT`, `SOF`, `SOS`, `EOI`).
- **Cryptographic Hash Verification:** Compares the source SHA-256 with the sanitized SHA-256.

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
