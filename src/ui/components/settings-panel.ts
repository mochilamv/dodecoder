import { DefenseLevel, OutputFormat } from '../../core/types';
import { icons } from '../icons';

export interface SettingsState {
  defenseLevel: DefenseLevel;
  outputFormat: OutputFormat;
  quality: number;
}

export function renderSettingsPanel(
  state: SettingsState,
  onChange: (updated: Partial<SettingsState>) => void
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'border border-neutral-800/80 bg-[#070707] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200';

  panel.innerHTML = `
    <div class="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
      <div class="flex items-center gap-2">
        <span class="text-emerald-400">${icons.cpu}</span>
        <h2 class="text-sm font-semibold uppercase tracking-wider text-neutral-300 font-mono">Defense Configuration HUD</h2>
      </div>
      <span class="text-xs text-neutral-500 font-mono">In-Memory Engine</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 1. Defense Mode Selection -->
      <div>
        <label class="block text-xs font-mono uppercase text-neutral-400 mb-2">Sanitization Depth</label>
        <div class="space-y-2" id="defense-level-group">
          <label class="flex items-start gap-2.5 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-black cursor-pointer transition-colors has-[:checked]:border-emerald-500/60 has-[:checked]:bg-emerald-950/20">
            <input type="radio" name="defense-level" value="standard" class="mt-0.5 accent-emerald-500" ${state.defenseLevel === 'standard' ? 'checked' : ''} />
            <div>
              <div class="text-xs font-semibold text-white">Standard Cleanse</div>
              <div class="text-[11px] text-neutral-400">Decimates container, 100% EXIF, GPS, IFD1 thumbnails & MakerNotes wiped.</div>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-black cursor-pointer transition-colors has-[:checked]:border-emerald-500/60 has-[:checked]:bg-emerald-950/20">
            <input type="radio" name="defense-level" value="hardened" class="mt-0.5 accent-emerald-500" ${state.defenseLevel === 'hardened' ? 'checked' : ''} />
            <div>
              <div class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span>Hardened (Recommended)</span>
                <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Anti-PRNU</span>
              </div>
              <div class="text-[11px] text-neutral-400">Sub-pixel jitter & micro-resampling to break sensor physical fingerprint.</div>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-black cursor-pointer transition-colors has-[:checked]:border-emerald-500/60 has-[:checked]:bg-emerald-950/20">
            <input type="radio" name="defense-level" value="paranoid" class="mt-0.5 accent-emerald-500" ${state.defenseLevel === 'paranoid' ? 'checked' : ''} />
            <div>
              <div class="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <span>Paranoid Mode</span>
                <span class="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded">Dither + Jitter</span>
              </div>
              <div class="text-[11px] text-neutral-400">Adds controlled pseudo-random micro-dithering in flat fields to defeat wavelet tests.</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 2. Re-encoding Output Format -->
      <div>
        <label class="block text-xs font-mono uppercase text-neutral-400 mb-2">Re-Encoding Container</label>
        <div class="space-y-2">
          <label class="flex items-center gap-2 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-black cursor-pointer transition-colors has-[:checked]:border-emerald-500/60">
            <input type="radio" name="output-format" value="image/webp" class="accent-emerald-500" ${state.outputFormat === 'image/webp' ? 'checked' : ''} />
            <div>
              <div class="text-xs font-medium text-white">WebP (Optimal Anti-Forensics)</div>
              <div class="text-[10px] text-neutral-500">Zero legacy EXIF chunks, highest compression ratio</div>
            </div>
          </label>

          <label class="flex items-center gap-2 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-black cursor-pointer transition-colors has-[:checked]:border-emerald-500/60">
            <input type="radio" name="output-format" value="image/jpeg" class="accent-emerald-500" ${state.outputFormat === 'image/jpeg' ? 'checked' : ''} />
            <div>
              <div class="text-xs font-medium text-white">JPEG (Normalized DQT)</div>
              <div class="text-[10px] text-neutral-500">Standard IJG quantization tables; strips camera signatures</div>
            </div>
          </label>

          <label class="flex items-center gap-2 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-black cursor-pointer transition-colors has-[:checked]:border-emerald-500/60">
            <input type="radio" name="output-format" value="image/png" class="accent-emerald-500" ${state.outputFormat === 'image/png' ? 'checked' : ''} />
            <div>
              <div class="text-xs font-medium text-white">PNG (Lossless Pure Pixels)</div>
              <div class="text-[10px] text-neutral-500">Only IHDR/IDAT/IEND chunks; removes all tEXt/iTXt</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 3. Quality & Compression Factor -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-mono uppercase text-neutral-400">Encoder Quality</label>
          <span id="quality-val" class="text-xs font-mono text-emerald-400 font-bold">${Math.round(state.quality * 100)}%</span>
        </div>
        <div class="p-3 bg-black border border-neutral-800 rounded-lg space-y-3">
          <input
            id="quality-slider"
            type="range"
            min="75"
            max="98"
            step="1"
            value="${Math.round(state.quality * 100)}"
            class="w-full accent-emerald-500 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>75% (Compact)</span>
            <span>92% (Forensic Sweetspot)</span>
            <span>98% (Near Lossless)</span>
          </div>
          <div class="p-2 rounded bg-neutral-950 border border-neutral-900 text-[10px] text-neutral-400">
            Higher quality preserves fine visual details while re-encoding breaks camera encoder artifacts.
          </div>
        </div>
      </div>
    </div>
  `;

  // Event Listeners
  const defenseRadios = panel.querySelectorAll<HTMLInputElement>('input[name="defense-level"]');
  defenseRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      onChange({ defenseLevel: radio.value as DefenseLevel });
    });
  });

  const formatRadios = panel.querySelectorAll<HTMLInputElement>('input[name="output-format"]');
  formatRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      onChange({ outputFormat: radio.value as OutputFormat });
    });
  });

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
