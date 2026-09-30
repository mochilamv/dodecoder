import { QueueItem, SanitizedResult } from '../core/types';
import { processMediaFile } from '../core/pipeline';
import { createSanitizedZipBundle, triggerEphemeralDownload } from '../core/utils/zip-export';
import { wipeBuffer } from '../core/utils/memory';
import { renderSettingsPanel, SettingsState } from './components/settings-panel';
import { renderDropzone } from './components/dropzone';
import { renderQueueList } from './components/queue-list';
import { renderAuditModal } from './components/audit-modal';
import { renderLegalModal } from './components/legal-modal';

export class DoDecoderApp {
  private root: HTMLElement;
  private settings: SettingsState = {
    quality: 0.60,
    extremeSanitization: false,
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

    const main = document.createElement('main');
    main.className = 'flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6';

    const settingsPanel = renderSettingsPanel(this.settings, updated => {
      this.settings = { ...this.settings, ...updated };
    });
    main.appendChild(settingsPanel);

    const dropzone = renderDropzone(files => this.handleFilesAdded(files));
    main.appendChild(dropzone);

    const queueList = renderQueueList(this.queue, {
      onDownloadSingle: item => this.handleDownloadSingle(item),
      onDownloadAllZip: () => this.handleDownloadAllZip(),
      onInspectForensics: item => this.handleInspectForensics(item),
      onClearQueue: () => this.handleClearQueue(),
    });
    main.appendChild(queueList);

    const footer = this.createFooter();
    main.appendChild(footer);

    this.root.appendChild(main);
  }

  private createFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'mt-auto pt-16 pb-8 text-center text-[#FFFFFF] text-xs font-mono';
    footer.innerHTML = `
      <div class="mb-3 space-y-1">
        <div class="text-sm font-bold tracking-widest uppercase text-[#FFFFFF] font-mono" title="Client-Side Media Sanitization & Anti-Forensics">Dodecoder</div>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#FFFFFF]">
        <span>By Mochilamv & Antigravity (AI)</span>
        <span>•</span>
        <span>MIT License</span>
        <span>•</span>
        <button id="footer-legal-btn" class="text-[#FFFFFF] hover:text-[#00FF00] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2">
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
      item.progress = 25;
      this.updateQueueView();

      try {
        item.status = 'processing';
        const result = await processMediaFile(
          item.file,
          {
            quality: this.settings.quality,
            extremeSanitization: this.settings.extremeSanitization,
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
    for (const item of this.queue) {
      if (item.result) {
        item.result.blob.arrayBuffer().then(buf => wipeBuffer(buf)).catch(() => {});
      }
    }
    this.queue = [];
    this.render();
  }
}
