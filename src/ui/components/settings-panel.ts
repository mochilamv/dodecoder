export interface SettingsState {
  quality: number;
}

export function renderSettingsPanel(
  state: SettingsState,
  onChange: (updated: Partial<SettingsState>) => void
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200';

  panel.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">Encoder Quality</span>
          <span id="quality-val" class="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
            ${Math.round(state.quality * 100)}%
          </span>
        </div>
        <p class="text-[11px] text-neutral-400 mt-1">
          Adjusts image and media compression. Full reconstruction and metadata removal are always applied.
        </p>
      </div>

      <div class="w-full sm:w-72 space-y-1.5">
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
          <span>60% (Max Compression)</span>
          <span>85% (Recommended)</span>
          <span>95% (High Quality)</span>
        </div>
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

  return panel;
}
