const SVG_NS = 'http://www.w3.org/2000/svg';

function createCloseIcon(): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'w-5 h-5 inline-block');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');

  const line1 = document.createElementNS(SVG_NS, 'line');
  line1.setAttribute('x1', '18');
  line1.setAttribute('y1', '6');
  line1.setAttribute('x2', '6');
  line1.setAttribute('y2', '18');
  svg.appendChild(line1);

  const line2 = document.createElementNS(SVG_NS, 'line');
  line2.setAttribute('x1', '6');
  line2.setAttribute('y1', '6');
  line2.setAttribute('x2', '18');
  line2.setAttribute('y2', '18');
  svg.appendChild(line2);

  return svg;
}

function createParagraph(className: string, text: string): HTMLParagraphElement {
  const p = document.createElement('p');
  if (className) p.className = className;
  p.textContent = text;
  return p;
}

function createDependencyItem(name: string, license: string, description: string): HTMLLIElement {
  const li = document.createElement('li');

  const nameEl = document.createElement('div');
  nameEl.className = 'font-bold text-[#FFFFFF]';
  nameEl.textContent = name;
  li.appendChild(nameEl);

  const licenseEl = document.createElement('div');
  licenseEl.className = 'text-[#FFFFFF]/70';
  licenseEl.textContent = license;
  li.appendChild(licenseEl);

  const descEl = document.createElement('div');
  descEl.className = 'text-[#FFFFFF]/70';
  descEl.textContent = description;
  li.appendChild(descEl);

  return li;
}

export function renderLegalModal(onClose: () => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-sm';

  const modal = document.createElement('div');
  modal.className = 'w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#000000] text-[#FFFFFF] p-6 focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  modal.setAttribute('tabindex', '-1');

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-6';

  const title = document.createElement('h2');
  title.className = 'text-lg font-mono font-bold tracking-wider text-[#FFFFFF]';
  title.textContent = 'Licenses & Legal';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'btn-close-legal';
  closeBtn.type = 'button';
  closeBtn.className = 'p-2 text-[#FFFFFF] hover:text-[#FF4444] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  closeBtn.setAttribute('aria-label', 'Close modal');
  closeBtn.appendChild(createCloseIcon());
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  modal.appendChild(header);

  const body = document.createElement('div');
  body.className = 'space-y-8 font-mono text-xs text-[#FFFFFF]';

  const licenseSection = document.createElement('section');
  licenseSection.className = 'space-y-3';

  const licenseHeading = document.createElement('h3');
  licenseHeading.className = 'text-sm font-bold text-[#FFFFFF] uppercase tracking-widest';
  licenseHeading.textContent = 'MIT License';
  licenseSection.appendChild(licenseHeading);

  licenseSection.appendChild(createParagraph('', 'Copyright (c) 2026 Mochilamv & Antigravity (AI)'));
  licenseSection.appendChild(
    createParagraph(
      'leading-relaxed text-[#FFFFFF]/80',
      'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:'
    )
  );
  licenseSection.appendChild(
    createParagraph(
      'leading-relaxed text-[#FFFFFF]/80',
      'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.'
    )
  );
  licenseSection.appendChild(
    createParagraph(
      'leading-relaxed font-bold text-[#FFFFFF]',
      'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'
    )
  );
  body.appendChild(licenseSection);

  const divider = document.createElement('div');
  divider.className = 'h-px bg-[#FFFFFF]/20 w-full';
  body.appendChild(divider);

  const depsSection = document.createElement('section');
  depsSection.className = 'space-y-3';

  const depsHeading = document.createElement('h3');
  depsHeading.className = 'text-sm font-bold text-[#FFFFFF] uppercase tracking-widest';
  depsHeading.textContent = 'Third-Party Dependencies';
  depsSection.appendChild(depsHeading);

  const depsList = document.createElement('ul');
  depsList.className = 'space-y-4';
  depsList.appendChild(
    createDependencyItem('Lucide Icons', 'Licensed under ISC', 'SVG iconography used in the interface.')
  );
  depsList.appendChild(
    createDependencyItem('Tailwind CSS', 'Licensed under MIT', 'Utility-first CSS framework for interface styling.')
  );
  depsSection.appendChild(depsList);
  body.appendChild(depsSection);

  modal.appendChild(body);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) onClose();
  });

  overlay.appendChild(modal);

  setTimeout(() => modal.focus(), 10);

  return overlay;
}
