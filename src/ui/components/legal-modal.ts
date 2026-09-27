import { icons } from '../icons';

export function renderLegalModal(onClose: () => void): HTMLElement {
  const modal = document.createElement('div');
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in';

  modal.innerHTML = `
    <div class="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-2.5">
          <span class="text-emerald-400">${icons.info}</span>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">LEGAL, LICENSES & PRIVACY COMPLIANCE</h2>
        </div>
        <button id="legal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${icons.close}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed font-sans">
        <!-- 1. Intended Purpose & Privacy Mandates -->
        <section class="space-y-2">
          <h3 class="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            ${icons.shield} Intended Purpose & Data Minimization
          </h3>
          <p class="text-neutral-400">
            DoDecoder is an open-source, client-side data protection and anti-surveillance utility. It is engineered to implement the principle of <strong>Data Minimization</strong> under international privacy regulations:
          </p>
          <ul class="list-disc list-inside space-y-1 text-neutral-400 pl-2">
            <li><strong>GDPR (EU) Art. 5(1)(c):</strong> Personal data shall be adequate, relevant, and limited to what is strictly necessary.</li>
            <li><strong>LGPD (Brazil) Art. 6º, III:</strong> Princípio da Necessidade — limitação do tratamento ao mínimo necessário para a realização de suas finalidades.</li>
          </ul>
          <p class="text-neutral-400">
            Designed for human rights defenders, investigative journalists, whistleblowers, and everyday individuals protecting personal privacy from location tracking, stalkerware, and automated camera profiling.
          </p>
        </section>

        <!-- 2. Client-Side In-Memory Processing Guarantee -->
        <section class="space-y-2 p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/10">
          <h3 class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            ${icons.lock} Client-Side In-Memory Execution (Zero Server Traffic)
          </h3>
          <p class="text-neutral-300">
            100% of image decoding, decimation, Anti-PRNU transformations, and cryptographic hashing runs locally inside your browser's RAM via Canvas and Web Workers.
          </p>
          <p class="text-[11px] text-neutral-400">
            No files, telemetry, analytics, or fingerprint data are ever transmitted to any external server. All processing is ephemeral and disappears when the tab is closed.
          </p>
        </section>

        <!-- 3. Software Licenses -->
        <section class="space-y-3">
          <h3 class="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Open-Source Licenses & Attributions
          </h3>

          <div class="space-y-2 border border-neutral-800 rounded-lg p-3 bg-black">
            <div class="font-mono font-semibold text-white">DoDecoder (Core Application)</div>
            <div class="text-neutral-400">Created by <strong>Mochilamv</strong> & <strong>Antigravity (AI)</strong>. Licensed under the <strong>MIT License</strong>.</div>
            <div class="text-[11px] text-neutral-500 font-mono">
              Copyright &copy; 2026 Mochilamv & Antigravity. Permission is hereby granted, free of charge, to any person obtaining a copy of this software...
            </div>
          </div>

          <div class="space-y-2 border border-neutral-800 rounded-lg p-3 bg-black">
            <div class="font-mono font-semibold text-white">Third-Party Libraries</div>
            <ul class="text-[11px] text-neutral-400 space-y-1 font-mono">
              <li>• <strong>JSZip</strong> — MIT License (Copyright &copy; Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso)</li>
              <li>• <strong>Vite & TypeScript</strong> — MIT License</li>
              <li>• <strong>Tailwind CSS</strong> — MIT License</li>
              <li>• <strong>FFmpeg WebAssembly (Optional Component)</strong> — LGPL 2.1 / GPL 3.0 Compliance</li>
            </ul>
          </div>
        </section>

        <!-- 4. Operational Security (OpSec) Disclaimer -->
        <section class="space-y-2 border-t border-neutral-800 pt-3">
          <h3 class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            ${icons.alertTriangle} OpSec Best Practices
          </h3>
          <p class="text-neutral-400 text-[11px]">
            To achieve absolute zero residual evidence on your local device:
          </p>
          <ol class="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] pl-2 font-mono">
            <li>Always run DoDecoder inside a <strong>Private / Incognito Window</strong>.</li>
            <li>Close the browser tab once downloaded to purge all RAM buffers immediately.</li>
            <li>If distributing sensitive documents, consider downloading the <strong>Zero-Trace ZIP</strong> which replaces local OS filesystem timestamps with Epoch 1980.</li>
          </ol>
        </section>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
        <button id="legal-close-btn" class="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs cursor-pointer transition-colors">
          Acknowledge & Close
        </button>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('#legal-close')!;
  const ackBtn = modal.querySelector('#legal-close-btn')!;

  closeBtn.addEventListener('click', onClose);
  ackBtn.addEventListener('click', onClose);

  modal.addEventListener('click', e => {
    if (e.target === modal) onClose();
  });

  return modal;
}
