export function renderSettingsPanel(): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'w-full flex items-center justify-between py-6 text-[#FFFFFF] select-none';

  bar.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-base sm:text-lg font-bold tracking-widest uppercase font-mono text-[#FFFFFF]">Dodecoder</span>
    </div>

    <div class="flex items-center gap-6">
      <a href="https://github.com/mochilamv/dodecoder" target="_blank" rel="noopener noreferrer" 
         class="text-xs font-mono uppercase tracking-wider text-[#FFFFFF] hover:text-[#00FF00] transition-colors focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2">
        GitHub
      </a>
    </div>
  `;

  return bar;
}
