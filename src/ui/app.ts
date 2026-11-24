import { QueueItem, SanitizedResult } from '../core/types';
import { processMediaFile } from '../core/pipeline';
import { createSanitizedZipBundle, triggerEphemeralDownload } from '../core/utils/zip-export';
import { revokeUrls } from '../core/utils/memory';
import { isAbortError } from '../core/image/bitmap-lifecycle';
import { renderSettingsPanel } from './components/settings-panel';
import { renderDropzone } from './components/dropzone';
import { renderQueueList, sanitizeDisplayText } from './components/queue-list';
import { renderAuditModal } from './components/audit-modal';
import { renderLegalModal } from './components/legal-modal';

export interface DoDecoderAppDeps {
  processFile?: typeof processMediaFile;
  createZipBundle?: typeof createSanitizedZipBundle;
  triggerDownload?: (blob: Blob, fileName: string, onRevoked?: () => void) => string | void;
}

export class DoDecoderApp {
  private root: HTMLElement;
  private queue: QueueItem[] = [];
  private activeAuditModal: HTMLElement | null = null;
  private activeLegalModal: HTMLElement | null = null;
  private queueEpoch = 0;
  private processingEpoch: number | null = null;
  private activeAbortController: AbortController | null = null;
  private activeObjectUrls = new Set<string>();
  private activeBitmaps = new Set<ImageBitmap>();
  private queueStatusError: string | null = null;
  private readonly deps: Required<DoDecoderAppDeps>;

  constructor(root: HTMLElement, deps: DoDecoderAppDeps = {}) {
    this.root = root;
    this.deps = {
      processFile: deps.processFile ?? processMediaFile,
      createZipBundle: deps.createZipBundle ?? createSanitizedZipBundle,
      triggerDownload: deps.triggerDownload ?? triggerEphemeralDownload,
    };
    this.render();
  }

  public getQueue(): readonly QueueItem[] {
    return this.queue;
  }

  public registerObjectUrl(url: string): void {
    if (url) {
      this.activeObjectUrls.add(url);
    }
  }

  public registerManagedBitmap(bitmap: ImageBitmap): void {
    this.activeBitmaps.add(bitmap);
  }

  public render(): void {
    this.root.innerHTML = '';

    const main = document.createElement('main');
    main.className = 'flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-between';

    const header = renderSettingsPanel();
    main.appendChild(header);

    const dropzone = renderDropzone(files => this.handleFilesAdded(files));
    main.appendChild(dropzone);

    const queueList = renderQueueList(this.queue, {
      onDownloadSingle: item => this.handleDownloadSingle(item),
      onDownloadAllZip: () => this.handleDownloadAllZip(),
      onInspectForensics: item => this.handleInspectForensics(item),
      onClearQueue: () => this.handleClearQueue(),
    }, this.queueStatusError);
    main.appendChild(queueList);

    const footer = this.createFooter();
    main.appendChild(footer);

    this.root.appendChild(main);
  }

  private createFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'mt-auto py-8 text-center text-[#FFFFFF]/60 text-xs font-mono select-none space-y-2';
    footer.innerHTML = `
      <div class="text-xs font-mono tracking-wider uppercase text-[#FFFFFF]">
        Client-Side Sanitization
      </div>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <span>MIT License</span>
        <span>-</span>
        <button id="footer-legal-btn" class="hover:text-[#FFFFFF] underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
          Licenses & Legal
        </button>
      </div>
    `;

    footer.querySelector('#footer-legal-btn')?.addEventListener('click', () => {
      this.openLegalModal();
    });

    return footer;
  }

  private handleFilesAdded(files: File[]): void {
    const newItems: QueueItem[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      status: 'idle',
      progress: 0,
    }));

    this.queueStatusError = null;
    this.queue.push(...newItems);
    this.render();
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    const epoch = this.queueEpoch;
    if (this.processingEpoch === epoch) return;
    this.processingEpoch = epoch;

    try {
      while (this.queueEpoch === epoch) {
        const item = this.queue.find(q => q.status === 'idle');
        if (!item) break;

        item.status = 'analyzing';
        item.progress = 25;
        this.updateQueueView();

        const controller = new AbortController();
        this.activeAbortController = controller;

        try {
          item.status = 'processing';
          const result = await this.deps.processFile(
            item.file,
            {
              signal: controller.signal,
            },
            pct => {
              if (this.queueEpoch !== epoch || controller.signal.aborted) return;
              item.progress = pct;
              this.updateQueueView();
            }
          );

          // Discard late results if queue was cleared while this item was in-flight
          if (this.queueEpoch !== epoch || controller.signal.aborted) {
            break;
          }

          item.status = 'done';
          item.progress = 100;
          item.result = result;
        } catch (err: any) {
          if (this.queueEpoch !== epoch || controller.signal.aborted || isAbortError(err)) {
            break;
          }
          item.status = 'error';
          item.error = err?.message || 'Processing failed';
        } finally {
          if (this.activeAbortController === controller) {
            this.activeAbortController = null;
          }
        }

        if (this.queueEpoch === epoch) {
          this.updateQueueView();
        }
      }
    } finally {
      if (this.processingEpoch === epoch) {
        this.processingEpoch = null;
      }
    }
  }

  private updateQueueView(): void {
    const existingQueue = this.root.querySelector('#queue-items-container')?.parentElement;
    if (existingQueue) {
      const newQueue = renderQueueList(this.queue, {
        onDownloadSingle: item => this.handleDownloadSingle(item),
        onDownloadAllZip: () => this.handleDownloadAllZip(),
        onInspectForensics: item => this.handleInspectForensics(item),
        onClearQueue: () => this.handleClearQueue(),
      }, this.queueStatusError);
      existingQueue.replaceWith(newQueue);
    } else {
      this.render();
    }
  }

  private triggerTrackedDownload(blob: Blob, fileName: string): void {
    let trackedUrl: string | undefined;
    const maybeUrl = this.deps.triggerDownload(blob, fileName, () => {
      if (trackedUrl) {
        this.activeObjectUrls.delete(trackedUrl);
      }
    });
    if (typeof maybeUrl === 'string' && maybeUrl.length > 0) {
      trackedUrl = maybeUrl;
      this.activeObjectUrls.add(maybeUrl);
    }
  }

  private handleDownloadSingle(item: QueueItem): void {
    if (!item.result) return;
    this.triggerTrackedDownload(item.result.blob, item.result.sanitizedName);
  }

  private async handleDownloadAllZip(): Promise<void> {
    const epoch = this.queueEpoch;
    const completed = this.queue
      .filter(q => q.status === 'done' && q.result)
      .map(q => q.result as SanitizedResult);
    if (completed.length === 0) return;

    if (this.queueStatusError !== null) {
      this.queueStatusError = null;
      this.updateQueueView();
    }

    try {
      const { zipBlob, zipFileName } = await this.deps.createZipBundle(completed);
      if (this.queueEpoch !== epoch) return;
      this.triggerTrackedDownload(zipBlob, zipFileName);
    } catch (err: unknown) {
      if (this.queueEpoch !== epoch) return;
      const rawMessage =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to create ZIP archive';
      const safeMessage = sanitizeDisplayText(rawMessage).trim() || 'Failed to create ZIP archive';
      this.queueStatusError = `ZIP Export Error: ${safeMessage}`;
      this.updateQueueView();
    }
  }

  private handleInspectForensics(item: QueueItem): void {
    if (!item.result) return;
    this.openAuditModal(item.result);
  }

  private openAuditModal(result: SanitizedResult): void {
    if (this.activeAuditModal) {
      this.activeAuditModal.remove();
    }
    this.activeAuditModal = renderAuditModal(result, () => {
      this.activeAuditModal?.remove();
      this.activeAuditModal = null;
    });
    document.body.appendChild(this.activeAuditModal);
  }

  private openLegalModal(): void {
    if (this.activeLegalModal) {
      this.activeLegalModal.remove();
    }
    this.activeLegalModal = renderLegalModal(() => {
      this.activeLegalModal?.remove();
      this.activeLegalModal = null;
    });
    document.body.appendChild(this.activeLegalModal);
  }

  public handleClearQueue(): void {
    // Advance epoch first so any late progress, job resolution, or ZIP export is discarded
    this.queueEpoch++;
    this.processingEpoch = null;
    this.queueStatusError = null;

    if (this.activeAbortController) {
      this.activeAbortController.abort('Queue cleared');
      this.activeAbortController = null;
    }

    // Release item object references without creating placebo Blob.arrayBuffer() copies
    for (const item of this.queue) {
      item.result = undefined;
      item.error = undefined;
    }
    this.queue = [];

    if (this.activeObjectUrls.size > 0) {
      revokeUrls(Array.from(this.activeObjectUrls));
      this.activeObjectUrls.clear();
    }

    if (this.activeBitmaps.size > 0) {
      for (const bitmap of this.activeBitmaps) {
        try {
          bitmap.close();
        } catch {
          // Ignore already-closed or detached bitmaps
        }
      }
      this.activeBitmaps.clear();
    }

    if (this.activeAuditModal) {
      this.activeAuditModal.remove();
      this.activeAuditModal = null;
    }

    this.render();
  }
}
