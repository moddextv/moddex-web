import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'flags');

// one box for every flag, so the rows in the picker line up. real ratios differ
// (de is 3:5, gb is 1:2), so each is drawn to fill this one rather than cropped
const W = 20;
const H = 14;

const n = (value) => Number(value.toFixed(3));

const flags = {
  de: () =>
    `<rect width="${W}" height="${H}" fill="#000000"/>` +
    `<rect y="${n(H / 3)}" width="${W}" height="${n((H / 3) * 2)}" fill="#DD0000"/>` +
    `<rect y="${n((H / 3) * 2)}" width="${W}" height="${n(H / 3)}" fill="#FFCE00"/>`,

  fr: () =>
    `<rect width="${W}" height="${H}" fill="#FFFFFF"/>` +
    `<rect width="${n(W / 3)}" height="${H}" fill="#002395"/>` +
    `<rect x="${n((W / 3) * 2)}" width="${n(W / 3)}" height="${H}" fill="#ED2939"/>`,

  gb: () =>
    `<clipPath id="c"><path d="M10,7 h10 v7 z v7 h-10 z h-10 v-7 z v-7 h10 z"/></clipPath>` +
    `<rect width="${W}" height="${H}" fill="#012169"/>` +
    `<path d="M0,0 L20,14 M20,0 L0,14" stroke="#FFFFFF" stroke-width="2.8"/>` +
    `<path d="M0,0 L20,14 M20,0 L0,14" clip-path="url(#c)" stroke="#C8102E" stroke-width="1.9"/>` +
    `<path d="M10,0 v14 M0,7 h20" stroke="#FFFFFF" stroke-width="4.7"/>` +
    `<path d="M10,0 v14 M0,7 h20" stroke="#C8102E" stroke-width="2.8"/>`
};

const svg = (code) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  flags[code]() +
  `</svg>\n`;

const check = process.argv.includes('--check');
let drift = 0;

if (!check) mkdirSync(OUT, { recursive: true });

for (const code of Object.keys(flags)) {
  const file = join(OUT, `${code}.svg`);
  const want = svg(code);

  if (check) {
    const have = existsSync(file) ? readFileSync(file, 'utf8') : '';

    if (have !== want) {
      console.error(`drift: flags/${code}.svg`);
      drift++;
    }

    continue;
  }

  writeFileSync(file, want);
  console.log(`flags/${code}.svg`);
}

if (check) {
  console.log(drift ? `${drift} file(s) differ — run npm run flags` : 'flags are current');
  process.exit(drift ? 1 : 0);
}
