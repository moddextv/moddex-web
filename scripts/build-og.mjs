import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { GRID, IN, INK, MARK, OUT, RADIUS } from './mark.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const APP = join(ROOT, 'src', 'app');

const SOURCE = join(PUBLIC, 'logo');

const LIFT = '#111113';

const mark = (x, y, size) => {
  const scale = size / GRID;

  return (
    `<g transform="translate(${x} ${y}) scale(${scale})">` +
    `<path d="${MARK[0]}" fill="${IN}"/><path d="${MARK[1]}" fill="${OUT}"/>` +
    `</g>`
  );
};

const wash = (id, color, cx, cy, alpha) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.6">` +
  `<stop offset="0" stop-color="${color}" stop-opacity="${alpha}"/>` +
  `<stop offset="1" stop-color="${color}" stop-opacity="0"/>` +
  `</radialGradient>`;

// no wordmark: librsvg ignores an embedded woff2, see moddex-workspace/web/SEO.md
const card = (w, h) => {
  const short = Math.min(w, h);
  const size = Math.round(short * 0.52);
  const inset = Math.round(short * 0.11);
  const panel =
    `x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" ` +
    `rx="${Math.round(short * 0.05)}"`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>${wash('tl', IN, 0, 0, 0.08)}${wash('br', OUT, 1, 1, 0.11)}</defs>` +
    `<rect width="${w}" height="${h}" fill="${INK}"/>` +
    `<rect ${panel} fill="${LIFT}"/>` +
    `<rect ${panel} fill="url(#tl)"/>` +
    `<rect ${panel} fill="url(#br)"/>` +
    mark((w - size) / 2, (h - size) / 2, size) +
    `</svg>`
  );
};

const icon = (size) => {
  const glyph = Math.round(size * 0.75);
  const radius = Math.round((size * RADIUS) / GRID);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${INK}"/>` +
    mark((size - glyph) / 2, (size - glyph) / 2, glyph) +
    `</svg>`
  );
};

const ASSETS = [
  { name: 'og.png', dir: PUBLIC, svg: () => card(1200, 630) },
  { name: 'og-square.png', dir: PUBLIC, svg: () => card(1200, 1200) },
  { name: 'apple-icon.png', dir: APP, svg: () => icon(180) },
  { name: 'icon-512.png', dir: PUBLIC, svg: () => icon(512) },
  { name: 'icon-192.png', dir: PUBLIC, svg: () => icon(192) }
];

const check = process.argv.includes('--check');

mkdirSync(SOURCE, { recursive: true });

let drift = 0;
const report = [];

for (const asset of ASSETS) {
  const svg = asset.svg();
  const source = join(SOURCE, asset.name.replace(/\.png$/, '.svg'));
  const target = join(asset.dir, asset.name);

  if (check) {
    const same = existsSync(source) && readFileSync(source, 'utf8') === svg;
    const raster = existsSync(target);

    if (!same || !raster) drift++;
    report.push(
      `  ${asset.name.padEnd(16)} svg ${same ? 'ok' : 'DRIFT'}  png ${raster ? 'ok' : 'MISSING'}`
    );
    continue;
  }

  writeFileSync(source, svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(target);
}

if (check) {
  console.log('og --check');
  report.forEach((line) => console.log(line));
  console.log(drift ? `\n${drift} asset(s) differ. Run: npm run og` : '\nall ok');
  process.exit(drift ? 1 : 0);
}

console.log(`wrote ${ASSETS.length} svg + ${ASSETS.length} png`);
