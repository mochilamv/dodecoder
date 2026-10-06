import { icons } from '../icons';

export function renderLegalModal(onClose: () => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-sm';

  const modal = document.createElement('div');
  modal.className = 'w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#000000] text-[#FFFFFF] p-6 focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  modal.setAttribute('tabindex', '-1');

  modal.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-mono font-bold tracking-wider text-[#FFFFFF]">Licenses & Legal</h2>
      <button id="btn-close-legal" class="p-2 text-[#FFFFFF] hover:text-[#FF4444] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2" aria-label="Close modal">
        ${icons.close}
      </button>
    </div>

    <div class="space-y-8 font-mono text-xs text-[#FFFFFF]">
      
      <section class="space-y-3">
        <h3 class="text-sm font-bold text-[#FFFFFF] uppercase tracking-widest">MIT License</h3>
        <p>Copyright (c) 2024 Mochilamv</p>
        <p class="leading-relaxed text-[#FFFFFF]/80">
          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the "Software"), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:
        </p>
        <p class="leading-relaxed text-[#FFFFFF]/80">
          The above copyright notice and this permission notice shall be included in all
          copies or substantial portions of the Software.
        </p>
        <p class="leading-relaxed font-bold text-[#FFFFFF]">
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
          SOFTWARE.
        </p>
      </section>

      <div class="h-px bg-[#FFFFFF]/20 w-full"></div>

      <section class="space-y-3">
        <h3 class="text-sm font-bold text-[#FFFFFF] uppercase tracking-widest">Third-Party Dependencies</h3>
        <ul class="space-y-4">
          <li>
            <div class="font-bold text-[#FFFFFF]">Lucide Icons</div>
            <div class="text-[#FFFFFF]/70">Licensed under ISC</div>
            <div class="text-[#FFFFFF]/70">SVG iconography used in the interface.</div>
          </li>
          <li>
            <div class="font-bold text-[#FFFFFF]">Tailwind CSS</div>
            <div class="text-[#FFFFFF]/70">Licensed under MIT</div>
            <div class="text-[#FFFFFF]/70">Utility-first CSS framework for interface styling.</div>
          </li>
        </ul>
      </section>

    </div>
  `;

  const closeBtn = modal.querySelector('#btn-close-legal');
  if (closeBtn) {
    closeBtn.addEventListener('click', onClose);
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) onClose();
  });

  overlay.appendChild(modal);

  setTimeout(() => modal.focus(), 10);

  return overlay;
}
