import { icons } from '../icons';

export function renderDropzone(onFilesSelected: (files: File[]) => void): HTMLElement {
  const dropzone = document.createElement('div');
  dropzone.className =
    'relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden';

  dropzone.innerHTML = `
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
        ${icons.upload}
      </div>

      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-medium text-neutral-200 group-hover:text-white font-mono">
          Drop files here or click to browse
        </h3>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Batch processing for images, videos, and audio. Full pixel reconstruction and zero metadata.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-neutral-400">
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">Images (JPEG, PNG, WebP)</span>
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">Videos (MP4, MOV)</span>
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">Audio (MP3, WAV)</span>
      </div>

      <button type="button" class="mt-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-200 hover:text-white transition-all">
        Select Files
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
      input.value = '';
    }
  });

  // Drag and drop events
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('border-emerald-500', 'bg-neutral-950');
  });

  dropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('border-emerald-500', 'bg-neutral-950');
  });

  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('border-emerald-500', 'bg-neutral-950');

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  return dropzone;
}
