import { icons } from '../icons';

export function renderHeader(onOpenLegal: () => void): HTMLElement {
  const header = document.createElement('header');
  header.className = 'border-b border-neutral-900 bg-black/95 sticky top-0 z-30 px-4 sm:px-8 py-3';

  header.innerHTML = `
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <!-- Brand & Title -->
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-neutral-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          ${icons.shieldCheck}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold tracking-tight text-white font-mono">DoDecoder</h1>
            <span class="text-[10px] tracking-wider uppercase px-1.5 py-0.2 rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-400 font-mono">
              Fast Engine
            </span>
          </div>
          <p class="text-[11px] text-neutral-400">Media Anti-Forensics & Untraceable Re-Encoding • By Mochilamv & Antigravity</p>
        </div>
      </div>

      <!-- Quick Status & Info -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-800 bg-[#080808] text-neutral-300 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>100% In-Browser</span>
        </div>

        <button id="btn-legal" class="px-3 py-1 text-xs font-mono text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 bg-[#080808] hover:bg-neutral-900 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
          ${icons.info}
          <span>About & Licenses</span>
        </button>
      </div>
    </div>
  `;

  header.querySelector('#btn-legal')?.addEventListener('click', onOpenLegal);

  return header;
}
