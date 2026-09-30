export interface SettingsState {
  quality: number;
  extremeSanitization: boolean;
}

export function renderSettingsPanel(
  state: SettingsState,
  onChange: (updated: Partial<SettingsState>) => void
): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'w-full flex items-center justify-between py-6 text-[#FFFFFF] select-none';

  bar.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-base sm:text-lg font-bold tracking-widest uppercase font-mono text-[#FFFFFF]">Dodecoder</span>
    </div>

    <div class="flex items-center gap-6">
      <label class="flex items-center gap-2.5 cursor-pointer"
             title="Deep Decontamination: 3x3 median filtering, spatial micro-resampling, and noise dithering"
             aria-label="Toggle extreme sanitization and deep decontamination">
        <span class="text-xs font-mono uppercase tracking-wider text-[#FFFFFF]">Extreme Mode</span>
        <input
          id="extreme-toggle"
          type="checkbox"
          class="sr-only peer"
          ${state.extremeSanitization ? 'checked' : ''}
        />
        <div class="w-8 h-4 bg-[#000000] outline outline-1 outline-[#FFFFFF] peer-focus-visible:outline-2 peer-focus-visible:outline-[#00FF00] peer-checked:bg-[#00FF00] peer-checked:outline-[#00FF00] relative transition-colors cursor-pointer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFFFF] after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-[#000000]"></div>
      </label>

      <a href="https://github.com/mochilamv/dodecoder" target="_blank" rel="noopener noreferrer" 
         class="text-xs font-mono uppercase tracking-wider text-[#FFFFFF] hover:text-[#00FF00] transition-colors focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2">
        GitHub
      </a>
    </div>
  `;

  const extremeToggle = bar.querySelector<HTMLInputElement>('#extreme-toggle');
  if (extremeToggle) {
    extremeToggle.addEventListener('change', () => {
      onChange({ extremeSanitization: extremeToggle.checked });
    });
  }

  return bar;
}
