export interface SettingsState {
  quality: number;
  extremeSanitization: boolean;
}

export function renderSettingsPanel(
  state: SettingsState,
  onChange: (updated: Partial<SettingsState>) => void
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'p-4 sm:p-5 mb-6 text-[#FFFFFF]';

  panel.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      <!-- Encoder Quality -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-[#FFFFFF]" 
                title="Hardcoded strictly to 60% with YUV 4:2:0 Chroma Subsampling to neutralize PRNU and steganographic carriers."
                aria-label="Encoder Quality: Hardcoded strictly to 60% with YUV 4:2:0 Chroma Subsampling to neutralize PRNU and steganographic carriers.">
            Encoder Quality
          </span>
          <span id="quality-val" class="text-xs font-mono font-bold text-[#FFFFFF] px-2 py-0.5">
            60%
          </span>
          <span class="text-[10px] text-[#00FF00] px-1.5 py-0.5 font-mono font-normal">
            OPSEC Enforced
          </span>
        </div>
      </div>

      <!-- Extreme Sanitization Toggle -->
      <div class="flex items-center justify-between gap-4 p-3">
        <div class="flex items-center gap-2">
          <label for="extreme-toggle" class="text-xs font-mono font-semibold uppercase tracking-wider text-[#FFFFFF] cursor-pointer"
                 title="Spatial micro-resampling, 3x3 median filter, and visibility dithering against steganography."
                 aria-label="Extreme Sanitization: Spatial micro-resampling, 3x3 median filter, and visibility dithering against steganography.">
            Extreme Sanitization
          </label>
        </div>

        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            id="extreme-toggle"
            type="checkbox"
            class="sr-only peer"
            ${state.extremeSanitization ? 'checked' : ''}
          />
          <div class="w-9 h-5 bg-[#000000] border-2 border-[#FFFFFF] peer-focus-visible:outline-2 peer-focus-visible:outline-[#00FF00] peer-checked:bg-[#00FF00] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFFFF] after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>
    </div>
  `;

  const extremeToggle = panel.querySelector<HTMLInputElement>('#extreme-toggle');
  if (extremeToggle) {
    extremeToggle.addEventListener('change', () => {
      onChange({ extremeSanitization: extremeToggle.checked });
    });
  }

  return panel;
}
