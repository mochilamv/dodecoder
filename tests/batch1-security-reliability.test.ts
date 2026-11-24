import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(process.cwd());

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

test('AUD-23 [NODE-VERIFIED]: zero WebAssembly binaries or loader code remain in src/', () => {
  const srcDir = path.join(REPO_ROOT, 'src');
  const srcFiles = walkFiles(srcDir);

  const wasmFiles = srcFiles.filter(f => f.toLowerCase().endsWith('.wasm'));
  assert.deepEqual(
    wasmFiles,
    [],
    `Expected zero .wasm files under src/, found: ${wasmFiles.join(', ')}`
  );

  assert.equal(
    fs.existsSync(path.join(srcDir, 'core', 'wasm', 'deterministic_encoder.wasm')),
    false,
    'deterministic_encoder.wasm must be removed'
  );
  assert.equal(
    fs.existsSync(path.join(srcDir, 'core', 'image', 'wasm-encoder.ts')),
    false,
    'wasm-encoder.ts dead loader must be removed'
  );

  const badRefs: string[] = [];
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (
      content.includes('deterministic_encoder') ||
      content.includes('wasm-encoder') ||
      content.includes('WebAssembly')
    ) {
      badRefs.push(path.relative(REPO_ROOT, file));
    }
  }
  assert.deepEqual(
    badRefs,
    [],
    `Found stale WASM loader or binary references in src/: ${badRefs.join(', ')}`
  );

  const distDir = path.join(REPO_ROOT, 'dist');
  if (fs.existsSync(distDir)) {
    const distWasm = walkFiles(distDir).filter(f => f.toLowerCase().endsWith('.wasm'));
    assert.deepEqual(
      distWasm,
      [],
      `Production build output dist/ must ship zero .wasm files, found: ${distWasm.join(', ')}`
    );
  }
});

// --- Recording Fake DOM for MOCK-CONTRACT UI Verification ---
interface RecordedInnerHtmlWrite {
  tagName: string;
  html: string;
}

class FakeElement {
  public readonly tagName: string;
  public readonly namespaceURI: string | null;
  public className = '';
  public id = '';
  public textContent = '';
  public attributes = new Map<string, string>();
  public children: FakeElement[] = [];
  public parentElement: FakeElement | null = null;
  public listeners = new Map<string, Array<(e?: any) => void>>();
  public style: Record<string, string> = {};
  public focused = false;
  public removed = false;
  private _innerHTML = '';
  private readonly innerHtmlLog: RecordedInnerHtmlWrite[];

  constructor(
    tagName: string,
    innerHtmlLog: RecordedInnerHtmlWrite[],
    namespaceURI: string | null = null
  ) {
    this.tagName = tagName.toLowerCase();
    this.namespaceURI = namespaceURI;
    this.innerHtmlLog = innerHtmlLog;
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set innerHTML(val: string) {
    this._innerHTML = val;
    this.innerHtmlLog.push({ tagName: this.tagName, html: val });
    this.children = [];
    if (val) {
      // Minimal stub child registration for untouched static templates (e.g. dropzone #file-input)
      for (const match of val.matchAll(/\bid\s*=\s*"([^"]+)"/g)) {
        const stub = new FakeElement('div', this.innerHtmlLog);
        stub.id = match[1];
        stub.attributes.set('id', match[1]);
        this.appendChild(stub);
      }
    }
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

  appendChild(child: FakeElement): FakeElement {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  addEventListener(event: string, handler: (e?: any) => void): void {
    const list = this.listeners.get(event) ?? [];
    list.push(handler);
    this.listeners.set(event, list);
  }

  dispatch(event: string, payload?: any): void {
    const list = this.listeners.get(event) ?? [];
    for (const fn of list) fn(payload);
  }

  querySelector(selector: string): FakeElement | null {
    const matches = (el: FakeElement): boolean => {
      if (selector.startsWith('#')) {
        return el.id === selector.slice(1) || el.attributes.get('id') === selector.slice(1);
      }
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        return el.className.split(/\s+/).includes(cls);
      }
      return el.tagName === selector.toLowerCase();
    };
    const queue: FakeElement[] = [...this.children];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (matches(cur)) return cur;
      queue.push(...cur.children);
    }
    return null;
  }

  replaceWith(next: FakeElement): void {
    if (!this.parentElement) return;
    const idx = this.parentElement.children.indexOf(this);
    if (idx >= 0) {
      next.parentElement = this.parentElement;
      this.parentElement.children[idx] = next;
      this.parentElement = null;
    }
  }

  remove(): void {
    this.removed = true;
    if (this.parentElement) {
      this.parentElement.children = this.parentElement.children.filter(c => c !== this);
      this.parentElement = null;
    }
  }

  removeChild(child: FakeElement): FakeElement {
    this.children = this.children.filter(c => c !== child);
    child.parentElement = null;
    return child;
  }

  get firstChild(): FakeElement | null {
    return this.children[0] ?? null;
  }

  click(): void {
    this.dispatch('click');
  }

  focus(): void {
    this.focused = true;
  }
}

function collectFakeTree(root: FakeElement): FakeElement[] {
  const out: FakeElement[] = [root];
  for (const c of root.children) {
    out.push(...collectFakeTree(c));
  }
  return out;
}

function withFakeDocument<T>(fn: (innerHtmlLog: RecordedInnerHtmlWrite[], body: FakeElement) => T): T {
  const prevDoc = (globalThis as any).document;
  const innerHtmlLog: RecordedInnerHtmlWrite[] = [];
  const body = new FakeElement('body', innerHtmlLog);

  (globalThis as any).document = {
    body,
    createElement: (tag: string) => new FakeElement(tag, innerHtmlLog, null),
    createElementNS: (ns: string, tag: string) => new FakeElement(tag, innerHtmlLog, ns),
  };

  try {
    return fn(innerHtmlLog, body);
  } finally {
    if (prevDoc === undefined) {
      delete (globalThis as any).document;
    } else {
      (globalThis as any).document = prevDoc;
    }
  }
}

async function withFakeDocumentAsync<T>(
  fn: (innerHtmlLog: RecordedInnerHtmlWrite[], body: FakeElement) => Promise<T>
): Promise<T> {
  const prevDoc = (globalThis as any).document;
  const innerHtmlLog: RecordedInnerHtmlWrite[] = [];
  const body = new FakeElement('body', innerHtmlLog);

  (globalThis as any).document = {
    body,
    createElement: (tag: string) => new FakeElement(tag, innerHtmlLog, null),
    createElementNS: (ns: string, tag: string) => new FakeElement(tag, innerHtmlLog, ns),
  };

  try {
    return await fn(innerHtmlLog, body);
  } finally {
    if (prevDoc === undefined) {
      delete (globalThis as any).document;
    } else {
      (globalThis as any).document = prevDoc;
    }
  }
}

function parseMetaCsp(html: string): Map<string, string[]> {
  const metaTagMatch = html.match(/<meta\b[^>]*http-equiv\s*=\s*(?:"Content-Security-Policy"|'Content-Security-Policy')[^>]*>/i);
  assert.ok(metaTagMatch, 'HTML must contain a meta Content-Security-Policy element');
  const tag = metaTagMatch[0];
  const contentMatch = tag.match(/\bcontent\s*=\s*"([^"]+)"/i) ?? tag.match(/\bcontent\s*=\s*'([^']+)'/i);
  assert.ok(contentMatch, 'CSP meta element must have a non-empty content attribute');
  const content = contentMatch[1];
  const map = new Map<string, string[]>();
  for (const rawDirective of content.split(';')) {
    const trimmed = rawDirective.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    const name = parts[0].toLowerCase();
    const values = parts.slice(1);
    map.set(name, values);
  }
  return map;
}

const XSS_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '" onmouseover="alert(1)" data-x=\'',
  '</script><script>alert(1)</script>',
  'invoice_\u202egpj.exe',
];

test('AUD-17 (Report AUD-21) [MOCK-CONTRACT]: queue-list renders adversarial payloads via DOM APIs with zero innerHTML and strips U+202E', async () => {
  const { renderQueueList } = await import('../src/ui/components/queue-list');
  const { QueueItem } = {} as any;
  void QueueItem;

  const items = XSS_PAYLOADS.map((payload, idx) => ({
    id: `item-${idx}`,
    file: new File([new Uint8Array([1, 2, 3])], payload, { type: 'image/jpeg' }),
    status: idx % 2 === 0 ? ('done' as const) : ('error' as const),
    progress: 100,
    error: idx % 2 === 1 ? `Failed for ${payload}` : undefined,
    result: idx % 2 === 0
      ? {
          blob: new Blob(['ok'], { type: 'image/webp' }),
          originalName: payload,
          sanitizedName: `safe_${payload}.webp`,
          originalSize: 123,
          sanitizedSize: 99,
          format: 'image/webp',
          sha256: `sha_${payload}`,
          defenseLevel: 'paranoid' as const,
          auditBefore: {
            fileName: payload,
            fileSize: 123,
            mimeType: payload,
            hasExif: true,
            hasGps: true,
            hasThumbnail: true,
            hasMakerNotes: true,
            tags: [],
            markers: [],
            prnuSusceptibility: 'high' as const,
            sha256: `before_${payload}`,
          },
          auditAfter: {
            fileName: `safe_${payload}.webp`,
            fileSize: 99,
            mimeType: payload,
            hasExif: false,
            hasGps: false,
            hasThumbnail: false,
            hasMakerNotes: false,
            tags: [],
            markers: [],
            prnuSusceptibility: 'low' as const,
            sha256: `after_${payload}`,
          },
          processedAt: 0,
          isDeepDecontaminated: true,
        }
      : undefined,
  }));

  withFakeDocument((innerHtmlLog) => {
    const root = renderQueueList(items, {
      onDownloadSingle: () => {},
      onDownloadAllZip: () => {},
      onInspectForensics: () => {},
      onClearQueue: () => {},
    }) as unknown as FakeElement;

    assert.equal(
      innerHtmlLog.length,
      0,
      `queue-list must not use innerHTML; observed ${innerHtmlLog.length} writes`
    );

    const nodes = collectFakeTree(root);
    const allTexts = nodes.map(n => n.textContent).join('\n');
    const allAttrValues = nodes.flatMap(n => Array.from(n.attributes.values())).join('\n');

    // No element should ever contain raw U+202E BiDi override
    assert.equal(allTexts.includes('\u202e'), false, 'Rendered textContent must strip U+202E');
    assert.equal(allAttrValues.includes('\u202e'), false, 'Rendered attributes must strip U+202E');

    // HTML/script/quote payloads must appear safely as literal textContent, never injected nodes
    assert.equal(nodes.some(n => n.tagName === 'img' || n.tagName === 'script'), false);
    assert.ok(allTexts.includes('<img src=x onerror=alert(1)>'));
    assert.ok(allTexts.includes('</script><script>alert(1)</script>'));
    assert.ok(allTexts.includes('" onmouseover="alert(1)" data-x=\''));
  });
});

test('AUD-17 (Report AUD-21) [MOCK-CONTRACT]: audit-modal renders adversarial payloads via DOM APIs with zero innerHTML and strips U+202E', async () => {
  const { renderAuditModal } = await import('../src/ui/components/audit-modal');

  for (const payload of XSS_PAYLOADS) {
    const result = {
      blob: new Blob(['ok'], { type: 'image/webp' }),
      originalName: payload,
      sanitizedName: `out_${payload}`,
      originalSize: 2048,
      sanitizedSize: 1024,
      format: 'image/webp',
      sha256: `sha_${payload}`,
      defenseLevel: 'paranoid' as const,
      auditBefore: {
        fileName: payload,
        fileSize: 2048,
        mimeType: `mime_before_${payload}`,
        hasExif: true,
        hasGps: true,
        hasThumbnail: true,
        hasMakerNotes: true,
        tags: [],
        markers: [],
        prnuSusceptibility: 'high' as const,
        sha256: `hash_before_${payload}`,
      },
      auditAfter: {
        fileName: `out_${payload}`,
        fileSize: 1024,
        mimeType: `mime_after_${payload}`,
        hasExif: false,
        hasGps: false,
        hasThumbnail: false,
        hasMakerNotes: false,
        tags: [],
        markers: [],
        prnuSusceptibility: 'low' as const,
        sha256: `hash_after_${payload}`,
      },
      processedAt: 0,
      isDeepDecontaminated: true,
    };

    withFakeDocument((innerHtmlLog) => {
      const overlay = renderAuditModal(result, () => {}) as unknown as FakeElement;

      assert.equal(
        innerHtmlLog.length,
        0,
        `audit-modal must not use innerHTML; observed ${innerHtmlLog.length} writes`
      );

      const nodes = collectFakeTree(overlay);
      const allTexts = nodes.map(n => n.textContent).join('\n');
      const allAttrValues = nodes.flatMap(n => Array.from(n.attributes.values())).join('\n');

      assert.equal(allTexts.includes('\u202e'), false, 'Modal textContent must strip U+202E');
      assert.equal(allAttrValues.includes('\u202e'), false, 'Modal attributes must strip U+202E');
      assert.equal(nodes.some(n => n.tagName === 'img' || n.tagName === 'script'), false);

      const expected = payload.replace(/\u202e/g, '');
      assert.ok(allTexts.includes(expected), `Expected sanitized literal text "${expected}" in modal`);
      assert.ok(allTexts.includes(`mime_before_${expected}`));
      assert.ok(allTexts.includes(`mime_after_${expected}`));
      assert.ok(allTexts.includes(`hash_before_${expected}`));
      assert.ok(allTexts.includes(`hash_after_${expected}`));
    });
  }
});

test('AUD-17 (Report AUD-21) [NODE-VERIFIED]: index.html and dist/index.html enforce hardened meta CSP without WASM or unsafe directives', () => {
  const indexHtmlPath = path.join(REPO_ROOT, 'index.html');
  assert.ok(fs.existsSync(indexHtmlPath), `Expected HTML file at ${indexHtmlPath}`);

  const htmlPaths = [indexHtmlPath];
  const distHtmlPath = path.join(REPO_ROOT, 'dist', 'index.html');
  if (fs.existsSync(distHtmlPath)) {
    htmlPaths.push(distHtmlPath);
  }

  for (const htmlPath of htmlPaths) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const csp = parseMetaCsp(html);

    assert.deepEqual(csp.get('default-src'), ["'none'"], `${htmlPath}: default-src must be 'none'`);
    const scriptSrc = csp.get('script-src') ?? [];
    assert.deepEqual(scriptSrc, ["'self'"], `${htmlPath}: script-src must be strictly 'self'`);
    for (const forbidden of ["'unsafe-inline'", "'unsafe-eval'", "'wasm-unsafe-eval'", '*']) {
      assert.equal(scriptSrc.includes(forbidden), false, `${htmlPath}: script-src must forbid ${forbidden}`);
    }

    const styleSrc = csp.get('style-src') ?? [];
    assert.deepEqual(styleSrc, ["'self'"], `${htmlPath}: style-src must be strictly 'self'`);
    assert.equal(styleSrc.includes("'unsafe-inline'"), false);

    const imgSrc = csp.get('img-src') ?? [];
    assert.equal(imgSrc.includes('*'), false, `${htmlPath}: img-src must not allow wildcard *`);
    assert.ok(imgSrc.includes("'self'") && imgSrc.includes('blob:') && imgSrc.includes('data:'));

    const mediaSrc = csp.get('media-src') ?? [];
    assert.equal(mediaSrc.includes('*'), false, `${htmlPath}: media-src must not allow wildcard *`);
    assert.ok(mediaSrc.includes("'self'") && mediaSrc.includes('blob:') && mediaSrc.includes('data:'));

    const workerSrc = csp.get('worker-src') ?? [];
    assert.ok(workerSrc.includes("'self'") && workerSrc.includes('blob:'));

    assert.deepEqual(csp.get('object-src'), ["'none'"], `${htmlPath}: object-src must be 'none'`);
    assert.ok((csp.get('base-uri') ?? []).length > 0, `${htmlPath}: base-uri must be explicit`);
    assert.ok((csp.get('form-action') ?? []).length > 0, `${htmlPath}: form-action must be explicit`);

    // Meta-delivered CSP must not rely on directives ignored by browsers per HTML spec
    for (const ignored of ['frame-ancestors', 'report-uri', 'sandbox']) {
      assert.equal(csp.has(ignored), false, `${htmlPath}: meta CSP must not contain ignored directive ${ignored}`);
    }
  }
});

test('AUD-17 (Report AUD-21) [NODE-VERIFIED]: pure UI sanitization and view-model helpers neutralize BiDi controls and preserve literal payload text', async () => {
  const { sanitizeDisplayText, formatBytes, buildQueueItemViewModel } = await import('../src/ui/components/queue-list');
  const { buildAuditModalViewModel } = await import('../src/ui/components/audit-modal');

  assert.equal(sanitizeDisplayText('invoice_\u202egpj.exe'), 'invoice_gpj.exe');
  assert.equal(sanitizeDisplayText('a\u202ab\u202ec\u2066d\u2069e\u200ef\u200fg\u061ch\x00i\x1fj'), 'abcdefghij');
  assert.equal(sanitizeDisplayText('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
  assert.equal(sanitizeDisplayText('" onmouseover="alert(1)"'), '" onmouseover="alert(1)"');
  assert.equal(sanitizeDisplayText('</script><script>alert(1)</script>'), '</script><script>alert(1)</script>');

  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(-5), '0 B');
  assert.equal(formatBytes(Number.NaN), '0 B');
  assert.equal(formatBytes(1024), '1 KB');

  const vm = buildQueueItemViewModel({
    id: 'q1',
    file: new File([new Uint8Array(16)], 'photo_\u202egnp.exe', { type: 'image/png' }),
    status: 'error',
    progress: 150,
    error: 'Bad <script>\u202e',
  });
  assert.equal(vm.fileName, 'photo_gnp.exe');
  assert.equal(vm.progressPercent, 100);
  assert.equal(vm.errorMessage, 'Error: Bad <script>');

  const modalVm = buildAuditModalViewModel({
    blob: new Blob(['x'], { type: 'image/webp' }),
    originalName: '"><img src=x>\u202e',
    sanitizedName: 'clean_\u202e.webp',
    originalSize: 512,
    sanitizedSize: 256,
    format: 'image/webp',
    sha256: 'abc',
    defenseLevel: 'paranoid',
    auditBefore: {
      fileName: 'orig',
      fileSize: 512,
      mimeType: '</script>\u202e',
      hasExif: true,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [],
      markers: [],
      prnuSusceptibility: 'high',
      sha256: 'dead\u202ebeef',
    },
    auditAfter: {
      fileName: 'clean',
      fileSize: 256,
      mimeType: 'image/webp\u202e',
      hasExif: false,
      hasGps: false,
      hasThumbnail: false,
      hasMakerNotes: false,
      tags: [],
      markers: [],
      prnuSusceptibility: 'low',
      sha256: 'cafe\u202ebabe',
    },
    processedAt: 0,
    isDeepDecontaminated: true,
  });
  assert.equal(modalVm.originalName, '"><img src=x>');
  assert.equal(modalVm.sanitizedName, 'clean_.webp');
  assert.equal(modalVm.beforeSha256, 'deadbeef');
  assert.equal(modalVm.afterSha256, 'cafebabe');
  assert.equal(modalVm.metrics[0].beforeVal, '</script>');
  assert.equal(modalVm.metrics[0].afterVal, 'image/webp');
});

test('AUD-20 [MOCK-CONTRACT / NODE-VERIFIED]: handleClearQueue empties queue, cancels in-flight work, discards late results, revokes object URLs, closes bitmaps, avoids placebo arrayBuffer copy, and clears DOM', async () => {
  const { DoDecoderApp } = await import('../src/ui/app');

  let arrayBufferReads = 0;
  const revokedUrls: string[] = [];
  let createdUrlSeq = 0;
  let bitmapClosedCount = 0;
  let receivedSignal: AbortSignal | undefined;
  let resolveInFlight!: (res: any) => void;
  let onProgressInFlight: ((pct: number) => void) | undefined;

  const prevCreateObjectURL = URL.createObjectURL;
  const prevRevokeObjectURL = URL.revokeObjectURL;
  URL.createObjectURL = () => `blob:mock-${++createdUrlSeq}`;
  URL.revokeObjectURL = (url: string) => {
    revokedUrls.push(url);
  };

  try {
    await withFakeDocumentAsync(async (_innerHtmlLog, body) => {
      const root = (globalThis as any).document.createElement('div') as FakeElement;
      body.appendChild(root);

      const app = new DoDecoderApp(root as unknown as HTMLElement, {
        processFile: async (_file: File, opts?: any, onProgress?: (pct: number) => void) => {
          receivedSignal = opts?.signal;
          onProgressInFlight = onProgress;
          return await new Promise(resolve => {
            resolveInFlight = resolve;
          });
        },
        triggerDownload: (blob: Blob, _fileName: string) => {
          return URL.createObjectURL(blob);
        },
      } as any);

      // Verify handleClearQueue is exposed and manages resources
      const fakeBitmap = {
        width: 4,
        height: 4,
        close: () => {
          bitmapClosedCount++;
        },
      } as unknown as ImageBitmap;

      const doneBlob = new Blob(['done-data'], { type: 'image/webp' });
      const origArrayBuffer = doneBlob.arrayBuffer.bind(doneBlob);
      doneBlob.arrayBuffer = async () => {
        arrayBufferReads++;
        return origArrayBuffer();
      };

      const doneResult = {
        blob: doneBlob,
        originalName: 'done.jpg',
        sanitizedName: 'clean.webp',
        originalSize: 10,
        sanitizedSize: 9,
        format: 'image/webp',
        sha256: 'abc123',
        defenseLevel: 'paranoid' as const,
        auditBefore: {
          fileName: 'done.jpg',
          fileSize: 10,
          mimeType: 'image/jpeg',
          hasExif: false,
          hasGps: false,
          hasThumbnail: false,
          hasMakerNotes: false,
          tags: [],
          markers: [],
          prnuSusceptibility: 'low' as const,
          sha256: 'orig',
        },
        auditAfter: {
          fileName: 'clean.webp',
          fileSize: 9,
          mimeType: 'image/webp',
          hasExif: false,
          hasGps: false,
          hasThumbnail: false,
          hasMakerNotes: false,
          tags: [],
          markers: [],
          prnuSusceptibility: 'low' as const,
          sha256: 'abc123',
        },
        processedAt: 0,
      };

      // Seed one done item + open audit modal + download URL + managed bitmap + one in-flight item
      (app as any).queue.push({
        id: 'done-1',
        file: new File([new Uint8Array([1])], 'done.jpg', { type: 'image/jpeg' }),
        status: 'done',
        progress: 100,
        result: doneResult,
      });
      (app as any).handleDownloadSingle((app as any).queue[0]);
      (app as any).handleInspectForensics((app as any).queue[0]);
      if (typeof (app as any).registerManagedBitmap === 'function') {
        (app as any).registerManagedBitmap(fakeBitmap);
      }

      // Add an in-flight file
      (app as any).handleFilesAdded([
        new File([new Uint8Array([2])], 'inflight.jpg', { type: 'image/jpeg' }),
      ]);

      // Allow processQueue to start
      await Promise.resolve();

      // Clear queue while job is still in-flight
      (app as any).handleClearQueue();

      // Contract 1: queue state is immediately empty
      assert.equal((app as any).queue.length, 0, 'Queue must be empty immediately after clear');

      // Contract 2: no placebo blob.arrayBuffer() copy allocation
      assert.equal(arrayBufferReads, 0, 'handleClearQueue must not call placebo blob.arrayBuffer()');

      // Contract 3: in-flight work cancelled via AbortController
      assert.ok(receivedSignal, 'In-flight processor must receive an AbortSignal');
      assert.equal(receivedSignal!.aborted, true, 'AbortSignal must be aborted on clear');

      // Contract 4: tracked object URLs revoked immediately
      assert.ok(revokedUrls.length >= 1, 'Object URLs created before clear must be revoked on clear');

      // Contract 5: managed bitmaps closed on clear
      assert.equal(bitmapClosedCount, 1, 'Managed bitmaps must be closed on clear');

      // Contract 6: UI/DOM state cleared (no queue container, active audit modal closed)
      assert.equal(root.querySelector('#queue-items-container'), null, 'Queue DOM must be cleared');
      assert.equal((app as any).activeAuditModal, null, 'Active audit modal must be closed on clear');

      // Contract 7 (async race): late progress and late resolution MUST NOT repopulate queue or DOM
      onProgressInFlight?.(85);
      resolveInFlight?.(doneResult);
      await new Promise(r => setTimeout(r, 15));

      assert.equal((app as any).queue.length, 0, 'Late-resolving job must not repopulate queue');
      assert.equal(root.querySelector('#queue-items-container'), null, 'Late-resolving job must not repopulate queue DOM');
    });
  } finally {
    URL.createObjectURL = prevCreateObjectURL;
    URL.revokeObjectURL = prevRevokeObjectURL;
  }
});

test('AUD-20 [MOCK-CONTRACT]: async race with new batch added after clear isolates epochs and closes managed bitmap on abort', async () => {
  const { DoDecoderApp } = await import('../src/ui/app');
  const { withManagedImageBitmap } = await import('../src/core/image/bitmap-lifecycle');

  const resolvers: Array<(res: any) => void> = [];
  let bitmapCloses = 0;

  await withFakeDocumentAsync(async (_innerHtmlLog, body) => {
    const root = (globalThis as any).document.createElement('div') as FakeElement;
    body.appendChild(root);

    const makeResult = (name: string) => ({
      blob: new Blob([name], { type: 'image/webp' }),
      originalName: name,
      sanitizedName: `clean_${name}.webp`,
      originalSize: 10,
      sanitizedSize: 8,
      format: 'image/webp',
      sha256: `sha_${name}`,
      defenseLevel: 'paranoid' as const,
      auditBefore: {
        fileName: name,
        fileSize: 10,
        mimeType: 'image/jpeg',
        hasExif: false,
        hasGps: false,
        hasThumbnail: false,
        hasMakerNotes: false,
        tags: [],
        markers: [],
        prnuSusceptibility: 'low' as const,
        sha256: `before_${name}`,
      },
      auditAfter: {
        fileName: `clean_${name}.webp`,
        fileSize: 8,
        mimeType: 'image/webp',
        hasExif: false,
        hasGps: false,
        hasThumbnail: false,
        hasMakerNotes: false,
        tags: [],
        markers: [],
        prnuSusceptibility: 'low' as const,
        sha256: `sha_${name}`,
      },
      processedAt: 0,
    });

    const app = new DoDecoderApp(root as unknown as HTMLElement, {
      processFile: async (file: File, opts?: any) => {
        if (file.name === 'stale.jpg') {
          return await withManagedImageBitmap(
            async () => ({
              width: 8,
              height: 8,
              close: () => {
                bitmapCloses++;
              },
            } as unknown as ImageBitmap),
            async () =>
              await new Promise(resolve => {
                resolvers.push(resolve);
              }),
            opts?.signal
          );
        }
        return await new Promise(resolve => {
          resolvers.push(resolve);
        });
      },
    });

    // Epoch 1: enqueue stale.jpg
    (app as any).handleFilesAdded([new File([new Uint8Array([1])], 'stale.jpg', { type: 'image/jpeg' })]);
    await new Promise(r => setTimeout(r, 5));
    assert.equal(resolvers.length, 1);

    // Clear queue while stale.jpg is in flight
    app.handleClearQueue();
    assert.equal(app.getQueue().length, 0);

    // Epoch 2: enqueue fresh.jpg BEFORE stale.jpg resolves
    (app as any).handleFilesAdded([new File([new Uint8Array([2])], 'fresh.jpg', { type: 'image/jpeg' })]);
    await new Promise(r => setTimeout(r, 5));
    assert.equal(resolvers.length, 2, 'New batch in epoch 2 must start without being blocked by stale epoch 1');

    // Now stale.jpg resolves late: must close its managed bitmap and NOT corrupt epoch 2
    resolvers[0](makeResult('stale.jpg'));
    await new Promise(r => setTimeout(r, 5));
    assert.equal(bitmapCloses, 1, 'Managed bitmap from cancelled epoch 1 job must be closed');
    assert.equal(app.getQueue().length, 1);
    assert.equal(app.getQueue()[0].file.name, 'fresh.jpg');
    assert.equal(app.getQueue()[0].status, 'processing');

    // Now fresh.jpg resolves: epoch 2 completes cleanly
    resolvers[1](makeResult('fresh.jpg'));
    await new Promise(r => setTimeout(r, 5));
    assert.equal(app.getQueue().length, 1);
    assert.equal(app.getQueue()[0].status, 'done');
    assert.equal(app.getQueue()[0].result?.sanitizedName, 'clean_fresh.jpg.webp');
  });
});

test('AUD-21 (Report AUD-17) [NODE-VERIFIED]: createSanitizedZipBundle rejects oversized synthetic blobs and >=0xFFFF entries BEFORE reading blobs or allocating', async () => {
  const { createSanitizedZipBundle } = await import('../src/core/utils/zip-export');

  const dummyReport = {
    fileName: 'a.webp',
    fileSize: 0,
    mimeType: 'image/webp',
    hasExif: false,
    hasGps: false,
    hasThumbnail: false,
    hasMakerNotes: false,
    tags: [],
    markers: [],
    prnuSusceptibility: 'low' as const,
    sha256: '0'.repeat(64),
  };

  // Case 1: Synthetic 4 GiB - 1 B (0xFFFFFFFF) entry must fail BEFORE arrayBuffer() is called
  let arrayBufferCalled = false;
  const fakeHugeBlob = {
    size: 0xffffffff,
    type: 'image/webp',
    arrayBuffer: async () => {
      arrayBufferCalled = true;
      return new ArrayBuffer(0);
    },
  } as unknown as Blob;

  await assert.rejects(
    async () => {
      await createSanitizedZipBundle([
        {
          blob: fakeHugeBlob,
          originalName: 'huge.jpg',
          sanitizedName: 'huge.webp',
          originalSize: 0xffffffff,
          sanitizedSize: 0xffffffff,
          format: 'image/webp',
          sha256: '0'.repeat(64),
          defenseLevel: 'paranoid',
          auditBefore: dummyReport,
          auditAfter: dummyReport,
          processedAt: 0,
        },
      ]);
    },
    (err: any) => err instanceof Error && err.name === 'ZipSizeLimitError',
    'Oversized blob (0xFFFFFFFF) must reject with ZipSizeLimitError'
  );
  assert.equal(arrayBufferCalled, false, 'Oversized entry must be rejected before calling blob.arrayBuffer()');

  // Case 2: 0xFFFF (65535) entries must fail with ZipSizeLimitError before reading any blob
  let countRead = 0;
  const tinyFakeBlob = {
    size: 0,
    type: 'image/webp',
    arrayBuffer: async () => {
      countRead++;
      return new ArrayBuffer(0);
    },
  } as unknown as Blob;

  const sentinelEntries = Array.from({ length: 0xffff }, (_, i) => ({
    blob: tinyFakeBlob,
    originalName: `f${i}.jpg`,
    sanitizedName: `f${i}.webp`,
    originalSize: 0,
    sanitizedSize: 0,
    format: 'image/webp',
    sha256: '0'.repeat(64),
    defenseLevel: 'paranoid' as const,
    auditBefore: dummyReport,
    auditAfter: dummyReport,
    processedAt: 0,
  }));

  await assert.rejects(
    async () => {
      await createSanitizedZipBundle(sentinelEntries);
    },
    (err: any) => err instanceof Error && err.name === 'ZipSizeLimitError',
    'Entry count 0xFFFF (ZIP64 sentinel) must reject with ZipSizeLimitError'
  );
  assert.equal(countRead, 0, 'Oversized entry count must be rejected before reading any blob');
});

test('AUD-21 (Report AUD-17) [NODE-VERIFIED]: assertZipFits enforces limit-1, limit, and limit+1 across entry count, entry size, CD offset, and total archive size using real writer header sizes', async () => {
  const {
    assertZipFits,
    createSanitizedZipBundle,
    ZipSizeLimitError,
    ZIP_LOCAL_HEADER_SIZE,
    ZIP_CENTRAL_HEADER_SIZE,
    ZIP_EOCD_SIZE,
    ZIP_MAX_ENTRY_COUNT,
    ZIP_MAX_ENTRY_SIZE,
    ZIP_MAX_CD_OFFSET,
    ZIP_MAX_ARCHIVE_SIZE,
  } = await import('../src/core/utils/zip-export');

  // Verify named constants match strictly below ZIP64 sentinels (0xFFFF / 0xFFFFFFFF)
  assert.equal(ZIP_LOCAL_HEADER_SIZE, 30);
  assert.equal(ZIP_CENTRAL_HEADER_SIZE, 46);
  assert.equal(ZIP_EOCD_SIZE, 22);
  assert.equal(ZIP_MAX_ENTRY_COUNT, 0xfffe);
  assert.equal(ZIP_MAX_ENTRY_SIZE, 0xfffffffe);
  assert.equal(ZIP_MAX_CD_OFFSET, 0xfffffffe);
  assert.equal(ZIP_MAX_ARCHIVE_SIZE, 0xfffffffe);

  // Cross-check exact header math against real serialized ZIP bytes
  const dummyReport = {
    fileName: 'x.webp',
    fileSize: 5,
    mimeType: 'image/webp',
    hasExif: false,
    hasGps: false,
    hasThumbnail: false,
    hasMakerNotes: false,
    tags: [],
    markers: [],
    prnuSusceptibility: 'low' as const,
    sha256: '0'.repeat(64),
  };
  const realItems = [
    {
      blob: new Blob([new Uint8Array(17)], { type: 'image/webp' }),
      originalName: 'a.jpg',
      sanitizedName: 'alpha.webp',
      originalSize: 17,
      sanitizedSize: 17,
      format: 'image/webp',
      sha256: '0'.repeat(64),
      defenseLevel: 'paranoid' as const,
      auditBefore: dummyReport,
      auditAfter: dummyReport,
      processedAt: 0,
    },
    {
      blob: new Blob([new Uint8Array(29)], { type: 'image/webp' }),
      originalName: 'b.jpg',
      sanitizedName: 'beta_longer.webp',
      originalSize: 29,
      sanitizedSize: 29,
      format: 'image/webp',
      sha256: '0'.repeat(64),
      defenseLevel: 'paranoid' as const,
      auditBefore: dummyReport,
      auditAfter: dummyReport,
      processedAt: 0,
    },
  ];
  const expectedLayout = assertZipFits([
    { nameByteLength: Buffer.byteLength('alpha.webp'), byteLength: 17 },
    { nameByteLength: Buffer.byteLength('beta_longer.webp'), byteLength: 29 },
  ]);
  const { zipBlob } = await createSanitizedZipBundle(realItems);
  assert.equal(zipBlob.size, expectedLayout.totalArchiveSize, 'assertZipFits total must match real emitted ZIP size exactly');

  // 1. Entry count: limit-1 (0xFFFD), limit (0xFFFE), limit+1 (0xFFFF)
  const makeTinyEntries = (n: number) => Array.from({ length: n }, () => ({ nameByteLength: 4, byteLength: 0 }));
  const countMinus1 = assertZipFits(makeTinyEntries(ZIP_MAX_ENTRY_COUNT - 1));
  assert.equal(countMinus1.entryCount, ZIP_MAX_ENTRY_COUNT - 1);

  const countAtLimit = assertZipFits(makeTinyEntries(ZIP_MAX_ENTRY_COUNT));
  assert.equal(countAtLimit.entryCount, ZIP_MAX_ENTRY_COUNT);

  assert.throws(
    () => assertZipFits(makeTinyEntries(ZIP_MAX_ENTRY_COUNT + 1)),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'ENTRY_COUNT_EXCEEDED'
  );

  // 2. Total archive size: limit-1, limit, limit+1 (1 synthetic entry, 10-byte filename)
  const nameLen = 10;
  const overhead = ZIP_LOCAL_HEADER_SIZE + nameLen + ZIP_CENTRAL_HEADER_SIZE + nameLen + ZIP_EOCD_SIZE; // 118
  const payloadAtArchiveLimit = ZIP_MAX_ARCHIVE_SIZE - overhead;

  const totalMinus1 = assertZipFits([{ nameByteLength: nameLen, byteLength: payloadAtArchiveLimit - 1 }]);
  assert.equal(totalMinus1.totalArchiveSize, ZIP_MAX_ARCHIVE_SIZE - 1);

  const totalAtLimit = assertZipFits([{ nameByteLength: nameLen, byteLength: payloadAtArchiveLimit }]);
  assert.equal(totalAtLimit.totalArchiveSize, ZIP_MAX_ARCHIVE_SIZE);

  assert.throws(
    () => assertZipFits([{ nameByteLength: nameLen, byteLength: payloadAtArchiveLimit + 1 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'ARCHIVE_SIZE_EXCEEDED'
  );

  // 3. Central-directory offset boundary: limit-1 (0xFFFFFFFD), limit (0xFFFFFFFE), limit+1 (0xFFFFFFFF)
  // Note: when cdOffset is 0xFFFFFFFD or 0xFFFFFFFE, cdOffset itself passes while total archive exceeds 0xFFFFFFFE (ARCHIVE_SIZE_EXCEEDED).
  // When cdOffset reaches 0xFFFFFFFF (limit+1), CENTRAL_DIR_OFFSET_EXCEEDED triggers before EOCD addition.
  const entryA = { nameByteLength: 0, byteLength: 0x80000000 }; // LFH = 30 + 0x80000000
  const lfhA = ZIP_LOCAL_HEADER_SIZE + entryA.byteLength;
  const remainingForCdLimit = ZIP_MAX_CD_OFFSET - lfhA - ZIP_LOCAL_HEADER_SIZE;

  assert.throws(
    () => assertZipFits([entryA, { nameByteLength: 0, byteLength: remainingForCdLimit - 1 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'ARCHIVE_SIZE_EXCEEDED',
    'cdOffset = limit-1 must pass CD offset check and fail only on total archive size'
  );
  assert.throws(
    () => assertZipFits([entryA, { nameByteLength: 0, byteLength: remainingForCdLimit }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'ARCHIVE_SIZE_EXCEEDED',
    'cdOffset = limit must pass CD offset check and fail only on total archive size'
  );
  assert.throws(
    () => assertZipFits([entryA, { nameByteLength: 0, byteLength: remainingForCdLimit + 1 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'CENTRAL_DIR_OFFSET_EXCEEDED',
    'cdOffset = limit+1 (0xFFFFFFFF) must fail with CENTRAL_DIR_OFFSET_EXCEEDED'
  );

  // 4. Single entry size boundary: limit-1 and limit pass entry-size check (failing later on CD offset),
  // whereas limit+1 (0xFFFFFFFF) fails immediately with ENTRY_SIZE_EXCEEDED.
  assert.throws(
    () => assertZipFits([{ nameByteLength: 1, byteLength: ZIP_MAX_ENTRY_SIZE - 1 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'CENTRAL_DIR_OFFSET_EXCEEDED'
  );
  assert.throws(
    () => assertZipFits([{ nameByteLength: 1, byteLength: ZIP_MAX_ENTRY_SIZE }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'CENTRAL_DIR_OFFSET_EXCEEDED'
  );
  assert.throws(
    () => assertZipFits([{ nameByteLength: 1, byteLength: ZIP_MAX_ENTRY_SIZE + 1 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'ENTRY_SIZE_EXCEEDED'
  );

  // 5. Invalid layouts (negative, NaN, filename > uint16)
  assert.throws(
    () => assertZipFits([{ nameByteLength: 1, byteLength: -1 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'INVALID_ENTRY_LAYOUT'
  );
  assert.throws(
    () => assertZipFits([{ nameByteLength: 0x10000, byteLength: 0 }]),
    (err: unknown) => err instanceof ZipSizeLimitError && err.code === 'FILENAME_TOO_LONG'
  );
});

test('AUD-22 [NODE-VERIFIED]: analyzeForensics never throws on hostile EXIF inputs and returns typed failure results', async () => {
  const { analyzeForensics } = await import('../src/core/forensic/exif-inspector');

  // 1. Truncated header (exact AUDIT_REPORT.md reproducer + truncated WebP EXIF chunk)
  const auditRepro = new Uint8Array(21);
  auditRepro.set([0x45, 0x58, 0x49, 0x46], 12); // 'EXIF' at offset 12, only 5 bytes left
  const reproReport = await analyzeForensics(new Blob([auditRepro]), 'repro.bin');
  assert.equal(reproReport.fileName, 'repro.bin');

  const truncatedWebp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
    0x45, 0x58, 0x49, 0x46, 0x04, 0x00, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, // only 4 bytes of 8-byte TIFF header
  ]);
  const truncReport = (await analyzeForensics(new Blob([truncatedWebp], { type: 'image/webp' }), 'trunc.webp')) as any;
  assert.equal(truncReport.exifParseResult?.ok, false);
  assert.equal(truncReport.exifParseResult?.code, 'TRUNCATED_HEADER');

  // 2. Empty input
  const emptyReport = (await analyzeForensics(new Blob([]), 'empty.bin')) as any;
  assert.equal(emptyReport.exifParseResult?.ok, false);
  assert.equal(emptyReport.exifParseResult?.code, 'EMPTY_INPUT');

  // 3. Invalid byte-order mark inside JPEG APP1 Exif
  const badBomJpeg = new Uint8Array([
    0xff, 0xd8,
    0xff, 0xe1, 0x00, 0x10,
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // Exif\0\0
    0x58, 0x58, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // invalid BOM 'XX'
  ]);
  const badBomReport = (await analyzeForensics(new Blob([badBomJpeg], { type: 'image/jpeg' }), 'badbom.jpg')) as any;
  assert.equal(badBomReport.exifParseResult?.ok, false);
  assert.equal(badBomReport.exifParseResult?.code, 'INVALID_BYTE_ORDER');

  // 4. IFD offset past EOF
  const oobIfd = new Uint8Array([
    0x49, 0x49, 0x2a, 0x00,
    0xff, 0x00, 0x00, 0x00, // ifd0Offset = 255 > length 8
  ]);
  const oobReport = (await analyzeForensics(new Blob([oobIfd], { type: 'image/tiff' }), 'oob.tif')) as any;
  assert.equal(oobReport.exifParseResult?.ok, false);
  assert.equal(oobReport.exifParseResult?.code, 'IFD_OFFSET_OUT_OF_BOUNDS');

  // 5. Huge count * typeSize (RATIONAL type 5 = 8B, count = 0x40000000)
  const hugeCountTiff = new Uint8Array(26);
  const hdv = new DataView(hugeCountTiff.buffer);
  hugeCountTiff.set([0x49, 0x49, 0x2a, 0x00], 0);
  hdv.setUint32(4, 8, true); // IFD0 at offset 8
  hdv.setUint16(8, 1, true); // 1 entry
  hdv.setUint16(10, 0x010f, true); // Make tag
  hdv.setUint16(12, 5, true); // RATIONAL (8 bytes each)
  hdv.setUint32(14, 0x40000000, true); // count * 8 overflows uint32
  hdv.setUint32(18, 0, true); // offset
  hdv.setUint32(22, 0, true); // next IFD = 0
  const hugeReport = (await analyzeForensics(new Blob([hugeCountTiff], { type: 'image/tiff' }), 'huge.tif')) as any;
  assert.equal(hugeReport.exifParseResult?.ok, false);
  assert.equal(hugeReport.exifParseResult?.code, 'VALUE_OVERFLOW_OR_OOB');

  // 6. Circular IFD pointer (IFD0.nextIfdOffset points back to IFD0 at offset 8)
  const circularTiff = new Uint8Array(26);
  const cdv = new DataView(circularTiff.buffer);
  circularTiff.set([0x49, 0x49, 0x2a, 0x00], 0);
  cdv.setUint32(4, 8, true); // IFD0 at 8
  cdv.setUint16(8, 1, true); // 1 entry
  cdv.setUint16(10, 0x010f, true); // Make
  cdv.setUint16(12, 2, true); // ASCII
  cdv.setUint32(14, 3, true); // inline 'AB\0'
  circularTiff.set([0x41, 0x42, 0x00, 0x00], 18);
  cdv.setUint32(22, 8, true); // nextIfdOffset -> 8 (CYCLE!)
  const circReport = (await analyzeForensics(new Blob([circularTiff], { type: 'image/tiff' }), 'cycle.tif')) as any;
  assert.equal(circReport.exifParseResult?.ok, false);
  assert.equal(circReport.exifParseResult?.code, 'CIRCULAR_IFD_REFERENCE');

  // 7. Unreadable Blob (arrayBuffer throws) must still never throw across API boundary
  const brokenBlob = {
    size: 16,
    type: 'image/jpeg',
    arrayBuffer: async () => {
      throw new Error('simulated I/O failure');
    },
  } as unknown as Blob;
  const errReport = await analyzeForensics(brokenBlob, 'broken.jpg');
  assert.equal(errReport.exifParseResult.ok, false);
  if (!errReport.exifParseResult.ok) {
    assert.equal(errReport.exifParseResult.code, 'READ_ERROR');
  }
});

test('AUD-22 [NODE-VERIFIED]: inspectExifBytes uses zero-copy typed-array views, enforces max depth/entries, parses valid EXIF, and allocates zero bytes exceeding input size', async () => {
  const { inspectExifBytes, EXIF_MAX_IFD_DEPTH, EXIF_MAX_IFD_ENTRIES } = await import('../src/core/forensic/exif-inspector');

  // Spy on ArrayBuffer and Uint8Array allocations during hostile parses
  const OriginalArrayBuffer = globalThis.ArrayBuffer;
  const OriginalUint8Array = globalThis.Uint8Array;
  let maxAllocatedBytes = 0;

  const SpiedArrayBuffer = new Proxy(OriginalArrayBuffer, {
    construct(target, args, newTarget) {
      const byteLen = Number(args[0] ?? 0);
      if (byteLen > maxAllocatedBytes) maxAllocatedBytes = byteLen;
      return Reflect.construct(target, args, newTarget);
    },
  });
  const SpiedUint8Array = new Proxy(OriginalUint8Array, {
    construct(target, args, newTarget) {
      // Track allocations that create a fresh backing buffer (number or iterable, not existing ArrayBuffer view)
      if (typeof args[0] === 'number' && args[0] > maxAllocatedBytes) {
        maxAllocatedBytes = args[0];
      }
      return Reflect.construct(target, args, newTarget);
    },
  });

  // Build adversarial buffers BEFORE enabling spy
  const emptyBuf = new Uint8Array(0);
  const truncBuf = new Uint8Array([0x49, 0x49, 0x2a, 0x00]); // 4 bytes < 8
  const badBomBuf = new Uint8Array([0x58, 0x58, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]); // 'XX' + LE 42
  const oobBuf = new Uint8Array([0x49, 0x49, 0x2a, 0x00, 0xff, 0xff, 0xff, 0x7f]);

  // Huge count * typeSize (DOUBLE = 8B * 0x3FFFFFFF)
  const hugeMulBuf = new Uint8Array(26);
  const hdv = new DataView(hugeMulBuf.buffer);
  hugeMulBuf.set([0x49, 0x49, 0x2a, 0x00], 0);
  hdv.setUint32(4, 8, true);
  hdv.setUint16(8, 1, true);
  hdv.setUint16(10, 0x010f, true);
  hdv.setUint16(12, 12, true); // DOUBLE (8 bytes)
  hdv.setUint32(14, 0x3fffffff, true);
  hdv.setUint32(18, 0, true);
  hdv.setUint32(22, 0, true);

  // Two-node IFD cycle: IFD0 (offset 8) -> IFD1 (offset 14) -> IFD0 (offset 8)
  const twoCycleBuf = new Uint8Array(20);
  const tdv = new DataView(twoCycleBuf.buffer);
  twoCycleBuf.set([0x49, 0x49, 0x2a, 0x00], 0);
  tdv.setUint32(4, 8, true);  // IFD0 at 8
  tdv.setUint16(8, 0, true);  // 0 entries
  tdv.setUint32(10, 14, true); // next -> 14
  tdv.setUint16(14, 0, true); // 0 entries
  tdv.setUint32(16, 8, true); // next -> 8 (cycle!)

  // Excessive entry count (> EXIF_MAX_IFD_ENTRIES)
  const manyEntriesBuf = new Uint8Array(16);
  const mdv = new DataView(manyEntriesBuf.buffer);
  manyEntriesBuf.set([0x49, 0x49, 0x2a, 0x00], 0);
  mdv.setUint32(4, 8, true);
  mdv.setUint16(8, EXIF_MAX_IFD_ENTRIES + 1, true);

  // Excessive chain depth (> EXIF_MAX_IFD_DEPTH)
  const chainLen = EXIF_MAX_IFD_DEPTH + 3;
  const deepChainBuf = new Uint8Array(8 + chainLen * 6);
  const ddv = new DataView(deepChainBuf.buffer);
  deepChainBuf.set([0x49, 0x49, 0x2a, 0x00], 0);
  ddv.setUint32(4, 8, true);
  for (let i = 0; i < chainLen; i++) {
    const off = 8 + i * 6;
    ddv.setUint16(off, 0, true);
    ddv.setUint32(off + 2, i + 1 < chainLen ? off + 6 : 0, true);
  }

  // Valid TIFF placed inside a non-zero byteOffset view (verifies typed-array view handling without copy)
  const paddedBacking = new Uint8Array(64);
  const tiffStart = 12;
  const validTiffLen = 30;
  const vdv = new DataView(paddedBacking.buffer, tiffStart, validTiffLen);
  paddedBacking.set([0x49, 0x49, 0x2a, 0x00], tiffStart);
  vdv.setUint32(4, 8, true); // IFD0 at 8
  vdv.setUint16(8, 1, true); // 1 entry
  vdv.setUint16(10, 0x0110, true); // Camera Model
  vdv.setUint16(12, 2, true); // ASCII
  vdv.setUint32(14, 4, true); // inline 'CAM\0'
  paddedBacking.set([0x43, 0x41, 0x4d, 0x00], tiffStart + 18);
  vdv.setUint32(22, 0, true); // nextIfd = 0
  const nonZeroView = new Uint8Array(paddedBacking.buffer, tiffStart, validTiffLen);

  const hostileCases: Array<[Uint8Array, string]> = [
    [emptyBuf, 'EMPTY_INPUT'],
    [truncBuf, 'TRUNCATED_HEADER'],
    [badBomBuf, 'INVALID_BYTE_ORDER'],
    [oobBuf, 'IFD_OFFSET_OUT_OF_BOUNDS'],
    [hugeMulBuf, 'VALUE_OVERFLOW_OR_OOB'],
    [twoCycleBuf, 'CIRCULAR_IFD_REFERENCE'],
    [manyEntriesBuf, 'MAX_IFD_ENTRIES_EXCEEDED'],
    [deepChainBuf, 'MAX_IFD_DEPTH_EXCEEDED'],
  ];

  (globalThis as any).ArrayBuffer = SpiedArrayBuffer;
  (globalThis as any).Uint8Array = SpiedUint8Array;
  try {
    for (const [buf, expectedCode] of hostileCases) {
      maxAllocatedBytes = 0;
      const beforeAb = process.memoryUsage().arrayBuffers;
      const res = inspectExifBytes(buf);
      const afterAb = process.memoryUsage().arrayBuffers;

      assert.equal(res.ok, false, `Expected failure ${expectedCode}`);
      if (!res.ok) {
        assert.equal(res.code, expectedCode);
      }
      assert.ok(
        maxAllocatedBytes <= buf.byteLength,
        `Allocation (${maxAllocatedBytes} B) exceeded input size (${buf.byteLength} B) for ${expectedCode}`
      );
      assert.ok(
        afterAb - beforeAb <= buf.byteLength,
        `ArrayBuffer memory delta (${afterAb - beforeAb} B) exceeded input size (${buf.byteLength} B) for ${expectedCode}`
      );
    }

    // Valid non-zero byteOffset view must parse accurately with zero backing buffer allocations
    maxAllocatedBytes = 0;
    const validRes = inspectExifBytes(nonZeroView);
    assert.equal(validRes.ok, true);
    if (validRes.ok) {
      assert.equal(validRes.hasExif, true);
      assert.equal(validRes.tags.length, 1);
      assert.equal(validRes.tags[0].name, 'Camera Model');
      assert.equal(validRes.tags[0].value, 'CAM');
    }
    assert.equal(maxAllocatedBytes, 0, 'inspectExifBytes must not allocate backing buffers for typed-array views');
  } finally {
    (globalThis as any).ArrayBuffer = OriginalArrayBuffer;
    (globalThis as any).Uint8Array = OriginalUint8Array;
  }
});

test('AUD-22 [NODE-VERIFIED]: finalizeSanitizedOutput remains 100% compatible with hardened analyzeForensics', async () => {
  const { finalizeSanitizedOutput } = await import('../src/core/forensic/finalize-output');

  // Minimal valid clean WebP RIFF container (no EXIF)
  const webp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x20, 0x04, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);

  const finalized = await finalizeSanitizedOutput(webp, 'image/webp');
  assert.equal(finalized.format, 'image/webp');
  assert.equal(finalized.sanitizedSize, webp.byteLength);
  assert.equal(finalized.auditAfter.sha256, finalized.sha256);
  assert.equal(finalized.auditAfter.hasExif, false);
});
