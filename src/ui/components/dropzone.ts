const SVG_NS = 'http://www.w3.org/2000/svg';

function createUploadIcon(): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'w-8 h-8');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('d', 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5');
  svg.appendChild(path);

  return svg;
}

export function renderDropzone(onFilesSelected: (files: File[]) => void): HTMLElement {
  const dropzone = document.createElement('div');
  dropzone.className =
    'relative my-12 sm:my-20 py-20 sm:py-28 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 bg-[#000000] focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-4';
  dropzone.setAttribute('tabindex', '0');
  dropzone.setAttribute('role', 'button');
  dropzone.setAttribute('aria-label', 'Sanitization Dropzone: Drop image or MP4/MOV video files to sanitize. Batch processing for images and MP4/MOV videos.');
  dropzone.setAttribute('title', 'Batch processing for images and MP4/MOV videos.');

  const input = document.createElement('input');
  input.type = 'file';
  input.id = 'file-input';
  input.multiple = true;
  input.setAttribute('accept', 'image/*,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.mp4,.mov');
  input.className = 'hidden';
  dropzone.appendChild(input);

  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col items-center justify-center space-y-4 pointer-events-none';

  const iconContainer = document.createElement('div');
  iconContainer.className = 'text-[#FFFFFF]';
  iconContainer.appendChild(createUploadIcon());
  wrapper.appendChild(iconContainer);

  const textGroup = document.createElement('div');
  textGroup.className = 'space-y-2';

  const heading = document.createElement('div');
  heading.className = 'text-sm sm:text-base font-mono tracking-wider text-[#FFFFFF] uppercase';
  heading.textContent = 'Drop images or MP4/MOV here or browse';
  textGroup.appendChild(heading);

  const subtitle = document.createElement('p');
  subtitle.className = 'text-xs font-mono text-[#FFFFFF]/70 max-w-md mx-auto';
  subtitle.textContent = 'Batch processing for images (primary) and MP4/MOV container metadata.';
  textGroup.appendChild(subtitle);

  wrapper.appendChild(textGroup);

  const cta = document.createElement('span');
  cta.className = 'text-xs font-mono text-[#FFFFFF] tracking-widest hover:text-[#00FF00] transition-colors';
  cta.textContent = 'Select Files';
  wrapper.appendChild(cta);

  dropzone.appendChild(wrapper);

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
