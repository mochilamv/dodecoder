import { SanitizedResult } from '../../core/types';
import { icons } from '../icons';

export function renderAuditModal(result: SanitizedResult, onClose: () => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-sm';

  const modal = document.createElement('div');
  modal.className = 'w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#000000] text-[#FFFFFF] p-6 focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  modal.setAttribute('tabindex', '-1');

  const before = result.auditBefore;
  const after = result.auditAfter;

  modal.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-mono font-bold tracking-wider text-[#FFFFFF]">Forensic Audit Report</h2>
      <button id="btn-close-modal" class="p-2 text-[#FFFFFF] hover:text-[#FF4444] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2" aria-label="Close modal">
        ${icons.close}
      </button>
    </div>

    <div class="space-y-8">
      <!-- Overview -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <div class="text-[10px] text-[#FFFFFF] font-mono uppercase">Original</div>
          <div class="text-sm font-mono text-[#FFFFFF] truncate" title="${result.originalName}">${result.originalName}</div>
          <div class="text-xs text-[#FF4444] font-mono">${formatBytes(result.originalSize)}</div>
          <div class="text-[10px] text-[#FF4444] font-mono break-all mt-1" title="Original SHA-256">${before.sha256}</div>
        </div>
        <div class="space-y-1">
          <div class="text-[10px] text-[#FFFFFF] font-mono uppercase">Sanitized</div>
          <div class="text-sm font-mono text-[#00FF00] truncate" title="${result.sanitizedName}">${result.sanitizedName}</div>
          <div class="text-xs text-[#00FF00] font-mono">${formatBytes(result.sanitizedSize)}</div>
          <div class="text-[10px] text-[#00FF00] font-mono break-all mt-1" title="Sanitized SHA-256">${after.sha256}</div>
        </div>
      </div>

      <!-- Payload Diff -->
      <div class="space-y-4">
        <h3 class="text-xs font-mono font-bold tracking-widest text-[#FFFFFF] uppercase">Vector Analysis</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${renderMetric('Format / MIME', before.mimeType, after.mimeType)}
          ${renderMetric('EXIF / TIFF', before.hasExif ? 'Detected' : 'Clean', after.hasExif ? 'Detected' : 'Clean')}
          ${renderMetric('GPS Coordinates', before.hasGps ? 'Exposed' : 'Clean', after.hasGps ? 'Exposed' : 'Clean')}
          ${renderMetric('MakerNotes / OEM', before.hasMakerNotes ? 'Exposed' : 'Clean', after.hasMakerNotes ? 'Exposed' : 'Clean')}
          ${renderMetric('Thumbnail Leak', before.hasThumbnail ? 'Exposed' : 'Clean', after.hasThumbnail ? 'Exposed' : 'Clean')}
          ${renderMetric('Steganography Deep Decon', 'N/A', !!result.isDeepDecontaminated ? 'Applied' : 'Skipped')}
        </div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('#btn-close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', onClose);
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) onClose();
  });

  overlay.appendChild(modal);

  // Auto-focus modal for accessibility
  setTimeout(() => modal.focus(), 10);

  return overlay;
}

function renderMetric(label: string, beforeVal: string, afterVal: string): string {
  const isAfterClean = afterVal === 'Clean' || afterVal === 'Applied';
  const afterColor = isAfterClean ? 'text-[#00FF00]' : 'text-[#FFFFFF]';
  const beforeColor = (beforeVal !== 'Clean' && beforeVal !== 'N/A') ? 'text-[#FF4444]' : 'text-[#FFFFFF]';

  return `
    <div class="flex flex-col space-y-1">
      <div class="text-[10px] text-[#FFFFFF] font-mono tracking-wider uppercase">${label}</div>
      <div class="flex items-center gap-2 text-xs font-mono">
        <span class="${beforeColor}">${beforeVal}</span>
        <span class="text-[#FFFFFF]">-&gt;</span>
        <span class="${afterColor} font-bold">${afterVal}</span>
      </div>
    </div>
  `;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
