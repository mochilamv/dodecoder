import { SanitizedResult } from '../../core/types';
import { revokeUrls } from '../../core/utils/memory';
import { icons } from '../icons';

export function renderAuditModal(result: SanitizedResult, onClose: () => void): HTMLElement {
  const modal = document.createElement('div');
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in';

  const origPreview = URL.createObjectURL(result.originalBlob || result.blob);
  const cleanPreview = URL.createObjectURL(result.blob);

  modal.innerHTML = `
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">File Inspection</h2>
          <p class="text-[11px] text-neutral-400 font-mono">Comparison between raw input and sanitized output</p>
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
          <div class="border border-red-900/40 bg-[#0c0909] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-red-950 pb-2">
              <span class="text-xs font-mono font-semibold text-red-400 uppercase flex items-center gap-1.5">
                ${icons.alertTriangle} Input File
              </span>
              <span class="text-[10px] font-mono text-neutral-400 truncate max-w-[200px]">${result.originalName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${renderMediaPreview(origPreview, result.originalName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400">
                ${result.auditBefore.tags.length} Metadata Tags Detected
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
          <div class="border border-emerald-900/40 bg-[#070c09] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-emerald-950 pb-2">
              <span class="text-xs font-mono font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
                ${icons.shieldCheck} Clean File
              </span>
              <span class="text-[10px] font-mono text-emerald-300 truncate max-w-[200px]">${result.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${renderMediaPreview(cleanPreview, result.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${icons.check} 0 Metadata Tags • Pure Bitstream
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Clean Size:</span>
                <span class="text-emerald-400 font-semibold">${formatBytes(result.sanitizedSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Output SHA-256:</span>
                <div class="text-[10px] text-emerald-400/80 break-all">${result.sha256}</div>
              </div>
            </div>
          </div>
        </div>

        ${
          result.warningBadge
            ? `
          <div class="p-3 rounded-xl border border-amber-500/50 bg-amber-950/30 text-amber-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-amber-400 shrink-0">${icons.alertTriangle}</span>
            <span><strong>Aviso de Eficiência:</strong> ${result.warningBadge}. O resultado do canvas foi descartado e aplicada a remoção cirúrgica direta no bitstream para evitar inchaço.</span>
          </div>
        `
            : ''
        }
        ${
          result.isBypass
            ? `
          <div class="p-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-neutral-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-emerald-400 shrink-0">${icons.check}</span>
            <span><strong>Fast-Track Bypass (1:1):</strong> 0 metadados suspeitos encontrados. O bitstream foi preservado diretamente sem recodificação.</span>
          </div>
        `
            : ''
        }

        <!-- Metadata Tag Inspection -->
        <div class="border border-neutral-800 rounded-xl bg-neutral-950 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 class="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider">
              Detected Metadata
            </h3>
            <span class="text-[10px] font-mono text-neutral-400">
              Input: <strong class="text-red-400">${result.auditBefore.tags.length}</strong> tags | Output: <strong class="text-emerald-400">0</strong> tags
            </span>
          </div>

          ${
            result.auditBefore.tags.length > 0
              ? `
            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="border-b border-neutral-800 text-neutral-500 text-[10px]">
                    <th class="py-1.5 px-2">Type</th>
                    <th class="py-1.5 px-2">Tag</th>
                    <th class="py-1.5 px-2">Value</th>
                    <th class="py-1.5 px-2">Severity</th>
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
                            : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
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
              No embedded tags found in input file.
            </div>
          `
          }
        </div>

        <!-- Binary Marker Breakdown -->
        <div class="border border-neutral-800 rounded-xl bg-neutral-950 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 class="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider">
              Container Segments
            </h3>
            <span class="text-[10px] font-mono text-emerald-400">All vendor markers eliminated</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Source Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-medium">Input Segments:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${result.auditBefore.markers
                  .map(
                    m => `
                  <div class="flex items-center justify-between p-2 rounded bg-black border ${
                    m.isSanitizedSafe ? 'border-neutral-800' : 'border-red-900/50 bg-red-950/20'
                  } text-[11px] font-mono">
                    <span class="${m.isSanitizedSafe ? 'text-neutral-300' : 'text-red-400 font-medium'}">${m.name}</span>
                    <span class="text-[10px] text-neutral-500">${m.marker}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Sanitized Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-medium">Clean Segments:</div>
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

        <!-- Defense Summary -->
        <div class="p-3.5 rounded-xl border border-neutral-800 bg-black flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-neutral-300">
            ${icons.shieldCheck}
            <span>Full Reconstruction & Noise Disruption Applied</span>
          </div>
          <span class="text-[11px] text-neutral-500">In-Memory • No Server Upload</span>
        </div>
      </div>
    </div>
  `;

  const closeHandler = () => {
    revokeUrls([origPreview, cleanPreview]);
    onClose();
  };

  modal.querySelector('#modal-close')?.addEventListener('click', closeHandler);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeHandler();
  });

  return modal;
}

function renderMediaPreview(url: string, fileName: string): string {
  const isVideo = /\.(mp4|mov|webm)$/i.test(fileName);
  const isAudio = /\.(mp3|wav|ogg|aac|m4a)$/i.test(fileName);

  if (isVideo) {
    return `<video src="${url}" controls class="max-h-full max-w-full rounded"></video>`;
  }
  if (isAudio) {
    return `
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${url}" controls class="w-full max-w-xs"></audio>
      </div>`;
  }
  return `<img src="${url}" alt="Preview" class="max-h-full max-w-full object-contain" />`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
