import { QueueItem } from '../../core/types';
import { icons } from '../icons';

export interface QueueListCallbacks {
  onDownloadSingle: (item: QueueItem) => void;
  onDownloadAllZip: () => void;
  onInspectForensics: (item: QueueItem) => void;
  onClearQueue: () => void;
}

export function renderQueueList(
  items: QueueItem[],
  callbacks: QueueListCallbacks
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'mt-6 space-y-4';

  if (items.length === 0) {
    return container;
  }

  const completedCount = items.filter(i => i.status === 'done').length;
  const totalCount = items.length;

  container.innerHTML = `
    <!-- Batch Actions Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 ${completedCount === totalCount ? 'bg-[#00FF00]' : 'bg-[#FFFFFF] animate-pulse'}"></span>
        <span class="text-xs font-mono font-medium text-[#FFFFFF]">
          Queue: ${completedCount} / ${totalCount} processed
        </span>
      </div>

      <div class="flex items-center gap-4 w-full sm:w-auto">
        ${
          completedCount > 0
            ? `
          <button id="btn-download-zip" class="text-[#00FF00] hover:text-[#FFFFFF] text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
            ${icons.archive}
            <span>Download All (ZIP)</span>
          </button>
        `
            : ''
        }

        <button id="btn-clear-all" class="text-[#FFFFFF] hover:text-[#FF4444] text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
          ${icons.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-4" id="queue-items-container"></div>
  `;

  const downloadZipBtn = container.querySelector('#btn-download-zip');
  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', callbacks.onDownloadAllZip);
  }

  const clearBtn = container.querySelector('#btn-clear-all');
  if (clearBtn) {
    clearBtn.addEventListener('click', callbacks.onClearQueue);
  }

  const itemsContainer = container.querySelector('#queue-items-container')!;

  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'py-3 flex flex-col md:flex-row md:items-center justify-between gap-4';

    const isDone = item.status === 'done';
    const isError = item.status === 'error';
    const isProcessing = item.status === 'processing' || item.status === 'analyzing';

    const threatBadges: string[] = [];
    if (item.result?.auditBefore) {
      const b = item.result.auditBefore;
      if (b.hasGps) threatBadges.push(`<span class="text-[10px] font-mono text-[#FF4444]">GPS</span>`);
      if (b.hasThumbnail) threatBadges.push(`<span class="text-[10px] font-mono text-[#FF4444]">THUMB</span>`);
      if (b.hasMakerNotes) threatBadges.push(`<span class="text-[10px] font-mono text-[#FF4444]">OEM</span>`);
      if (b.hasExif && !b.hasGps) threatBadges.push(`<span class="text-[10px] font-mono text-[#FFFFFF]">EXIF</span>`);
    }

    itemEl.innerHTML = `
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-[#FFFFFF]">
          ${isDone ? `<span class="text-[#00FF00]">${icons.check}</span>` : isError ? `<span class="text-[#FF4444]">${icons.alertTriangle}</span>` : `<span class="text-[#FFFFFF] animate-spin">${icons.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-[#FFFFFF] truncate max-w-[200px] sm:max-w-xs" title="${item.file.name}">
              ${item.file.name}
            </span>
            <span class="text-[10px] text-[#FFFFFF]/70 font-mono">(${formatBytes(item.file.size)})</span>
            ${threatBadges.join(' ')}
          </div>

          ${
            isDone && item.result
              ? `
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono text-[#00FF00]">
                ${item.result.sanitizedName}
              </span>
              <span class="text-[10px] text-[#FFFFFF]/70 font-mono">
                (${formatBytes(item.result.sanitizedSize)})
              </span>
              <span class="text-[10px] text-[#00FF00] font-mono">
                CLEAN
              </span>
              ${
                item.result.isDeepDecontaminated
                  ? `
                <span class="text-[10px] text-[#FFFFFF] font-mono" title="Anti-steganography pipeline applied" aria-label="Anti-steganography pipeline applied">
                  DECONTAMINATED
                </span>
              `
                  : ''
              }
            </div>
          `
              : ''
          }

          ${
            isProcessing
              ? `
            <div class="text-[10px] text-[#FFFFFF] font-mono flex justify-between">
              <span>${item.status === 'analyzing' ? 'Scanning...' : 'Re-encoding...'}</span>
              <span>${item.progress}%</span>
            </div>
          `
              : ''
          }

          ${
            isError
              ? `
            <div class="text-xs text-[#FF4444] font-mono mt-1">
              Error: ${item.error || 'Failed to process'}
            </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- Action Buttons -->
      ${
        isDone && item.result
          ? `
        <div class="flex items-center gap-4 shrink-0">
          <button class="btn-inspect text-xs font-mono text-[#FFFFFF] hover:text-[#00FF00] transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
            ${icons.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download text-[#00FF00] hover:text-[#FFFFFF] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
            ${icons.download}
            <span>Download</span>
          </button>
        </div>
      `
          : ''
      }
    `;

    const inspectBtn = itemEl.querySelector('.btn-inspect');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => callbacks.onInspectForensics(item));
    }

    const downloadBtn = itemEl.querySelector('.btn-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => callbacks.onDownloadSingle(item));
    }

    itemsContainer.appendChild(itemEl);
  });

  return container;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
