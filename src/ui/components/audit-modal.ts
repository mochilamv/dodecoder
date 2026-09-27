import { SanitizedResult } from '../../core/types';
import { icons } from '../icons';

export function renderAuditModal(result: SanitizedResult, onClose: () => void): HTMLElement {
  const modal = document.createElement('div');
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in';

  const origPreview = URL.createObjectURL(result.auditBefore.fileName.match(/\.(mp4|mov|mp3|wav)$/i) ? result.blob : result.blob);
  const cleanPreview = URL.createObjectURL(result.blob);

  modal.innerHTML = `
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            ${icons.eye}
          </div>
          <div>
            <h2 class="text-sm font-bold font-mono text-white tracking-wide">FORENSIC AUDIT ROOM</h2>
            <p class="text-[11px] text-neutral-400 font-mono">Comparative verification: Raw input vs Sanitized payload</p>
          </div>
        </div>

        <button id="modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${icons.close}
        </button>
      </div>

      <!-- Scrollable Audit Body -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300">
        <!-- Visual & Hash Comparison Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ORIGINAL -->
          <div class="border border-red-900/40 bg-[#0d0909] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-red-950 pb-2">
              <span class="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
                ${icons.alertTriangle} Input Artifact (Raw)
              </span>
              <span class="text-[10px] font-mono text-neutral-500">${result.originalName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              <img src="${cleanPreview}" alt="Original Preview" class="max-h-full max-w-full object-contain" />
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/40 text-[10px] font-mono text-red-400">
                ${result.auditBefore.tags.length} Metadata Leaks Detected
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span class="text-white">${formatBytes(result.originalSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Input SHA-256:</span>
                <div class="text-[10px] text-neutral-500 break-all">${result.auditBefore.sha256}</div>
              </div>
            </div>
          </div>

          <!-- SANITIZED -->
          <div class="border border-emerald-900/40 bg-[#080d0a] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-emerald-950 pb-2">
              <span class="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                ${icons.shieldCheck} Sanitized Output (Pure Payload)
              </span>
              <span class="text-[10px] font-mono text-emerald-300">${result.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              <img src="${cleanPreview}" alt="Sanitized Preview" class="max-h-full max-w-full object-contain" />
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${icons.check} 0 Metadata Tags • Normalized DQT
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Sanitized Size:</span>
                <span class="text-emerald-400 font-semibold">${formatBytes(result.sanitizedSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Output SHA-256:</span>
                <div class="text-[10px] text-emerald-400/80 break-all">${result.sha256}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata Tag Deep Inspection -->
        <div class="border border-neutral-800 rounded-xl bg-neutral-950 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 class="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">
              Forensic Tag Extraction Breakdown
            </h3>
            <span class="text-[10px] font-mono text-neutral-400">
              Before: <strong class="text-red-400">${result.auditBefore.tags.length}</strong> tags | After: <strong class="text-emerald-400">0</strong> tags
            </span>
          </div>

          ${
            result.auditBefore.tags.length > 0
              ? `
            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="border-b border-neutral-800 text-neutral-500 text-[10px]">
                    <th class="py-1.5 px-2">Category</th>
                    <th class="py-1.5 px-2">Vulnerability / Tag Name</th>
                    <th class="py-1.5 px-2">Extracted Value</th>
                    <th class="py-1.5 px-2">Forensic Risk</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-900">
                  ${result.auditBefore.tags
                    .map(
                      tag => `
                    <tr class="hover:bg-neutral-900/50">
                      <td class="py-2 px-2 text-neutral-400 text-[11px]">${tag.category}</td>
                      <td class="py-2 px-2 text-white font-medium">${tag.name}</td>
                      <td class="py-2 px-2 text-neutral-300 max-w-xs truncate" title="${tag.value}">${tag.value}</td>
                      <td class="py-2 px-2">
                        <span class="px-1.5 py-0.5 rounded text-[9px] uppercase ${
                          tag.severity === 'critical'
                            ? 'bg-red-950 text-red-400 border border-red-900'
                            : 'bg-amber-950 text-amber-400 border border-amber-900'
                        }">
                          ${tag.severity}
                        </span>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
              : `
            <div class="p-3 text-center text-xs text-neutral-500 font-mono">
              No embedded EXIF tags were present in the source input file.
            </div>
          `
          }
        </div>

        <!-- Binary Marker & Container Structure -->
        <div class="border border-neutral-800 rounded-xl bg-neutral-950 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 class="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">
              Container Binary Segments
            </h3>
            <span class="text-[10px] font-mono text-emerald-400">All vendor markers eliminated</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Source Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-semibold">Source Segments:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${result.auditBefore.markers
                  .map(
                    m => `
                  <div class="flex items-center justify-between p-2 rounded bg-black border ${
                    m.isSanitizedSafe ? 'border-neutral-800' : 'border-red-900/50 bg-red-950/10'
                  } text-[11px] font-mono">
                    <span class="${m.isSanitizedSafe ? 'text-neutral-300' : 'text-red-400 font-semibold'}">${m.name}</span>
                    <span class="text-[10px] text-neutral-500">${m.marker}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Sanitized Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-semibold">Sanitized Clean Stream:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${result.auditAfter.markers
                  .map(
                    m => `
                  <div class="flex items-center justify-between p-2 rounded bg-black border border-emerald-900/40 text-[11px] font-mono">
                    <span class="text-emerald-400">${m.name}</span>
                    <span class="text-[10px] text-emerald-600">${m.marker}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Defense Report Summary -->
        <div class="p-3.5 rounded-xl border border-neutral-800 bg-black flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-neutral-300">
            ${icons.shieldCheck}
            <span>Applied Defense: <strong class="text-white uppercase">${result.defenseLevel}</strong> Mode</span>
          </div>
          <span class="text-[11px] text-neutral-500">Processed in RAM • Zero Trace</span>
        </div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('#modal-close')!;
  closeBtn.addEventListener('click', () => {
    URL.revokeObjectURL(origPreview);
    URL.revokeObjectURL(cleanPreview);
    onClose();
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      URL.revokeObjectURL(origPreview);
      URL.revokeObjectURL(cleanPreview);
      onClose();
    }
  });

  return modal;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
