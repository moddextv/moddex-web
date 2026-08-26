import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { badgesShape } from '@/utils/api/moddex/shapes';

const ROOT = join(__dirname, '..');

/**
 * There are two badge shapes and they are not interchangeable.
 *
 *   catalogue  GET /v1/badges        images.icon.svg, no top-level svg
 *   lean       on every user row     svg, and nothing else
 *
 * Confusing them broke `/dashboard` — "Could not read the catalogue" — because
 * the shape still demanded `svg`, and it would have broken again one component
 * over, where a catalogue entry was pushed into a member's badge list and
 * rendered with `badge.svg`.
 */
const CATALOGUE = {
  id: 3,
  slug: 'top-donator',
  name: 'top donator',
  chatName: 'moddex top donator',
  order: 30,
  wearable: true,
  images: {
    icon: {
      svg: 'https://moddex.tv/badges/top-donator/icon.svg',
      png: 'https://moddex.tv/badges/top-donator/icon.png'
    },
    chat: {
      1: 'https://moddex.tv/badges/top-donator/1x.webp',
      2: 'https://moddex.tv/badges/top-donator/2x.webp',
      4: 'https://moddex.tv/badges/top-donator/4x.webp'
    }
  }
};

const LEAN = {
  id: 3,
  slug: 'top-donator',
  name: 'top donator',
  svg: 'https://moddex.tv/badges/top-donator/icon.svg'
};

describe('the badge catalogue shape', () => {
  it('accepts what /v1/badges actually answers', () => {
    expect(() => badgesShape([CATALOGUE], 'badges')).not.toThrow();
  });

  it('rejects the lean badge, which is a different shape', () => {
    expect(() => badgesShape([LEAN], 'badges')).toThrow();
  });

  it('rejects a catalogue entry that lost its images', () => {
    const { images: _images, ...without } = CATALOGUE;

    expect(() => badgesShape([without], 'badges')).toThrow();
  });
});

const sources = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) sources(path, out);
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) out.push(path);
  }

  return out;
};

describe('nothing reads a top-level svg off the catalogue', () => {
  /**
   * A component handed `catalogue` and reading `.svg` renders a broken image and
   * says nothing. The catalogue's artwork is always `images.icon.svg`.
   */
  it.each(
    sources(join(ROOT, 'src'))
      .filter((file) => readFileSync(file, 'utf8').includes('BadgeCatalogueEntry'))
      .map((file) => [file.slice(ROOT.length), file])
  )('%s', (_name, file) => {
    const source = readFileSync(file, 'utf8');
    const wrong = [...source.matchAll(/\b(badge|one|entry)\.svg\b/g)].map((m) => m[0]);

    expect(wrong).toEqual([]);
  });
});
