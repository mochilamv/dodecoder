import { icons } from '../icons';

export function renderDropzone(onFilesSelected: (files: File[]) => void): HTMLElement {
  const dropzone = document.createElement('div');
  dropzone.className =
    'relative p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  dropzone.setAttribute('tabindex', '0');
  dropzone.setAttribute('aria-label', 'Dropzone: Drop files here or click to browse. Batch processing for images, videos, and audio. Full pixel reconstruction and zero metadata.');
  dropzone.setAttribute('title', 'Batch processing for images, videos, and audio. Full pixel reconstruction and zero metadata.');

  dropzone.innerHTML = `
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 flex items-center justify-center text-[#FFFFFF] transition-colors">
        ${icons.upload}
      </div>

      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-medium text-[#FFFFFF] font-mono">
          Drop files here or click to browse
        </h3>
      </div>

      <button type="button" tabindex="-1" class="mt-2 px-5 py-2 text-xs font-mono text-[#FFFFFF] transition-all">
        Select Files
      </button>
    </div>
  `;

  const input = dropzone.querySelector<HTMLInputElement>('#file-input')!;

  dropzone.addEventListener('click', () => {
    input.click();
  });
  
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
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
    // Use focus-style color during drag over
    dropzone.style.outline = '2px solid #00FF00';
  });

  dropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.style.outline = '';
  });

  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.style.outline = '';

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  return dropzone;
}
