import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// moddex-workspace/scripts/build-brand-icons.mjs owns this file and emits it
const ICON = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'icon.svg');

const svg = readFileSync(ICON, 'utf8');

const rect = svg.match(/<rect[^>]*rx="(\d+)"[^>]*fill="(#[0-9A-Fa-f]{6})"/);
const paths = [...svg.matchAll(/<path d="([^"]+)"\s+fill="(#[0-9A-Fa-f]{6})"/g)];

if (!rect || paths.length !== 2) {
  throw new Error(`${ICON} is not the shape these generators expect — run build-brand-icons.mjs`);
}

export const GRID = 32;
export const RADIUS = Number(rect[1]);
export const INK = rect[2].toUpperCase();

export const MARK = paths.map(([, d]) => d);
export const [IN, OUT] = paths.map(([, , fill]) => fill.toUpperCase());
