import { icons } from '../icons';

export function renderDropzone(onFilesSelected: (files: File[]) => void): HTMLElement {
  const dropzone = document.createElement('div');
  dropzone.className =
    'relative border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 bg-[#040404] hover:bg-[#070707] rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 group cursor-pointer overflow-hidden';

  dropzone.innerHTML = `
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <!-- Ambient Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-neutral-900/80 border border-neutral-800 group-hover:border-emerald-500/40 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 transition-colors shadow-inner">
        ${icons.upload}
      </div>

      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-semibold text-neutral-200 group-hover:text-white font-mono">
          Drag & Drop Media to Decimate & Anonymize
        </h3>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Drop photos, videos, or audio recordings. Files are processed exclusively in RAM with zero outbound network traffic.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-neutral-500">
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-black">JPEG / WebP / PNG</span>
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-black">MP4 / MOV / WebM</span>
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-black">MP3 / WAV</span>
        <span class="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-950/20">Zero-Trace RAM</span>
      </div>

      <button type="button" class="mt-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-xs font-mono text-white transition-all shadow-md group-hover:border-emerald-500/50">
        Browse Local Files
      </button>
    </div>
  `;

  const input = dropzone.querySelector<HTMLInputElement>('#file-input')!;

  dropzone.addEventListener('click', () => {
    input.click();
  });

  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      onFilesSelected(Array.from(input.files));
      input.value = ''; // Reset input to allow selecting same file again
    }
  });

  // Drag and drop events
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('border-emerald-400', 'bg-neutral-950/80');
  });

  dropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('border-emerald-400', 'bg-neutral-950/80');
  });

  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('border-emerald-400', 'bg-neutral-950/80');

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  return dropzone;
}
