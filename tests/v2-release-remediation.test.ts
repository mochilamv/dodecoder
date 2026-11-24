import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(process.cwd());

// Minimal Fake DOM helper for UI contract tests
interface RecordedInnerHtml {
  tagName: string;
  html: string;
}

class FakeNode {
  public readonly tagName: string;
  public readonly namespaceURI: string | null;
  public className = '';
  public id = '';
  public type = '';
  public multiple = false;
  public value = '';
  public textContent = '';
  public attributes = new Map<string, string>();
  public children: FakeNode[] = [];
  public parentElement: FakeNode | null = null;
  public listeners = new Map<string, Array<(e?: any) => void>>();
  public style: Record<string, string> = {};
  private _innerHTML = '';
  private readonly log: RecordedInnerHtml[];

  constructor(tagName: string, log: RecordedInnerHtml[], namespaceURI: string | null = null) {
    this.tagName = tagName.toLowerCase();
    this.namespaceURI = namespaceURI;
    this.log = log;
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set innerHTML(val: string) {
    this._innerHTML = val;
    this.log.push({ tagName: this.tagName, html: val });
    this.children = [];
  }

  setAttribute(name: string, value: string): void {
    const strVal = String(value);
    this.attributes.set(name, strVal);
    if (name === 'id') this.id = strVal;
    if (name === 'class') this.className = strVal;
  }

  getAttribute(name: string): string | null {
    return this.attributes.has(name) ? this.attributes.get(name)! : null;
  }

  appendChild(child: FakeNode): FakeNode {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  addEventListener(event: string, handler: (e?: any) => void): void {
    const list = this.listeners.get(event) ?? [];
    list.push(handler);
    this.listeners.set(event, list);
  }

  querySelector(selector: string): FakeNode | null {
    const matches = (el: FakeNode): boolean => {
      if (selector.startsWith('#')) {
        return el.id === selector.slice(1) || el.attributes.get('id') === selector.slice(1);
      }
      if (selector.startsWith('.')) {
        return el.className.split(/\s+/).includes(selector.slice(1));
      }
      return el.tagName === selector.toLowerCase();
    };
    const q: FakeNode[] = [...this.children];
    while (q.length > 0) {
      const cur = q.shift()!;
      if (matches(cur)) return cur;
      q.push(...cur.children);
    }
    return null;
  }

  replaceWith(next: FakeNode): void {
    if (!this.parentElement) return;
    const idx = this.parentElement.children.indexOf(this);
    if (idx >= 0) {
      next.parentElement = this.parentElement;
      this.parentElement.children[idx] = next;
      this.parentElement = null;
    }
  }

  remove(): void {
    if (this.parentElement) {
      this.parentElement.children = this.parentElement.children.filter(c => c !== this);
      this.parentElement = null;
    }
  }

  focus(): void {}
  click(): void {
    const list = this.listeners.get('click') ?? [];
    for (const fn of list) fn();
  }
}

function collectNodes(root: FakeNode): FakeNode[] {
  const out: FakeNode[] = [root];
  for (const c of root.children) out.push(...collectNodes(c));
  return out;
}

async function withFakeDom<T>(
  fn: (innerHtmlLog: RecordedInnerHtml[], body: FakeNode) => Promise<T> | T
): Promise<T> {
  const prevDoc = (globalThis as any).document;
  const log: RecordedInnerHtml[] = [];
  const body = new FakeNode('body', log);
  (globalThis as any).document = {
    body,
    createElement: (tag: string) => new FakeNode(tag, log, null),
    createElementNS: (ns: string, tag: string) => new FakeNode(tag, log, ns),
  };
  try {
    return await fn(log, body);
  } finally {
    if (prevDoc === undefined) delete (globalThis as any).document;
    else (globalThis as any).document = prevDoc;
  }
}

function makeBox(type: string, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(8 + payload.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, out.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(payload, 8);
  return out;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

// =============================================================================
// P0: CI Deploy Workflow Order
// =============================================================================

test('P0 [NODE-VERIFIED]: deploy.yml runs npm run build strictly before npm test', () => {
  const workflowPath = path.join(REPO_ROOT, '.github', 'workflows', 'deploy.yml');
  const yml = fs.readFileSync(workflowPath, 'utf8');
  const buildIdx = yml.indexOf('run: npm run build');
  const testIdx = yml.indexOf('run: npm test');
  assert.ok(buildIdx > 0, 'deploy.yml must run npm run build');
  assert.ok(testIdx > 0, 'deploy.yml must run npm test');
  assert.ok(buildIdx < testIdx, 'deploy.yml must run npm run build BEFORE npm test so dist/index.html CSP is verified');
});

// =============================================================================
// P1 UI Contracts: queue-list video label, audit-modal video scope, app ZIP error
// =============================================================================

test('P1-UI [NODE-VERIFIED]: queue-list displays "Scrubbing container..." for MP4/MOV items during processing', async () => {
  const { buildQueueItemViewModel } = await import('../src/ui/components/queue-list');

  const cases = [
    new File([new Uint8Array(4)], 'clip.mp4', { type: 'video/mp4' }),
    new File([new Uint8Array(4)], 'capture.mov', { type: 'video/quicktime' }),
    new File([new Uint8Array(4)], 'UPPER.MP4', { type: '' }),
    new File([new Uint8Array(4)], 'legacy.MOV', { type: '' }),
  ];

  for (const file of cases) {
    const vmMid = buildQueueItemViewModel({ id: 'v1', file, status: 'processing', progress: 50 });
    assert.equal(vmMid.processingLabel, 'Scrubbing container...', `Expected container label at 50% for ${file.name}`);

    const vmLate = buildQueueItemViewModel({ id: 'v2', file, status: 'processing', progress: 82 });
    assert.equal(vmLate.processingLabel, 'Scrubbing container...', `Video must not display Synthesizing WebP at 82% for ${file.name}`);

    const vmScan = buildQueueItemViewModel({ id: 'v3', file, status: 'analyzing', progress: 15 });
    assert.equal(vmScan.processingLabel, 'Scanning...');
  }

  // Images retain WebP/re-encoding labels
  const imgFile = new File([new Uint8Array(4)], 'photo.jpg', { type: 'image/jpeg' });
  assert.equal(buildQueueItemViewModel({ id: 'i1', file: imgFile, status: 'processing', progress: 50 }).processingLabel, 'Re-encoding...');
  assert.equal(buildQueueItemViewModel({ id: 'i2', file: imgFile, status: 'processing', progress: 82 }).processingLabel, 'Synthesizing WebP...');
});

test('P1-UI [MOCK-CONTRACT]: audit-modal displays removed metadata atoms and Container Only (mdat untouched) for video results', async () => {
  const { buildAuditModalViewModel, renderAuditModal } = await import('../src/ui/components/audit-modal');

  const videoResult = {
    blob: new Blob(['mp4'], { type: 'video/mp4' }),
    originalName: 'clip.mp4',
    sanitizedName: '0123456789abcdef0123456789abcdef.mp4',
    originalSize: 1024,
    sanitizedSize: 1024,
    format: 'video/mp4',
    sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    defenseLevel: 'paranoid' as const,
    auditBefore: {
      fileName: 'clip.mp4',
      fileSize: 1024,
      mimeType: 'video/mp4',
      hasExif: false,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [],
      markers: [
        { offset: 0, marker: 'ftyp', name: 'Box: ftyp', isSanitizedSafe: true },
        { offset: 32, marker: 'udta', name: 'Box: udta', isSanitizedSafe: false },
        { offset: 64, marker: 'meta', name: 'Box: meta', isSanitizedSafe: false },
        { offset: 96, marker: 'uuid', name: 'Box: uuid', isSanitizedSafe: false },
      ],
      prnuSusceptibility: 'low' as const,
      sha256: 'aaaa',
    },
    auditAfter: {
      fileName: '0123456789abcdef0123456789abcdef.mp4',
      fileSize: 1024,
      mimeType: 'video/mp4',
      hasExif: false,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [],
      markers: [
        { offset: 0, marker: 'ftyp', name: 'Box: ftyp', isSanitizedSafe: true },
      ],
      prnuSusceptibility: 'low' as const,
      sha256: 'bbbb',
    },
    processedAt: 0,
  };

  const vm = buildAuditModalViewModel(videoResult);
  const labels = vm.metrics.map(m => m.label);
  assert.equal(labels.includes('EXIF / TIFF'), false, 'Video audit must not show EXIF-only rows');
  assert.equal(labels.includes('Steganography Deep Decon'), false, 'Video audit must not show image decon row');

  const scopeMetric = vm.metrics.find(m => m.label === 'Sanitization Scope');
  assert.ok(scopeMetric, 'Video audit must include Sanitization Scope row');
  assert.equal(scopeMetric.afterVal, 'Container Only (mdat untouched)');

  const atomsMetric = vm.metrics.find(m => m.label === 'Metadata Atoms');
  assert.ok(atomsMetric, 'Video audit must include Metadata Atoms row');
  assert.equal(atomsMetric.beforeVal, '3 detected');
  assert.equal(atomsMetric.afterVal, 'Clean (3 removed)');

  await withFakeDom((log) => {
    const modal = renderAuditModal(videoResult, () => {}) as unknown as FakeNode;
    assert.equal(log.length, 0, 'audit-modal must never write innerHTML');
    const text = collectNodes(modal).map(n => n.textContent).join('\n');
    assert.ok(text.includes('Container Only (mdat untouched)'));
    assert.ok(text.includes('Clean (3 removed)'));
  });
});

test('P1-UI [MOCK-CONTRACT]: DoDecoderApp.handleDownloadAllZip catches ZipSizeLimitError and surfaces sanitized error via DOM APIs without innerHTML', async () => {
  const { DoDecoderApp } = await import('../src/ui/app');
  const { ZipSizeLimitError } = await import('../src/core/utils/zip-export');

  await withFakeDom(async (innerHtmlLog, body) => {
    const root = (globalThis as any).document.createElement('div') as FakeNode;
    body.appendChild(root);

    const app = new DoDecoderApp(root as unknown as HTMLElement, {
      createZipBundle: async () => {
        throw new ZipSizeLimitError(
          'ARCHIVE_SIZE_EXCEEDED',
          'Archive exceeds 4 GiB <img src=x onerror=alert(1)>\u202e',
          5000000000,
          0xfffffffe
        );
      },
    });

    (app as any).queue.push({
      id: 'done-zip-1',
      file: new File([new Uint8Array([1, 2, 3])], 'sample.jpg', { type: 'image/jpeg' }),
      status: 'done',
      progress: 100,
      result: {
        blob: new Blob(['webp'], { type: 'image/webp' }),
        originalName: 'sample.jpg',
        sanitizedName: '0123456789abcdef0123456789abcdef.webp',
        originalSize: 3,
        sanitizedSize: 4,
        format: 'image/webp',
        sha256: '0'.repeat(64),
        defenseLevel: 'paranoid',
        auditBefore: { fileName: 'sample.jpg', fileSize: 3, mimeType: 'image/jpeg', hasExif: false, hasGps: false, hasThumbnail: false, hasMakerNotes: false, tags: [], markers: [], prnuSusceptibility: 'low', sha256: 'a' },
        auditAfter: { fileName: '0123456789abcdef0123456789abcdef.webp', fileSize: 4, mimeType: 'image/webp', hasExif: false, hasGps: false, hasThumbnail: false, hasMakerNotes: false, tags: [], markers: [], prnuSusceptibility: 'low', sha256: 'b' },
        processedAt: 0,
      },
    });
    app.render();

    const preLogCount = innerHtmlLog.length;
    await (app as any).handleDownloadAllZip();

    // updateQueueView replaces queue-list via DOM APIs without any new innerHTML write
    assert.equal(innerHtmlLog.length, preLogCount, 'ZIP error status update must use zero innerHTML writes');

    const errorEl = root.querySelector('#queue-status-error');
    assert.ok(errorEl, 'Queue status bar must display #queue-status-error on ZIP failure');
    assert.equal(errorEl.getAttribute('role'), 'alert');
    assert.equal(errorEl.textContent.includes('\u202e'), false, 'BiDi control U+202E must be stripped');
    assert.ok(errorEl.textContent.includes('ZIP Export Error: Archive exceeds 4 GiB <img src=x onerror=alert(1)>'));
    assert.equal(collectNodes(errorEl).some(n => n.tagName === 'img'), false, 'No HTML injection');

    // Clearing queue clears the status error cleanly
    app.handleClearQueue();
    assert.equal(root.querySelector('#queue-status-error'), null);
  });
});

// =============================================================================
// P1 Core Hardening: ZIP Blob-parts assembly, 32-char hex filename, moof/traf, 256 MiB cap, originalBlob removal
// =============================================================================

test('P1-ZIP [NODE-VERIFIED]: createSanitizedZipBundle uses Blob parts without full-archive ArrayBuffer duplication and emits 32-char hex .zip name without bundle_ prefix', async () => {
  const { createSanitizedZipBundle } = await import('../src/core/utils/zip-export');

  const dummyAudit = { fileName: '', fileSize: 0, mimeType: 'image/webp', hasExif: false, hasGps: false, hasThumbnail: false, hasMakerNotes: false, tags: [], markers: [], prnuSusceptibility: 'low' as const, sha256: '' };
  const payloadA = new Uint8Array(4096).fill(0x41);
  const payloadB = new Uint8Array(4096).fill(0x42);

  const items = [
    {
      blob: new Blob([payloadA], { type: 'image/webp' }),
      originalName: 'a.jpg',
      sanitizedName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.webp',
      originalSize: payloadA.length,
      sanitizedSize: payloadA.length,
      format: 'image/webp',
      sha256: 'a'.repeat(64),
      defenseLevel: 'paranoid' as const,
      auditBefore: dummyAudit,
      auditAfter: dummyAudit,
      processedAt: 0,
    },
    {
      blob: new Blob([payloadB], { type: 'image/webp' }),
      originalName: 'b.jpg',
      sanitizedName: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.webp',
      originalSize: payloadB.length,
      sanitizedSize: payloadB.length,
      format: 'image/webp',
      sha256: 'b'.repeat(64),
      defenseLevel: 'paranoid' as const,
      auditBefore: dummyAudit,
      auditAfter: dummyAudit,
      processedAt: 0,
    },
  ];

  // Spy on ArrayBuffer and Uint8Array allocations to verify no full-archive contiguous allocation (> 8192 B)
  const OrigArrayBuffer = globalThis.ArrayBuffer;
  const OrigUint8Array = globalThis.Uint8Array;
  let maxAllocBytes = 0;

  (globalThis as any).ArrayBuffer = new Proxy(OrigArrayBuffer, {
    construct(target, args, newTarget) {
      const len = Number(args[0] ?? 0);
      if (len > maxAllocBytes) maxAllocBytes = len;
      return Reflect.construct(target, args, newTarget);
    },
  });
  (globalThis as any).Uint8Array = new Proxy(OrigUint8Array, {
    construct(target, args, newTarget) {
      if (typeof args[0] === 'number' && args[0] > maxAllocBytes) {
        maxAllocBytes = args[0];
      }
      return Reflect.construct(target, args, newTarget);
    },
  });

  let bundle1!: { zipBlob: Blob; zipFileName: string };
  try {
    bundle1 = await createSanitizedZipBundle(items);
  } finally {
    (globalThis as any).ArrayBuffer = OrigArrayBuffer;
    (globalThis as any).Uint8Array = OrigUint8Array;
  }

  assert.ok(
    maxAllocBytes < payloadA.length + payloadB.length,
    `ZIP assembly must not allocate a full-archive contiguous buffer; maxAllocBytes=${maxAllocBytes}`
  );
  assert.equal(bundle1.zipFileName.startsWith('bundle_'), false, 'ZIP filename must not use bundle_ prefix');
  assert.match(bundle1.zipFileName, /^[0-9a-f]{32}\.zip$/, `Expected 32-char lowercase hex .zip name, got ${bundle1.zipFileName}`);

  // Deterministic filename for identical inputs
  const bundle2 = await createSanitizedZipBundle(items);
  assert.equal(bundle1.zipFileName, bundle2.zipFileName, 'ZIP filename must be deterministic for identical entries');

  // Verify ZIP binary integrity (LFH, exact file payloads, CD, EOCD) after temporary buffers were wiped
  const zBytes = new Uint8Array(await bundle1.zipBlob.arrayBuffer());
  const dv = new DataView(zBytes.buffer, zBytes.byteOffset, zBytes.byteLength);
  let pos = 0;
  const extracted: Array<{ name: string; data: Uint8Array }> = [];
  while (pos + 30 <= zBytes.length && dv.getUint32(pos, true) === 0x04034b50) {
    assert.equal(dv.getUint16(pos + 10, true), 0x0000);
    assert.equal(dv.getUint16(pos + 12, true), 0x0021);
    const size = dv.getUint32(pos + 18, true);
    const nameLen = dv.getUint16(pos + 26, true);
    const extraLen = dv.getUint16(pos + 28, true);
    const name = new TextDecoder().decode(zBytes.subarray(pos + 30, pos + 30 + nameLen));
    const dataStart = pos + 30 + nameLen + extraLen;
    extracted.push({ name, data: zBytes.subarray(dataStart, dataStart + size) });
    pos = dataStart + size;
  }
  assert.equal(extracted.length, 2);
  assert.deepEqual(extracted[0].data, payloadA);
  assert.deepEqual(extracted[1].data, payloadB);
  assert.equal(dv.getUint32(pos, true), 0x02014b50, 'Central Directory must immediately follow entries');
  assert.equal(dv.getUint32(zBytes.length - 22, true), 0x06054b50, 'EOCD signature must terminate archive');
});

test('P1-MP4 [NODE-VERIFIED]: fragmented MP4 (moof/traf) scrubs nested uuid/udta metadata in-place while preserving exact size and mdat', async () => {
  const { sanitizeMedia } = await import('../src/core/media/media-sanitizer');
  const enc = new TextEncoder();

  const ftyp = makeBox('ftyp', enc.encode('isom\0\0\x02\0isommp41'));
  const mvhd = makeBox('mvhd', new Uint8Array(96));
  const moov = makeBox('moov', mvhd);
  const mfhd = makeBox('mfhd', new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]));
  const tfhd = makeBox('tfhd', new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]));
  const fragUuid = makeBox('uuid', enc.encode('FRAG_SECRET_UUID_1234'));
  const fragUdta = makeBox('udta', enc.encode('FRAG_GPS_LEAK_5678'));
  const traf = makeBox('traf', concatBytes([tfhd, fragUuid, fragUdta]));
  const moof = makeBox('moof', concatBytes([mfhd, traf]));
  const mdatPayload = enc.encode('FRAGMENT_BITSTREAM_DATA');
  const mdat = makeBox('mdat', mdatPayload);

  const fmp4 = concatBytes([ftyp, moov, moof, mdat]);
  const result = await sanitizeMedia(new File([fmp4], 'fragmented.mp4', { type: 'video/mp4' }), {
    defenseLevel: 'paranoid',
  });

  const outBytes = new Uint8Array(await result.blob.arrayBuffer());
  const outText = new TextDecoder().decode(outBytes);

  assert.equal(outBytes.byteLength, fmp4.byteLength, 'Fragmented MP4 byte length must be preserved');
  assert.equal(outText.includes('FRAG_SECRET_UUID_1234'), false, 'uuid inside moof/traf must be scrubbed');
  assert.equal(outText.includes('FRAG_GPS_LEAK_5678'), false, 'udta inside moof/traf must be scrubbed');
  assert.equal(outText.includes('FRAGMENT_BITSTREAM_DATA'), true, 'mdat bitstream must remain untouched');
  assert.equal('originalBlob' in result, false, 'SanitizedResult must not retain unused originalBlob');
  assert.ok(result.auditBefore.markers.some(m => m.marker === 'uuid' && !m.isSanitizedSafe), 'auditBefore must detect uuid inside moof/traf');
  assert.equal(result.auditAfter.markers.some(m => !m.isSanitizedSafe), false, 'auditAfter must report zero unsafe atoms');
});

test('P1-LIMIT [NODE-VERIFIED]: 256 MiB MP4/MOV cap rejects before arrayBuffer() in both sanitizeMedia and analyzeForensics', async () => {
  const { sanitizeMedia, MediaFileSizeLimitError, MAX_MEDIA_FILE_BYTES } = await import('../src/core/media/media-sanitizer');
  const { analyzeForensics } = await import('../src/core/forensic/exif-inspector');

  assert.equal(MAX_MEDIA_FILE_BYTES, 256 * 1024 * 1024);

  let arrayBufferCalls = 0;
  let sliceCalls = 0;
  const oversizedMp4Blob = {
    size: MAX_MEDIA_FILE_BYTES + 1,
    type: 'video/mp4',
    slice: () => {
      sliceCalls++;
      return {
        arrayBuffer: async () => {
          arrayBufferCalls++;
          return new ArrayBuffer(0);
        },
      };
    },
    arrayBuffer: async () => {
      arrayBufferCalls++;
      return new ArrayBuffer(0);
    },
  } as unknown as Blob;

  await assert.rejects(
    () => sanitizeMedia(oversizedMp4Blob, { defenseLevel: 'paranoid' }),
    (err: unknown) =>
      err instanceof MediaFileSizeLimitError &&
      err.code === 'MEDIA_FILE_SIZE_LIMIT_EXCEEDED' &&
      err.actualBytes === MAX_MEDIA_FILE_BYTES + 1 &&
      err.maxBytes === MAX_MEDIA_FILE_BYTES
  );
  assert.equal(arrayBufferCalls, 0, 'sanitizeMedia must reject >256 MiB MP4/MOV before calling arrayBuffer()');
  assert.equal(sliceCalls, 0, 'sanitizeMedia must reject >256 MiB MP4/MOV before calling slice()');

  const report = await analyzeForensics(oversizedMp4Blob, 'huge.mov');
  assert.equal(arrayBufferCalls, 0, 'analyzeForensics must skip arrayBuffer() for >256 MiB MP4/MOV');
  assert.equal(report.exifParseResult.ok, false);
  if (!report.exifParseResult.ok) {
    assert.equal(report.exifParseResult.code, 'FILE_TOO_LARGE');
  }
});

// =============================================================================
// P2: Dead code deletion, DOM-API dropzone/legal-modal, PRNU/decon hygiene, cleanBytes zeroization, metadata
// =============================================================================

test('P2-CLEANUP [NODE-VERIFIED]: gpu-mask.ts and icons.ts are deleted; dropzone and legal-modal render via DOM APIs with 2026 copyright', async () => {
  assert.equal(fs.existsSync(path.join(REPO_ROOT, 'src', 'core', 'image', 'gpu-mask.ts')), false, 'gpu-mask.ts must be deleted');
  assert.equal(fs.existsSync(path.join(REPO_ROOT, 'src', 'ui', 'icons.ts')), false, 'src/ui/icons.ts must be deleted');

  const { renderDropzone } = await import('../src/ui/components/dropzone');
  const { renderLegalModal } = await import('../src/ui/components/legal-modal');

  await withFakeDom((log) => {
    const dz = renderDropzone(() => {}) as unknown as FakeNode;
    const legal = renderLegalModal(() => {}) as unknown as FakeNode;
    assert.equal(log.length, 0, 'dropzone.ts and legal-modal.ts must not use innerHTML');

    const dzNodes = collectNodes(dz);
    assert.ok(dzNodes.some(n => n.tagName === 'svg' && n.namespaceURI === 'http://www.w3.org/2000/svg'));
    const fileInput = dz.querySelector('#file-input');
    assert.ok(fileInput && fileInput.getAttribute('accept')?.includes('video/mp4'));

    const legalNodes = collectNodes(legal);
    assert.ok(legalNodes.some(n => n.tagName === 'svg' && n.namespaceURI === 'http://www.w3.org/2000/svg'));
    const legalText = legalNodes.map(n => n.textContent).join('\n');
    assert.ok(legalText.includes('Copyright (c) 2026'), 'legal-modal must reflect 2026 copyright');
    assert.equal(legalText.includes('2024'), false, 'legal-modal must not contain stale 2024 copyright');
  });
});

test('P2-HYGIENE [NODE-VERIFIED]: PRNU skips pre-median monochrome noise, cleanBytes zeroed after finalize, decontamination cleaned, and v2.0.0 metadata synced', async () => {
  const { applyPrnuDefense, CALIBRATED_MAX_DELTA_LUMA } = await import('../src/core/image/prnu-defense');
  const { sanitizeImage } = await import('../src/core/image/image-sanitizer');

  assert.equal(CALIBRATED_MAX_DELTA_LUMA, 8.0);

  // Uniform 16x16 gray image through applyPrnuDefense should remain uniform (no pre-median monochrome noise injected)
  const w = 16;
  const h = 16;
  const uniform = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < uniform.length; i += 4) {
    uniform[i] = 128;
    uniform[i + 1] = 128;
    uniform[i + 2] = 128;
    uniform[i + 3] = 255;
  }
  let stored = new Uint8ClampedArray(uniform);
  const mockCanvas = {
    width: w,
    height: h,
    getContext: () => ({
      clearRect() {},
      drawImage() {},
      getImageData: () => ({ data: new Uint8ClampedArray(stored), width: w, height: h }),
      putImageData: (img: { data: Uint8ClampedArray }) => {
        stored = new Uint8ClampedArray(img.data);
      },
    }),
  };
  applyPrnuDefense(mockCanvas as any, mockCanvas as any, 'paranoid', false);
  for (let i = 0; i < stored.length; i += 4) {
    assert.equal(stored[i], 128, 'Uniform flat image must not receive pre-median monochromatic noise in applyPrnuDefense');
    assert.equal(stored[i + 1], 128);
    assert.equal(stored[i + 2], 128);
    assert.equal(stored[i + 3], 255);
  }

  // Verify sanitizeImage zeroes cleanBytes in try/finally after finalizeSanitizedOutput and omits originalBlob
  const vp8Payload = new Uint8Array([0x30, 0x01, 0x00, 0x9d]);
  const returnedBuf = new ArrayBuffer(12 + 8 + vp8Payload.length);
  const returnedU8 = new Uint8Array(returnedBuf);
  const rdv = new DataView(returnedBuf);
  returnedU8.set([0x52, 0x49, 0x46, 0x46], 0);
  rdv.setUint32(4, 4 + 8 + vp8Payload.length, true);
  returnedU8.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20], 8);
  rdv.setUint32(16, vp8Payload.length, true);
  returnedU8.set(vp8Payload, 20);

  const origWorker = (globalThis as any).Worker;
  (globalThis as any).Worker = class MockCleanWorker {
    onmessage: ((e: { data: unknown }) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    postMessage() {
      queueMicrotask(() => {
        this.onmessage?.({ data: { buffer: returnedBuf, tilesProcessed: 1 } });
      });
    }
    terminate() {}
  };
  try {
    const validJpeg = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x10, 0x00, 0x10, 0x01, 0x01, 0x11, 0x00,
      0xff, 0xd9,
    ]);
    const res = await sanitizeImage(new File([validJpeg], 'x.jpg', { type: 'image/jpeg' }), { defenseLevel: 'paranoid' });
    assert.equal('originalBlob' in res, false, 'Image SanitizedResult must not retain originalBlob');
    assert.ok(returnedU8.every(b => b === 0), 'cleanBytes buffer must be zeroed in try/finally after finalizeSanitizedOutput');
    const delivered = new Uint8Array(await res.blob.arrayBuffer());
    assert.equal(delivered[0], 0x52, 'Finalized blob must retain immutable snapshot of WebP bytes after cleanBytes zeroization');
  } finally {
    if (origWorker === undefined) delete (globalThis as any).Worker;
    else (globalThis as any).Worker = origWorker;
  }

  // Static hygiene checks on decontamination.ts, prnu-defense.ts, README.md, package.json, package-lock.json
  const deconSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'core', 'image', 'decontamination.ts'), 'utf8');
  assert.equal(deconSrc.includes('const framebuffer'), false, 'Dead framebuffer variable must be removed');
  assert.equal(deconSrc.includes('Deterministic discrete level'), false, 'Stale Deterministic dithering comment must be removed');

  const prnuSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'core', 'image', 'prnu-defense.ts'), 'utf8');
  assert.equal(prnuSrc.includes('injectStochasticCamouflageNoise'), false, 'Redundant pre-median noise helper must be removed');
  const applyFnBody = prnuSrc.slice(prnuSrc.indexOf('export function applyPrnuDefense('));
  const dwtCallIdx = applyFnBody.indexOf('applyWaveletPRNUAttenuation(');
  const affineCallIdx = applyFnBody.indexOf('applyBicubicMicroAffine(');
  assert.ok(dwtCallIdx > 0 && affineCallIdx > 0 && dwtCallIdx < affineCallIdx, 'DWT must remain before micro-affine inside applyPrnuDefense');

  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  const pkgLock = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package-lock.json'), 'utf8'));
  assert.equal(pkg.version, '2.0.0');
  assert.equal(pkgLock.version, '2.0.0');
  assert.equal(pkgLock.packages[''].version, '2.0.0');

  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
  assert.ok(readme.includes('Copyright (c) 2026'));
  assert.equal(readme.includes('2024'), false);
});
