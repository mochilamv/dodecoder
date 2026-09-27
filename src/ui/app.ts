import { DefenseLevel, OutputFormat, QueueItem, SanitizedResult } from '../core/types';
import { processMediaFile } from '../core/pipeline';
import { createSanitizedZipBundle, triggerEphemeralDownload } from '../core/utils/zip-export';
import { wipeBuffer } from '../core/utils/memory';
import { renderHeader } from './components/header';
import { renderSettingsPanel, SettingsState } from './components/settings-panel';
import { renderDropzone } from './components/dropzone';
import { renderQueueList } from './components/queue-list';
import { renderAuditModal } from './components/audit-modal';
import { renderLegalModal } from './components/legal-modal';

export class DoDecoderApp {
  private root: HTMLElement;
  private settings: SettingsState = {
    defenseLevel: 'hardened' as DefenseLevel,
    outputFormat: 'image/webp' as OutputFormat,
    quality: 0.92,
  };
  private queue: QueueItem[] = [];
  private activeAuditModal: HTMLElement | null = null;
  private activeLegalModal: HTMLElement | null = null;
  private isProcessingQueue = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
  }

  public render(): void {
    this.root.innerHTML = '';

    // 1. Header
    const header = renderHeader(() => this.openLegalModal());
    this.root.appendChild(header);

    // 2. Main Container
    const main = document.createElement('main');
    main.className = 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col';

    // 3. Settings HUD
    const settingsPanel = renderSettingsPanel(this.settings, updated => {
      this.settings = { ...this.settings, ...updated };
    });
    main.appendChild(settingsPanel);

    // 4. Dropzone
    const dropzone = renderDropzone(files => this.handleFilesAdded(files));
    main.appendChild(dropzone);

    // 5. Queue / Results List
    const queueList = renderQueueList(this.queue, {
      onDownloadSingle: item => this.handleDownloadSingle(item),
      onDownloadAllZip: () => this.handleDownloadAllZip(),
      onInspectForensics: item => this.handleInspectForensics(item),
      onClearQueue: () => this.handleClearQueue(),
    });
    main.appendChild(queueList);

    // 6. Security Footer
    const footer = this.createFooter();
    main.appendChild(footer);

    this.root.appendChild(main);
  }

  private createFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'mt-auto pt-12 pb-6 text-center text-neutral-600 text-xs font-mono border-t border-neutral-900';
    footer.innerHTML = `
      <div class="flex flex-wrap items-center justify-center gap-4 text-[11px] mb-2 text-neutral-400">
        <span>MIT License</span>
        <span>•</span>
        <span>Client-Side In-Memory Engine</span>
        <span>•</span>
        <span>By Mochilamv & Antigravity</span>
        <span>•</span>
        <button id="footer-legal-btn" class="text-neutral-400 hover:text-white underline cursor-pointer">
          Licenses & Legal
        </button>
      </div>
      <p class="text-[10px] text-neutral-600">
        DoDecoder Anti-Forensics Media Engine &copy; 2026 Mochilamv & Antigravity. High-performance client-side media sanitization.
      </p>
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

    this.queue.push(...newItems);
    this.render();
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      if (item.status !== 'idle') continue;

      item.status = 'analyzing';
      item.progress = 20;
      this.updateQueueView();

      try {
        item.status = 'processing';
        const result = await processMediaFile(
          item.file,
          {
            defenseLevel: this.settings.defenseLevel,
            outputFormat: this.settings.outputFormat,
            quality: this.settings.quality,
          },
          pct => {
            item.progress = pct;
            this.updateQueueView();
          }
        );

        item.status = 'done';
        item.progress = 100;
        item.result = result;
      } catch (err: any) {
        item.status = 'error';
        item.error = err.message || 'Processing failed';
      }

      this.updateQueueView();
    }

    this.isProcessingQueue = false;
  }

  private updateQueueView(): void {
    // Re-renders the queue section in place
    const existingQueue = this.root.querySelector('#queue-items-container')?.parentElement;
    if (existingQueue) {
      const newQueue = renderQueueList(this.queue, {
        onDownloadSingle: item => this.handleDownloadSingle(item),
        onDownloadAllZip: () => this.handleDownloadAllZip(),
        onInspectForensics: item => this.handleInspectForensics(item),
        onClearQueue: () => this.handleClearQueue(),
      });
      existingQueue.replaceWith(newQueue);
    } else {
      this.render();
    }
  }

  private handleDownloadSingle(item: QueueItem): void {
    if (!item.result) return;
    triggerEphemeralDownload(item.result.blob, item.result.sanitizedName);
  }

  private async handleDownloadAllZip(): Promise<void> {
    const completed = this.queue.filter(q => q.status === 'done' && q.result).map(q => q.result as SanitizedResult);
    if (completed.length === 0) return;

    const { zipBlob, zipFileName } = await createSanitizedZipBundle(completed);
    triggerEphemeralDownload(zipBlob, zipFileName);
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

  private handleClearQueue(): void {
    // Explicitly clean memory
    for (const item of this.queue) {
      if (item.result) {
        item.result.blob.arrayBuffer().then(buf => wipeBuffer(buf)).catch(() => {});
      }
    }
    this.queue = [];
    this.render();
  }
}
