# Dodecoder

Client-side media anti-forensics and reconstruction engine. Sanitizes images, video, and audio in browser memory to eliminate metadata, tracking vectors, and sensor fingerprints.

Hosted on GitHub Pages: https://mochilamv.github.io/dodecoder/

## 1. Forensic Threat Model

Standard metadata strippers remove tags while leaving tracking artifacts intact. Dodecoder mitigates:

1. Metadata and Location: EXIF, GPS coordinates, serial numbers, timestamps.
2. Embedded Thumbnails: IFD1 preview buffers containing unedited content or coordinates.
3. MakerNotes: Proprietary OEM binary structures with hardware telemetry.
4. Sensor Silicon Noise: Photo Response Non-Uniformity (PRNU) patterns in camera sensors.
5. Container and Codec Signatures: Quantization tables, encoder banners, container atoms.
6. Identity Correlation: Deterministic hash linkage and host archive timestamp leaks.
7. Steganography: Sub-perceptual channel modulations and UID watermarks.

## 2. Architecture and Pipeline

### Image Sanitization Pipeline
- Dedicated Web Worker: Offloads decoding, downscaling, affine perturbation, and encoding to a separate thread via OffscreenCanvas and Transferable Objects.
- Main Thread Fallback: Yields cooperatively via row-batched chunks and asynchronous yielding if worker 2D context fails.
- Proportional Resolution Downscaling: Decodes image stream and clamps maximum dimension to 1920px using bicubic interpolation before perturbation.
- WebP Export and Container Purity: Uses getContext('2d', { alpha: false }) on opaque media to strip alpha channels and prevent ALPH or VP8X chunk injection. Inspects RIFF bytes 12-15 to detect residual extended chunks.
- PRNU Disruption: Applies non-deterministic inverse affine transformation with random rotation between 0.1 and 0.3 degrees combined with anisotropic scaling using crypto.getRandomValues entropy.
- Lossy VP8 Re-encoding: Routes 100 percent of image payloads through lossy VP8 quantization locked at 0.60 quality.
- YUV 4:2:0 Chroma Subsampling: Destroys color-channel steganographic modulation by averaging Cb and Cr in 2x2 blocks.
- Optional Deep Decontamination: 3x3 median filtering, spatial micro-resampling, and noise dithering.

### Video and Audio Pipeline
- ISOBMFF In-Place Mutation: Preserves exact file size for MP4 and MOV to maintain stco and co64 frame offsets.
- Free Atom Replacement: Replaces udta, uuid, meta, and ilst metadata boxes with 0x66726565 (free) padding filled with 0x00.
- Timestamp Zeroing: Clears creation and modification timestamps in mvhd, tkhd, and mdhd headers.
- NAL Banner Clearing: Overwrites x264/x265 encoder banners inside mdat blocks.
- Audio Sanitization: Extracts audio frames and strips ID3 tags for MP3, WAV, and OGG.

### Archive and Identification
- Standalone PKZIP Builder: Zero-trace zip serializer enforcing MS-DOS attributes and static timestamps (1980-01-01 00:00:00 UTC), preventing UNIX UID/GID and timestamp leakage.
- Idempotent 128-bit SHA-256 Naming: Generates sanitized filenames from the first 32 characters of output SHA-256 without salt, ensuring deduplication idempotency.

## 3. User Interface Specifications

- Monochromatic True Black: Pure #000000 background on all views, containers, and cards. Layout structure organized via margin and padding without borders or box-shadows.
- High-Contrast Palette: Strictly restricted to #FFFFFF for text/labels (WCAG AAA), #00FF00 for clean states and focus outlines (WCAG AAA), and #FF4444 for forensic alerts (WCAG AA).
- Keyboard Accessibility: Visible focus outline of 2px solid #00FF00 with 2px offset on all interactive elements.
- Clean Control Density: Primary controls migrate descriptive subtitles to aria-label and title attributes.

## 4. Supported Formats

- Images: JPEG, PNG, WebP, BMP, TIFF.
- Video: MP4, MOV.
- Audio: MP3, WAV, OGG.

## 5. Development and Build

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher

### Commands
```bash
# Install dependencies
npm install

# Run automated forensic verification test suite
npm test

# Build production assets
npm run build

# Start local development server
npm run dev
```

Compiled static distribution files are emitted to ./dist.

## 6. Deployment

Deployments to GitHub Pages are automated via GitHub Actions on push to branch main (.github/workflows/deploy.yml).

To trigger deployment:
```bash
git push origin main
```

## 7. License

MIT License. Copyright (c) 2024 Mochilamv and Antigravity AI.
