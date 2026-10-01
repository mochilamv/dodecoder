import { icons } from '../icons';

export function renderDropzone(onFilesSelected: (files: File[]) => void): HTMLElement {
  const dropzone = document.createElement('div');
  dropzone.className =
    'relative my-12 sm:my-20 py-20 sm:py-28 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 bg-[#000000] focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-4';
  dropzone.setAttribute('tabindex', '0');
  dropzone.setAttribute('role', 'button');
  dropzone.setAttribute('aria-label', 'Sanitization Dropzone: Drop image, video, or audio files to sanitize. Batch processing for images, videos, and audio. Reconstruction.');
  dropzone.setAttribute('title', 'Batch processing for images, videos, and audio. Reconstruction.');

  dropzone.innerHTML = `
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="flex flex-col items-center justify-center space-y-4 pointer-events-none">
      <div class="text-[#FFFFFF]">
        ${icons.upload}
      </div>

      <div class="space-y-2">
        <div class="text-sm sm:text-base font-mono tracking-wider text-[#FFFFFF] uppercase">
          Drop media here or browse
        </div>
        <p class="text-xs font-mono text-[#FFFFFF]/70 max-w-md mx-auto">
          Batch processing for images, videos, and audio. Reconstruction.
        </p>
      </div>

      <span class="text-xs font-mono text-[#FFFFFF] tracking-widest hover:text-[#00FF00] transition-colors">
        Select Files
      </span>
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

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
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
