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
8. File System Remanence: SSD wear-leveling data recovery.
9. Acoustic Geolocation: Electrical Network Frequency (ENF) grid hum.

## 2. Architecture and Pipeline

### Image Sanitization Pipeline
- Deterministic WASM Encoder: Pure Rust wasm32-unknown-unknown WebP Lossless encoder (VP8L). Eliminates OffscreenCanvas convertToBlob() discrepancies across browsers and ensures bit-identical deterministic outputs.
- Proportional Resolution Downscaling: Decodes image stream and clamps maximum dimension to 1920px using bicubic interpolation before perturbation.
- Spatial Grid Tiling: Bypasses memory limitations and canvas size restrictions by processing ultra-high-resolution images via sequential createImageBitmap spatial tiling.
- PRNU Disruption & CMOS Noise Simulation: Heteroscedastic luminance-coupled Poisson-Gaussian noise model (variance = a*I + b). Replaces discrete LSB bitmasking to realistically simulate physical CMOS sensors via Box-Muller transformations.
- Deep Decontamination: Hardcoded 60% quality constraint, spatial micro-resampling, 3x3 median filtering, and visibility dithering. Forced YUV 4:2:0 Chroma Subsampling destroys color-channel steganographic modulation.

### Video and Audio Pipeline
- WebCodecs Bitstream Re-Synthesis: Full decoding and re-encoding of audio and video frames. Deprecates in-place container mutation for rich media workflows, neutralizing camera SEI and motion vector side-channels.
- ISOBMFF Track Whitelist: Discards subtitle, text, meta, and proprietary tracks during container reconstruction.
- ENF Notch Cascades: Digital IIR Biquad Notch filters deployed at 50Hz, 60Hz, and integer harmonics (<1200Hz) on decoded AudioData to eradicate Electrical Network Frequency geolocation signatures.

### Zero-Remanence IO and Cryptography
- Ephemeral AES-GCM OPFS Encryption: Wraps Origin Private File System (OPFS) streams with a volatile 256-bit RAM key. Encrypts data in chunks with random IVs before disk writes, explicit key zeroization on completion to defeat SSD wear-leveling remanence.
- Cryptographic Container Padding: Final file size is deterministically quantized to a multiple of 524288 bytes (512KB). Random payloads generated via crypto.getRandomValues are injected into ignored container regions (free box for ISOBMFF, JUNK chunk for RIFF).
- Standalone PKZIP Builder: Zero-trace zip serializer enforcing MS-DOS attributes and static timestamps (1980-01-01 00:00:00 UTC), preventing UNIX UID/GID and timestamp leakage.
- Idempotent 128-bit SHA-256 Naming: Generates sanitized filenames from the first 32 characters of output SHA-256 without salt, ensuring deduplication idempotency.

## 3. Supported Formats

- Images: JPEG, PNG, WebP, BMP, TIFF, GIF.
- Video: MP4, MOV, MKV, WebM.
- Audio: MP3, WAV, OGG, AAC, M4A.

## 4. Development and Build

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

## 5. Deployment

Deployments to GitHub Pages are automated via GitHub Actions on push to branch main (.github/workflows/deploy.yml).

To trigger deployment:
```bash
git push origin main
```

## 6. License

MIT License. Copyright (c) 2024 Mochilamv and Antigravity AI.
