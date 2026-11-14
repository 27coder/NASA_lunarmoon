// Small SVG drawings for the guided flow: the 360° skyline panorama and the
// 30-day "Sun / Earth / both" strip. Plain strings so they are easy to read.

import { horizonAt } from '../core/horizon.js';

const W = 800;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Pick a vertical range that fits the skyline and the Sun/Earth paths. */
function elevationRange(horizon, scanResult) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const e of horizon.elevations) {
    lo = Math.min(lo, e);
    hi = Math.max(hi, e);
  }
  const { sunEl, earthEl } = scanResult.series;
  for (const arr of [sunEl, earthEl]) {
    for (const e of arr) if (e > lo - 1) hi = Math.max(hi, e);
  }
  const yMin = Math.max(-20, Math.min(lo, -1) - 1.5);
  const yMax = Math.min(90, Math.max(hi + 1.5, 4));
  return { yMin, yMax };
}

/**
 * 360° view from the lander: real terrain skyline, faint Sun/Earth paths over
 * the whole window, and the Sun and Earth at sample `index`.
 */
export function panoramaSvg(ctx, scanResult, index) {
  const H = 280;
  const top = 26;
  const bottom = 236;
  const { yMin, yMax } = elevationRange(ctx.horizon, scanResult);
  const x = (az) => (((az % 360) + 360) % 360) / 360 * W;
  const y = (el) => bottom - ((el - yMin) / (yMax - yMin)) * (bottom - top);
  // How much the drawing exaggerates heights compared with true proportions.
  const stretch = (360 / W) / ((yMax - yMin) / (bottom - top));

  // Terrain silhouette.
  const n = ctx.horizon.elevations.length;
  let ground = `M0 ${H} `;
  for (let i = 0; i <= n; i++) {
    const az = (i / n) * 360;
    ground += `L${((az / 360) * W).toFixed(1)} ${y(horizonAt(ctx.horizon, az)).toFixed(1)} `;
  }
  ground += `L${W} ${H} Z`;

  // Faint paths over the whole window.
  const { sunEl, sunAz, earthEl, earthAz } = scanResult.series;
  const step = Math.max(1, Math.floor(sunEl.length / 360));
  let paths = '';
  for (let i = 0; i < sunEl.length; i += step) {
    if (sunEl[i] >= yMin) paths += `<circle cx="${x(sunAz[i]).toFixed(1)}" cy="${y(sunEl[i]).toFixed(1)}" r="1.6" class="path-sun"/>`;
    if (earthEl[i] >= yMin) paths += `<circle cx="${x(earthAz[i]).toFixed(1)}" cy="${y(earthEl[i]).toFixed(1)}" r="1.6" class="path-earth"/>`;
  }

  const body = (kind, az, el, clearance, label) => {
    const below = el < yMin;
    const cx = x(az);
    const cy = below ? bottom - 4 : y(el);
    const hidden = clearance < 0;
    const r = kind === 'sun' ? 11 : 9;
    const lx = Math.min(W - 70, Math.max(6, cx + 14));
    const tag = below ? `${label} (below horizon)` : hidden ? `${label} (behind terrain)` : label;
    const mark = below
      ? `<path d="M${cx - 8} ${cy - 10} L${cx + 8} ${cy - 10} L${cx} ${cy} Z" class="${kind}-arrow"/>`
      : `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" class="${kind}-disc${hidden ? ' hidden' : ''}"/>`;
    return `${kind === 'sun' && !below && !hidden ? `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r * 2.2}" class="sun-glow"/>` : ''}${mark}<text x="${lx.toFixed(1)}" y="${(Math.max(top + 12, cy - 12)).toFixed(1)}" class="body-label ${kind}">${esc(tag)}</text>`;
  };

  const i = Math.max(0, Math.min(sunEl.length - 1, index));
  const sunClear = sunEl[i] - horizonAt(ctx.horizon, sunAz[i]);
  const earthClear = earthEl[i] - horizonAt(ctx.horizon, earthAz[i]);

  const compass = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N']
    .map((c, k) => `<text x="${Math.min(W - 8, Math.max(8, (k / 8) * W))}" y="${H - 10}" class="compass" text-anchor="middle">${c}</text>`)
    .join('');
  const levelY = y(0);
  const stretchNote = stretch > 1.5 ? `Heights stretched ×${Math.round(stretch)} so small angles show` : 'Drawn at about true scale';

  return `<svg class="panorama" viewBox="0 0 ${W} ${H}" role="img" aria-label="360 degree view from the lander">
    <defs>
      <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa0a8"/><stop offset="1" stop-color="#5d636b"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" class="space"/>
    ${levelY > top && levelY < bottom ? `<line x1="0" x2="${W}" y1="${levelY.toFixed(1)}" y2="${levelY.toFixed(1)}" class="level"/><text x="${W - 6}" y="${(levelY - 5).toFixed(1)}" class="level-label" text-anchor="end">level (0°)</text>` : ''}
    ${paths}
    <path d="${ground}" fill="url(#gGround)" class="ground"/>
    ${body('earth', earthAz[i], earthEl[i], earthClear, 'Earth')}
    ${body('sun', sunAz[i], sunEl[i], sunClear, 'Sun')}
    <text x="8" y="17" class="stretch-note">${stretchNote}</text>
    ${compass}
  </svg>`;
}

function runsOf(flags) {
  const out = [];
  let start = -1;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] && start < 0) start = i;
    if (!flags[i] && start >= 0) {
      out.push([start, i]);
      start = -1;
    }
  }
  if (start >= 0) out.push([start, flags.length]);
  return out;
}

/** Three-row timeline (Sun up, Earth up, both) over the scanned window. */
export function stripSvg(scanResult, { cursor = null, compact = false } = {}) {
  const { lit, los } = scanResult.series;
  const n = lit.length;
  const both = new Uint8Array(n);
  for (let i = 0; i < n; i++) both[i] = lit[i] && los[i] ? 1 : 0;
  const rows = [
    ['Sun up', lit, 'strip-sun'],
    ['Earth in view', los, 'strip-earth'],
    ['Both', both, 'strip-both'],
  ];
  const left = compact ? 96 : 116;
  const right = W - 8;
  const rowH = compact ? 18 : 22;
  const gap = 8;
  const top = 6;
  const H = top + rows.length * (rowH + gap) + 26;
  const xi = (idx) => left + (idx / n) * (right - left);
  let svg = '';
  rows.forEach(([label, flags, cls], r) => {
    const y0 = top + r * (rowH + gap);
    svg += `<text x="${left - 10}" y="${y0 + rowH * 0.72}" text-anchor="end" class="strip-label">${label}</text>`;
    svg += `<rect x="${left}" y="${y0}" width="${right - left}" height="${rowH}" rx="6" class="strip-bg"/>`;
    for (const [a, b] of runsOf(flags)) {
      svg += `<rect x="${xi(a).toFixed(1)}" y="${y0}" width="${Math.max(1.5, xi(b) - xi(a)).toFixed(1)}" height="${rowH}" rx="4" class="${cls}"/>`;
    }
  });
  const days = (scanResult.endMs - scanResult.startMs) / 86400000;
  const axisY = top + rows.length * (rowH + gap) + 14;
  for (let d = 0; d <= days; d += 5) {
    const xx = left + (d / days) * (right - left);
    svg += `<text x="${xx.toFixed(1)}" y="${axisY}" text-anchor="middle" class="strip-axis">${d === 0 ? 'Landing' : `Day ${d}`}</text>`;
  }
  if (cursor != null) {
    const cx = xi(cursor);
    svg += `<line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${top - 4}" y2="${axisY - 10}" class="strip-cursor"/>`;
  }
  return `<svg class="strip" viewBox="0 0 ${W} ${H}" role="img" aria-label="Timeline of when the Sun is up and Earth is in view">${svg}</svg>`;
}
