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
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${completedCount === totalCount ? 'bg-emerald-400' : 'bg-neutral-400 animate-pulse'}"></span>
        <span class="text-xs font-mono font-medium text-neutral-300">
          Queue: ${completedCount} of ${totalCount} processed
        </span>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        ${
          completedCount > 0
            ? `
          <button id="btn-download-zip" class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            ${icons.archive}
            <span>Download All (ZIP)</span>
          </button>
        `
            : ''
        }

        <button id="btn-clear-all" class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          ${icons.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3" id="queue-items-container"></div>
  `;

  // Hook batch events
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
    itemEl.className =
      'p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4';

    const isDone = item.status === 'done';
    const isError = item.status === 'error';
    const isProcessing = item.status === 'processing' || item.status === 'analyzing';

    const threatBadges: string[] = [];
    if (item.result?.auditBefore) {
      const b = item.result.auditBefore;
      if (b.hasGps) threatBadges.push(`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>`);
      if (b.hasThumbnail) threatBadges.push(`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>`);
      if (b.hasMakerNotes) threatBadges.push(`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>`);
      if (b.hasExif && !b.hasGps) threatBadges.push(`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>`);
    }

    itemEl.innerHTML = `
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${isDone ? `<span class="text-emerald-400">${icons.check}</span>` : isError ? `<span class="text-red-400">${icons.alertTriangle}</span>` : `<span class="text-neutral-400 animate-spin">${icons.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${item.file.name}">
              ${item.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${formatBytes(item.file.size)})</span>
            ${threatBadges.join(' ')}
          </div>

          ${
            isDone && item.result
              ? `
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${item.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${formatBytes(item.result.sanitizedSize)})
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono">
                CLEAN
              </span>
              ${
                item.result.warningBadge
                  ? `
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-400 font-mono" title="${item.result.warningBadge}">
                  ${item.result.warningBadge}
                </span>
              `
                  : ''
              }
              ${
                item.result.isDeepDecontaminated
                  ? `
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/50 bg-purple-950/40 text-purple-300 font-mono" title="Anti-steganography pipeline applied: spatial micro-resampling, 3x3 median filter, and visibility dithering">
                  DECONTAMINATED
                </span>
              `
                  : ''
              }
              ${
                item.result.isBypass
                  ? `
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 font-mono" title="No original metadata: 1:1 bitstream preserved">
                  STRIP ONLY 1:1
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
            <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div class="bg-neutral-200 h-full transition-all duration-300" style="width: ${item.progress}%"></div>
            </div>
            <div class="text-[10px] text-neutral-400 font-mono flex justify-between">
              <span>${item.status === 'analyzing' ? 'Scanning...' : 'Re-encoding...'}</span>
              <span>${item.progress}%</span>
            </div>
          `
              : ''
          }

          ${
            isError
              ? `
            <div class="text-xs text-red-400 font-mono mt-1">
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
        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
          <button class="btn-inspect px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            ${icons.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
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
