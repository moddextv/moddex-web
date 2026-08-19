import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { INK, MARK } from './mark.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'badges');

const PAPER = '#FFFFFF';

const mark = (fill) =>
  `<g transform="translate(28 28) scale(2.25)" fill="${fill}">` +
  MARK.map((d) => `<path d="${d}"/>`).join('') +
  `</g>`;

const glyphs = {
  diamond: (ink, fill) =>
    `<path d="M44 38 H84 L102 58 L64 101 L26 58 Z" fill="${ink}"/>` +
    `<g fill="none" stroke="${fill}" stroke-width="4.5" stroke-linejoin="round">` +
    `<path d="M26 58 H102"/><path d="M44 38 L52 58 L64 101 L76 58 L84 38"/></g>`,

  check: (ink) =>
    `<path d="M40 66 L57 83 L89 47" fill="none" stroke="${ink}" stroke-width="14" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>`,

  wrench: (ink) =>
    `<g transform="rotate(45 64 64)" fill="${ink}">` +
    `<path d="M47.15 27.86 A22 22 0 1 0 80.85 27.86 L72.43 34.93 A11 11 0 1 1 55.57 34.93 Z"/>` +
    `<rect x="56" y="52" width="16" height="48" rx="8"/>` +
    `</g>`,

  heart: (ink) =>
    `<path d="M64 93 C64 93 33 74 33 53 C33 42 42 34 52 34 C58 34 63 37 64 43 ` +
    `C65 37 70 34 76 34 C86 34 95 42 95 53 C95 74 64 93 64 93 Z" fill="${ink}"/>`,

  crown: (ink) =>
    `<path d="M34 79 V43 L50 59 L64 34 L78 59 L94 43 V79 Z" fill="${ink}"/>` +
    `<rect x="34" y="84" width="60" height="11" rx="5" fill="${ink}"/>`,

  robot: (ink, fill) =>
    `<g fill="${ink}">` +
    `<circle cx="64" cy="34" r="7"/>` +
    `<rect x="61" y="38" width="6" height="12"/>` +
    `<rect x="30" y="64" width="8" height="20" rx="4"/>` +
    `<rect x="90" y="64" width="8" height="20" rx="4"/>` +
    `<rect x="36" y="48" width="56" height="52" rx="14"/>` +
    `</g>` +
    `<g fill="${fill}">` +
    `<circle cx="52" cy="68" r="7"/>` +
    `<circle cx="76" cy="68" r="7"/>` +
    `<rect x="50" y="83" width="28" height="8" rx="4"/>` +
    `</g>`,

  boost: (ink) =>
    `<g fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M40 62 L64 40 L88 62"/><path d="M40 92 L64 70 L88 92"/></g>`,

  mark: (ink) => mark(ink)
};

const BADGES = [
  { name: 'affiliate', fill: '#E800FF', ink: PAPER, glyph: 'diamond' },
  { name: 'partner', fill: '#8E4AFF', ink: PAPER, glyph: 'check' },
  { name: 'staff', fill: '#2E2E2E', ink: PAPER, glyph: 'wrench' },
  { name: 'donator', fill: '#15803D', ink: PAPER, glyph: 'heart' },
  { name: 'top_donator', fill: '#FACC15', ink: INK, glyph: 'crown' },
  { name: 'admin', fill: '#F87171', ink: INK, glyph: 'mark' },
  { name: 'bot', fill: '#008585', ink: PAPER, glyph: 'robot' },
  { name: 'booster', fill: '#FF73FA', ink: INK, glyph: 'boost' }
];

const srgb = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * srgb((n >> 16) & 255) + 0.7152 * srgb((n >> 8) & 255) + 0.0722 * srgb(n & 255);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const svgFor = (badge, glyphName) => {
  const ink = badge.ink;
  const draw = glyphs[glyphName];

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">\n` +
    `  <rect x="12" y="12" width="104" height="104" rx="22" fill="${badge.fill}"/>\n` +
    `  ${draw(ink, badge.fill)}\n` +
    `  <rect x="3" y="3" width="122" height="122" rx="26" fill="none" stroke="${badge.fill}" stroke-width="4" opacity="0.55"/>\n` +
    `</svg>\n`
  );
};

const check = process.argv.includes('--check');
mkdirSync(OUT, { recursive: true });

let drift = 0;
const report = [];

for (const badge of BADGES) {
  const ink = badge.ink;
  const ratio = contrast(badge.fill, ink);
  if (ratio < 3) drift++;

  const site = svgFor(badge, badge.glyph);
  const sitePath = join(OUT, `${badge.name}.svg`);

  if (check) {
    const same = existsSync(sitePath) && readFileSync(sitePath, 'utf8') === site;
    if (!same) drift++;
    report.push(
      `  ${badge.name.padEnd(12)} ${badge.fill}  glyph ${ink}  ${ratio.toFixed(2)}:1  ` +
        `${ratio >= 3 ? 'ok ' : 'LOW'}  svg ${same ? 'ok' : 'DRIFT'}`
    );
  } else {
    writeFileSync(sitePath, site);
  }

  const chat = svgFor(badge, 'mark');
  const chatPath = join(OUT, `${badge.name}.webp`);
  // the site glyph rather than the chat mark: an emoji wants the crown, not the logo
  const emojiPath = join(OUT, `${badge.name}.png`);

  if (check) {
    const ok = existsSync(chatPath);
    const emojiOk = existsSync(emojiPath);
    if (!ok) drift++;
    if (!emojiOk) drift++;
    report.push(
      `  ${''.padEnd(12)} chat webp ${ok ? 'present' : 'MISSING'}  ` +
        `emoji png ${emojiOk ? 'present' : 'MISSING'}`
    );
  } else {
    await sharp(Buffer.from(chat)).resize(128, 128).webp({ quality: 92 }).toFile(chatPath);
    await sharp(Buffer.from(site)).resize(128, 128).png({ compressionLevel: 9 }).toFile(emojiPath);
  }
}

if (check) {
  console.log('badges --check');
  report.forEach((line) => console.log(line));
  console.log(drift ? `\n${drift} file(s) differ. Run: npm run badges` : '\nall ok');
  process.exit(drift ? 1 : 0);
} else {
  console.log(
    `wrote ${BADGES.length} svg + ${BADGES.length} webp + ${BADGES.length} png to public/badges`
  );
}
