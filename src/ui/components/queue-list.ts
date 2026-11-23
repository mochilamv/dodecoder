import { QueueItem } from '../../core/types';

export interface QueueListCallbacks {
  onDownloadSingle: (item: QueueItem) => void;
  onDownloadAllZip: () => void;
  onInspectForensics: (item: QueueItem) => void;
  onClearQueue: () => void;
}

export interface QueueThreatBadge {
  label: string;
  className: string;
}

export interface QueueItemViewModel {
  fileName: string;
  fileSizeLabel: string;
  isDone: boolean;
  isError: boolean;
  isProcessing: boolean;
  threatBadges: QueueThreatBadge[];
  sanitizedName: string | null;
  sanitizedSizeLabel: string | null;
  isDeepDecontaminated: boolean;
  processingLabel: string | null;
  progressPercent: number;
  errorMessage: string | null;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// Strip Unicode BiDi override/isolate controls (including U+202E RLO) and
// ASCII/C1 control characters so attacker-controlled filenames or error
// messages cannot spoof UI text directionality or corrupt layout.
const UNSAFE_DISPLAY_CHARS_RE = /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

export function sanitizeDisplayText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(UNSAFE_DISPLAY_CHARS_RE, '');
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(1))} ${sizes[idx]}`;
}

export function buildQueueItemViewModel(item: QueueItem): QueueItemViewModel {
  const isDone = item.status === 'done';
  const isError = item.status === 'error';
  const isProcessing = item.status === 'processing' || item.status === 'analyzing';

  const threatBadges: QueueThreatBadge[] = [];
  if (item.result?.auditBefore) {
    const b = item.result.auditBefore;
    if (b.hasGps) threatBadges.push({ label: 'GPS', className: 'text-[10px] font-mono text-[#FF4444]' });
    if (b.hasThumbnail) threatBadges.push({ label: 'THUMB', className: 'text-[10px] font-mono text-[#FF4444]' });
    if (b.hasMakerNotes) threatBadges.push({ label: 'OEM', className: 'text-[10px] font-mono text-[#FF4444]' });
    if (b.hasExif && !b.hasGps) threatBadges.push({ label: 'EXIF', className: 'text-[10px] font-mono text-[#FFFFFF]' });
  }

  const rawProgress = Number.isFinite(item.progress) ? Math.round(item.progress) : 0;
  const progressPercent = Math.max(0, Math.min(100, rawProgress));

  const processingLabel = isProcessing
    ? (item.status === 'analyzing'
        ? 'Scanning...'
        : progressPercent >= 78 && progressPercent < 90
          ? 'Synthesizing WebP...'
          : 'Re-encoding...')
    : null;

  const sanitizedError = sanitizeDisplayText(item.error ?? '');

  return {
    fileName: sanitizeDisplayText(item.file?.name ?? ''),
    fileSizeLabel: `(${formatBytes(item.file?.size ?? 0)})`,
    isDone,
    isError,
    isProcessing,
    threatBadges,
    sanitizedName: isDone && item.result ? sanitizeDisplayText(item.result.sanitizedName) : null,
    sanitizedSizeLabel: isDone && item.result ? `(${formatBytes(item.result.sanitizedSize)})` : null,
    isDeepDecontaminated: Boolean(isDone && item.result?.isDeepDecontaminated),
    processingLabel,
    progressPercent,
    errorMessage: isError ? `Error: ${sanitizedError || 'Failed to process'}` : null,
  };
}

type SvgChildSpec = { tag: string; attrs: Record<string, string> };
type QueueIconName = 'archive' | 'trash' | 'check' | 'alertTriangle' | 'cpu' | 'eye' | 'download';

const QUEUE_ICON_SPECS: Record<QueueIconName, SvgChildSpec[]> = {
  archive: [
    { tag: 'polyline', attrs: { points: '21 8 21 21 3 21 3 8' } },
    { tag: 'rect', attrs: { width: '22', height: '5', x: '1', y: '3' } },
    { tag: 'line', attrs: { x1: '10', y1: '12', x2: '14', y2: '12' } },
  ],
  trash: [
    {
      tag: 'path',
      attrs: {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
      },
    },
  ],
  check: [{ tag: 'polyline', attrs: { points: '20 6 9 17 4 12' } }],
  alertTriangle: [
    {
      tag: 'path',
      attrs: {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z',
      },
    },
    { tag: 'line', attrs: { x1: '12', y1: '9', x2: '12', y2: '13' } },
    { tag: 'line', attrs: { x1: '12', y1: '17', x2: '12.01', y2: '17' } },
  ],
  cpu: [
    { tag: 'rect', attrs: { width: '16', height: '16', x: '4', y: '4', rx: '2' } },
    { tag: 'rect', attrs: { width: '6', height: '6', x: '9', y: '9', rx: '1' } },
    { tag: 'path', attrs: { d: 'M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3' } },
  ],
  eye: [
    {
      tag: 'path',
      attrs: {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z',
      },
    },
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
  ],
  download: [
    {
      tag: 'path',
      attrs: {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
      },
    },
    { tag: 'polyline', attrs: { points: '7 10 12 15 17 10' } },
    { tag: 'line', attrs: { x1: '12', y1: '15', x2: '12', y2: '3' } },
  ],
};

function createSvgIcon(name: QueueIconName): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'w-4 h-4 inline-block');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');

  for (const childSpec of QUEUE_ICON_SPECS[name]) {
    const node = document.createElementNS(SVG_NS, childSpec.tag);
    for (const [attr, val] of Object.entries(childSpec.attrs)) {
      node.setAttribute(attr, val);
    }
    svg.appendChild(node);
  }
  return svg;
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

  // Batch Actions Bar
  const actionsBar = document.createElement('div');
  actionsBar.className = 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3';

  const statusSummary = document.createElement('div');
  statusSummary.className = 'flex items-center gap-2';

  const statusDot = document.createElement('span');
  statusDot.className = `w-2 h-2 ${completedCount === totalCount ? 'bg-[#00FF00]' : 'bg-[#FFFFFF] animate-pulse'}`;
  statusSummary.appendChild(statusDot);

  const countLabel = document.createElement('span');
  countLabel.className = 'text-xs font-mono font-medium text-[#FFFFFF]';
  countLabel.textContent = `Queue: ${completedCount} / ${totalCount} processed`;
  statusSummary.appendChild(countLabel);

  actionsBar.appendChild(statusSummary);

  const actionsGroup = document.createElement('div');
  actionsGroup.className = 'flex items-center gap-4 w-full sm:w-auto';

  if (completedCount > 0) {
    const downloadZipBtn = document.createElement('button');
    downloadZipBtn.id = 'btn-download-zip';
    downloadZipBtn.type = 'button';
    downloadZipBtn.className = 'text-[#00FF00] hover:text-[#FFFFFF] text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]';
    downloadZipBtn.appendChild(createSvgIcon('archive'));
    const zipText = document.createElement('span');
    zipText.textContent = 'Download All (ZIP)';
    downloadZipBtn.appendChild(zipText);
    downloadZipBtn.addEventListener('click', callbacks.onDownloadAllZip);
    actionsGroup.appendChild(downloadZipBtn);
  }

  const clearBtn = document.createElement('button');
  clearBtn.id = 'btn-clear-all';
  clearBtn.type = 'button';
  clearBtn.className = 'text-[#FFFFFF] hover:text-[#FF4444] text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]';
  clearBtn.appendChild(createSvgIcon('trash'));
  const clearText = document.createElement('span');
  clearText.textContent = 'Clear';
  clearBtn.appendChild(clearText);
  clearBtn.addEventListener('click', callbacks.onClearQueue);
  actionsGroup.appendChild(clearBtn);

  actionsBar.appendChild(actionsGroup);
  container.appendChild(actionsBar);

  // Items List
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'space-y-4';
  itemsContainer.id = 'queue-items-container';
  container.appendChild(itemsContainer);

  items.forEach(item => {
    const vm = buildQueueItemViewModel(item);

    const itemEl = document.createElement('div');
    itemEl.className = 'py-3 flex flex-col md:flex-row md:items-center justify-between gap-4';

    const leftRow = document.createElement('div');
    leftRow.className = 'flex items-start gap-3 min-w-0 flex-1';

    const iconBox = document.createElement('div');
    iconBox.className = 'w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-[#FFFFFF]';
    const iconWrapper = document.createElement('span');
    if (vm.isDone) {
      iconWrapper.className = 'text-[#00FF00]';
      iconWrapper.appendChild(createSvgIcon('check'));
    } else if (vm.isError) {
      iconWrapper.className = 'text-[#FF4444]';
      iconWrapper.appendChild(createSvgIcon('alertTriangle'));
    } else {
      iconWrapper.className = 'text-[#FFFFFF] animate-spin';
      iconWrapper.appendChild(createSvgIcon('cpu'));
    }
    iconBox.appendChild(iconWrapper);
    leftRow.appendChild(iconBox);

    const detailsCol = document.createElement('div');
    detailsCol.className = 'min-w-0 flex-1 space-y-1';

    const headerRow = document.createElement('div');
    headerRow.className = 'flex flex-wrap items-center gap-2';

    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'text-xs font-mono font-medium text-[#FFFFFF] truncate max-w-[200px] sm:max-w-xs';
    fileNameSpan.setAttribute('title', vm.fileName);
    fileNameSpan.textContent = vm.fileName;
    headerRow.appendChild(fileNameSpan);

    const fileSizeSpan = document.createElement('span');
    fileSizeSpan.className = 'text-[10px] text-[#FFFFFF]/70 font-mono';
    fileSizeSpan.textContent = vm.fileSizeLabel;
    headerRow.appendChild(fileSizeSpan);

    for (const badge of vm.threatBadges) {
      const badgeEl = document.createElement('span');
      badgeEl.className = badge.className;
      badgeEl.textContent = badge.label;
      headerRow.appendChild(badgeEl);
    }

    detailsCol.appendChild(headerRow);

    if (vm.isDone && item.result && vm.sanitizedName !== null && vm.sanitizedSizeLabel !== null) {
      const doneRow = document.createElement('div');
      doneRow.className = 'flex flex-wrap items-center gap-2';

      const sanitizedNameEl = document.createElement('span');
      sanitizedNameEl.className = 'text-xs font-mono text-[#00FF00]';
      sanitizedNameEl.setAttribute('title', vm.sanitizedName);
      sanitizedNameEl.textContent = vm.sanitizedName;
      doneRow.appendChild(sanitizedNameEl);

      const sanitizedSizeEl = document.createElement('span');
      sanitizedSizeEl.className = 'text-[10px] text-[#FFFFFF]/70 font-mono';
      sanitizedSizeEl.textContent = vm.sanitizedSizeLabel;
      doneRow.appendChild(sanitizedSizeEl);

      const cleanBadge = document.createElement('span');
      cleanBadge.className = 'text-[10px] text-[#00FF00] font-mono';
      cleanBadge.textContent = 'CLEAN';
      doneRow.appendChild(cleanBadge);

      if (vm.isDeepDecontaminated) {
        const deconBadge = document.createElement('span');
        deconBadge.className = 'text-[10px] text-[#FFFFFF] font-mono';
        deconBadge.setAttribute('title', 'Anti-steganography pipeline applied');
        deconBadge.setAttribute('aria-label', 'Anti-steganography pipeline applied');
        deconBadge.textContent = 'DECONTAMINATED';
        doneRow.appendChild(deconBadge);
      }

      detailsCol.appendChild(doneRow);
    }

    if (vm.isProcessing && vm.processingLabel !== null) {
      const progressRow = document.createElement('div');
      progressRow.className = 'text-[10px] text-[#FFFFFF] font-mono flex justify-between';

      const stageSpan = document.createElement('span');
      stageSpan.textContent = vm.processingLabel;
      progressRow.appendChild(stageSpan);

      const pctSpan = document.createElement('span');
      pctSpan.textContent = `${vm.progressPercent}%`;
      progressRow.appendChild(pctSpan);

      detailsCol.appendChild(progressRow);
    }

    if (vm.isError && vm.errorMessage !== null) {
      const errRow = document.createElement('div');
      errRow.className = 'text-xs text-[#FF4444] font-mono mt-1';
      errRow.textContent = vm.errorMessage;
      detailsCol.appendChild(errRow);
    }

    leftRow.appendChild(detailsCol);
    itemEl.appendChild(leftRow);

    if (vm.isDone && item.result) {
      const btnGroup = document.createElement('div');
      btnGroup.className = 'flex items-center gap-4 shrink-0';

      const inspectBtn = document.createElement('button');
      inspectBtn.type = 'button';
      inspectBtn.className = 'btn-inspect text-xs font-mono text-[#FFFFFF] hover:text-[#00FF00] transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]';
      inspectBtn.appendChild(createSvgIcon('eye'));
      const inspectLabel = document.createElement('span');
      inspectLabel.textContent = 'Inspect';
      inspectBtn.appendChild(inspectLabel);
      inspectBtn.addEventListener('click', () => callbacks.onInspectForensics(item));
      btnGroup.appendChild(inspectBtn);

      const downloadBtn = document.createElement('button');
      downloadBtn.type = 'button';
      downloadBtn.className = 'btn-download text-[#00FF00] hover:text-[#FFFFFF] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]';
      downloadBtn.appendChild(createSvgIcon('download'));
      const downloadLabel = document.createElement('span');
      downloadLabel.textContent = 'Download';
      downloadBtn.appendChild(downloadLabel);
      downloadBtn.addEventListener('click', () => callbacks.onDownloadSingle(item));
      btnGroup.appendChild(downloadBtn);

      itemEl.appendChild(btnGroup);
    }

    itemsContainer.appendChild(itemEl);
  });

  return container;
}
