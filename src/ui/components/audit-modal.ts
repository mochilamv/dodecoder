import { SanitizedResult } from '../../core/types';
import { formatBytes, sanitizeDisplayText } from './queue-list';

export interface AuditMetricViewModel {
  label: string;
  beforeVal: string;
  afterVal: string;
  beforeColorClass: string;
  afterColorClass: string;
}

export interface AuditModalViewModel {
  originalName: string;
  originalSizeLabel: string;
  beforeSha256: string;
  sanitizedName: string;
  sanitizedSizeLabel: string;
  afterSha256: string;
  metrics: AuditMetricViewModel[];
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function createMetricViewModel(
  label: string,
  beforeRaw: string,
  afterRaw: string
): AuditMetricViewModel {
  const safeLabel = sanitizeDisplayText(label);
  const beforeVal = sanitizeDisplayText(beforeRaw);
  const afterVal = sanitizeDisplayText(afterRaw);
  const isAfterClean =
    afterVal === 'Clean' ||
    afterVal === 'Applied' ||
    afterVal.startsWith('Clean (');
  return {
    label: safeLabel,
    beforeVal,
    afterVal,
    beforeColorClass: beforeVal !== 'Clean' && beforeVal !== 'N/A' ? 'text-[#FF4444]' : 'text-[#FFFFFF]',
    afterColorClass: isAfterClean ? 'text-[#00FF00]' : 'text-[#FFFFFF]',
  };
}

export function buildAuditModalViewModel(result: SanitizedResult): AuditModalViewModel {
  const before = result.auditBefore;
  const after = result.auditAfter;
  const isVideo = result.format.toLowerCase().startsWith('video/');

  let metrics: AuditMetricViewModel[];
  if (isVideo) {
    const unsafeBefore = before.markers.filter(m => !m.isSanitizedSafe).length;
    const unsafeAfter = after.markers.filter(m => !m.isSanitizedSafe).length;
    const removedAtoms = Math.max(0, unsafeBefore - unsafeAfter);
    const atomsBeforeLabel = unsafeBefore > 0 ? `${unsafeBefore} detected` : 'Clean';
    const atomsAfterLabel =
      unsafeAfter === 0
        ? `Clean (${removedAtoms} removed)`
        : `${unsafeAfter} remaining (${removedAtoms} removed)`;

    metrics = [
      createMetricViewModel('Format / MIME', before.mimeType, after.mimeType),
      createMetricViewModel('Sanitization Scope', 'N/A', 'Container Only (mdat untouched)'),
      createMetricViewModel('Metadata Atoms', atomsBeforeLabel, atomsAfterLabel),
      createMetricViewModel('Video Bitstream (mdat)', 'N/A', 'Untouched (Playable)'),
    ];
  } else {
    metrics = [
      createMetricViewModel('Format / MIME', before.mimeType, after.mimeType),
      createMetricViewModel('EXIF / TIFF', before.hasExif ? 'Detected' : 'Clean', after.hasExif ? 'Detected' : 'Clean'),
      createMetricViewModel('GPS Coordinates', before.hasGps ? 'Exposed' : 'Clean', after.hasGps ? 'Exposed' : 'Clean'),
      createMetricViewModel('MakerNotes / OEM', before.hasMakerNotes ? 'Exposed' : 'Clean', after.hasMakerNotes ? 'Exposed' : 'Clean'),
      createMetricViewModel('Thumbnail Leak', before.hasThumbnail ? 'Exposed' : 'Clean', after.hasThumbnail ? 'Exposed' : 'Clean'),
      createMetricViewModel('Steganography Deep Decon', 'N/A', result.isDeepDecontaminated ? 'Applied' : 'Skipped'),
    ];
  }

  return {
    originalName: sanitizeDisplayText(result.originalName),
    originalSizeLabel: formatBytes(result.originalSize),
    beforeSha256: sanitizeDisplayText(before.sha256),
    sanitizedName: sanitizeDisplayText(result.sanitizedName),
    sanitizedSizeLabel: formatBytes(result.sanitizedSize),
    afterSha256: sanitizeDisplayText(after.sha256),
    metrics,
  };
}

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

function createSummaryColumn(
  headingText: string,
  name: string,
  nameColorClass: string,
  sizeLabel: string,
  sizeColorClass: string,
  sha256: string,
  shaTitle: string
): HTMLElement {
  const col = document.createElement('div');
  col.className = 'space-y-1';

  const heading = document.createElement('div');
  heading.className = 'text-[10px] text-[#FFFFFF] font-mono uppercase';
  heading.textContent = headingText;
  col.appendChild(heading);

  const nameEl = document.createElement('div');
  nameEl.className = `text-sm font-mono ${nameColorClass} truncate`;
  nameEl.setAttribute('title', name);
  nameEl.textContent = name;
  col.appendChild(nameEl);

  const sizeEl = document.createElement('div');
  sizeEl.className = `text-xs ${sizeColorClass} font-mono`;
  sizeEl.textContent = sizeLabel;
  col.appendChild(sizeEl);

  const hashEl = document.createElement('div');
  hashEl.className = `text-[10px] ${sizeColorClass} font-mono break-all mt-1`;
  hashEl.setAttribute('title', shaTitle);
  hashEl.textContent = sha256;
  col.appendChild(hashEl);

  return col;
}

function createMetricElement(metric: AuditMetricViewModel): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col space-y-1';

  const labelEl = document.createElement('div');
  labelEl.className = 'text-[10px] text-[#FFFFFF] font-mono tracking-wider uppercase';
  labelEl.textContent = metric.label;
  wrapper.appendChild(labelEl);

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 text-xs font-mono';

  const beforeSpan = document.createElement('span');
  beforeSpan.className = metric.beforeColorClass;
  beforeSpan.textContent = metric.beforeVal;
  row.appendChild(beforeSpan);

  const arrowSpan = document.createElement('span');
  arrowSpan.className = 'text-[#FFFFFF]';
  arrowSpan.textContent = '->';
  row.appendChild(arrowSpan);

  const afterSpan = document.createElement('span');
  afterSpan.className = `${metric.afterColorClass} font-bold`;
  afterSpan.textContent = metric.afterVal;
  row.appendChild(afterSpan);

  wrapper.appendChild(row);
  return wrapper;
}

export function renderAuditModal(result: SanitizedResult, onClose: () => void): HTMLElement {
  const vm = buildAuditModalViewModel(result);

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-sm';

  const modal = document.createElement('div');
  modal.className = 'w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#000000] text-[#FFFFFF] p-6 focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  modal.setAttribute('tabindex', '-1');

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-6';

  const title = document.createElement('h2');
  title.className = 'text-lg font-mono font-bold tracking-wider text-[#FFFFFF]';
  title.textContent = 'Forensic Audit Report';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'btn-close-modal';
  closeBtn.type = 'button';
  closeBtn.className = 'p-2 text-[#FFFFFF] hover:text-[#FF4444] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2';
  closeBtn.setAttribute('aria-label', 'Close modal');
  closeBtn.appendChild(createCloseIcon());
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // Content body
  const body = document.createElement('div');
  body.className = 'space-y-8';

  // Overview
  const overview = document.createElement('div');
  overview.className = 'grid grid-cols-2 gap-4';
  overview.appendChild(
    createSummaryColumn(
      'Original',
      vm.originalName,
      'text-[#FFFFFF]',
      vm.originalSizeLabel,
      'text-[#FF4444]',
      vm.beforeSha256,
      'Original SHA-256'
    )
  );
  overview.appendChild(
    createSummaryColumn(
      'Sanitized',
      vm.sanitizedName,
      'text-[#00FF00]',
      vm.sanitizedSizeLabel,
      'text-[#00FF00]',
      vm.afterSha256,
      'Sanitized SHA-256'
    )
  );
  body.appendChild(overview);

  // Payload Diff
  const diffSection = document.createElement('div');
  diffSection.className = 'space-y-4';

  const diffHeading = document.createElement('h3');
  diffHeading.className = 'text-xs font-mono font-bold tracking-widest text-[#FFFFFF] uppercase';
  diffHeading.textContent = 'Vector Analysis';
  diffSection.appendChild(diffHeading);

  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
  for (const metric of vm.metrics) {
    metricsGrid.appendChild(createMetricElement(metric));
  }
  diffSection.appendChild(metricsGrid);

  body.appendChild(diffSection);
  modal.appendChild(body);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) onClose();
  });

  overlay.appendChild(modal);

  // Auto-focus modal for accessibility
  setTimeout(() => modal.focus(), 10);

  return overlay;
}
