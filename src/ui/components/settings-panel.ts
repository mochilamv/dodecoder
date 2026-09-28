export interface SettingsState {
  quality: number;
  extremeSanitization: boolean;
}

export function renderSettingsPanel(
  state: SettingsState,
  onChange: (updated: Partial<SettingsState>) => void
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200';

  panel.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      <!-- Encoder Quality -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">Encoder Quality</span>
            <span id="quality-val" class="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              ${Math.round(state.quality * 100)}%
            </span>
          </div>
        </div>
        <input
          id="quality-slider"
          type="range"
          min="60"
          max="95"
          step="1"
          value="${Math.round(state.quality * 100)}"
          class="w-full accent-neutral-200 cursor-pointer bg-neutral-900"
        />
        <div class="flex justify-between text-[10px] text-neutral-400 font-mono">
          <span>60% Max Compression</span>
          <span>85% Recommended</span>
          <span>95% High Quality</span>
        </div>
      </div>

      <!-- Extreme Sanitization Toggle -->
      <div class="flex items-center justify-between gap-4 p-3 rounded-lg border border-neutral-800/80 bg-neutral-950/50">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <label for="extreme-toggle" class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300 cursor-pointer">
              Extreme Sanitization
            </label>
            <span class="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono font-normal">
              Recommended for VP8L
            </span>
          </div>
          <p class="text-[11px] text-neutral-400">
            Spatial micro-resampling, 3x3 median filter, and visibility dithering against steganography.
          </p>
        </div>

        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            id="extreme-toggle"
            type="checkbox"
            class="sr-only peer"
            ${state.extremeSanitization ? 'checked' : ''}
          />
          <div class="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </div>
  `;

  const qualitySlider = panel.querySelector<HTMLInputElement>('#quality-slider');
  const qualityVal = panel.querySelector<HTMLElement>('#quality-val');
  if (qualitySlider && qualityVal) {
    qualitySlider.addEventListener('input', () => {
      const val = parseInt(qualitySlider.value, 10);
      qualityVal.textContent = `${val}%`;
      onChange({ quality: val / 100 });
    });
  }

  const extremeToggle = panel.querySelector<HTMLInputElement>('#extreme-toggle');
  if (extremeToggle) {
    extremeToggle.addEventListener('change', () => {
      onChange({ extremeSanitization: extremeToggle.checked });
    });
  }

  return panel;
}
