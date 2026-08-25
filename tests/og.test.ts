import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

const card = readFileSync(join(ROOT, 'src', 'utils', 'ogCard.tsx'), 'utf8');
const css = readFileSync(join(ROOT, 'src', 'styles', 'globals.css'), 'utf8');

const hexOf = (token: string): string => {
  const match = css.match(new RegExp(`--${token}:\\s*([0-9]+ [0-9]+ [0-9]+);`));

  if (!match) throw new Error(`globals.css carries no --${token}`);

  return `#${String(match[1])
    .split(' ')
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
};

const constant = (name: string): string | undefined =>
  card.match(new RegExp(`const ${name} = '(#[0-9A-Fa-f]{6})'`))?.[1];

const roleColor = (role: string): string | undefined =>
  card.match(new RegExp(`\\n  ${role}: '(#[0-9A-Fa-f]{6})'`))?.[1];

describe('the card repeats globals.css, because satori reads no css variable', () => {
  it.each([
    ['INK', 'primary-900'],
    ['RAISED', 'primary-800'],
    ['LINE', 'primary-700'],
    ['TEXT', 'primary-100'],
    ['TEXT_ALT', 'primary-400'],
    ['TEXT_DIM', 'primary-500']
  ])('%s is --%s', (name, token) => {
    expect(constant(name)).toBe(hexOf(token));
  });

  it.each([
    ['mod', 'mod-rgb'],
    ['vip', 'vip-rgb'],
    ['founder', 'founder-rgb'],
    ['artist', 'artist-rgb']
  ])('ROLE_COLOR.%s is --%s', (role, token) => {
    expect(roleColor(role)).toBe(hexOf(token));
  });
});

describe('a card cannot render without its fonts', () => {
  it.each(['Manrope-Medium.ttf', 'Manrope-ExtraBold.ttf'])('%s is committed', (file) => {
    expect(existsSync(join(ROOT, 'src', 'app', 'fonts', file))).toBe(true);
  });

  it('reads them rather than fetching them', () => {
    expect(card).not.toMatch(/fetch\(new URL\(/);
    expect(card).toMatch(/readFile\(new URL\('\.\.\/app\/fonts\//);
  });

  it('does not cache a failed read for the life of the process', () => {
    expect(card).toContain('fonts = null;');
    expect(card).toMatch(/catch \(error\) \{\s+fonts = null;\s+throw error;/);
  });

  it('tells the unfurler how long the card keeps', () => {
    expect(card).toMatch(/'cache-control': 'public, max-age=\d+/);
  });
});

describe('next/image and next/og share one sharp, and the optimizer blocks svg', () => {
  it('unblocks the loader satori depends on', () => {
    expect(card).toContain("sharp.unblock({ operation: ['VipsForeignLoadSvg'] })");
  });

  it('unblocks before the render starts, not after', () => {
    expect(card).toMatch(/allowSvgRasterisation\(\);\s+return new Response\(await draw\(\)/);
  });

  it('hands the render in as a thunk, because ImageResponse draws on construction', () => {
    expect(card).toContain('rasterise = async (draw: () => ImageResponse)');
    expect(card.match(/rasterise\(\s*\(\) =>/g)).toHaveLength(2);
  });
});

describe('the badges are read off disk, not fetched', () => {
  it('reads the file beside og.png', () => {
    expect(card).toMatch(/readFile\(join\(PUBLIC, 'badges', file\)\)/);
  });

  it('takes only a plain name out of the url the api answered with', () => {
    expect(card).toContain('/^[a-z0-9_]+\\.svg$/.test(file)');
  });

  it('every badge on disk matches the name the card will accept', () => {
    const files = readdirSync(join(ROOT, 'public', 'badges')).filter((file) =>
      file.endsWith('.svg')
    );

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) expect(file).toMatch(/^[a-z0-9_]+\.svg$/);
  });
});

describe('a card that cannot be drawn still answers with an image', () => {
  it('buffers the render so a failure is catchable rather than a broken stream', () => {
    expect(card).toContain('await draw().arrayBuffer()');
    expect(card).toContain('return staticCard();');
  });

  it('serves bytes off disk when the renderer fails', () => {
    expect(card).toContain("const PUBLIC = join(process.cwd(), 'public')");
    expect(card).toMatch(/readFile\(join\(PUBLIC, 'og\.png'\)\)/);
  });

  it('hands satori only a png or a jpeg', () => {
    expect(card).toContain('const type = decodable(bytes);');
    expect(card).toContain('if (!type ||');
  });

  it.each([
    ['channel', '[username]'],
    ['user', '[username]']
  ])('%s/%s falls back rather than throwing', (...parts) => {
    const route = readFileSync(
      join(ROOT, 'src', 'app', '[locale]', ...parts, 'opengraph-image.tsx'),
      'utf8'
    );

    expect(route).toContain('return staticCard();');
  });
});

describe('a page that writes its own openGraph still ships an image', () => {
  const pages = [
    ['page.tsx'],
    ['channel', 'page.tsx'],
    ['user', 'page.tsx'],
    ['donate', 'page.tsx'],
    ['privacy', 'page.tsx'],
    ['tos', 'page.tsx']
  ];

  it.each(pages.map((parts) => [parts.join('/'), parts]))('%s', (_name, parts) => {
    const source = readFileSync(
      join(ROOT, 'src', 'app', '[locale]', ...(parts as string[])),
      'utf8'
    );

    expect(source).toMatch(/openGraph: openGraphFor\(|pageMetadata\(/);
    expect(source).not.toMatch(/openGraph: \{/);
  });

  it.each([
    ['channel', '[username]'],
    ['user', '[username]']
  ])('%s/%s hands it to the card instead', (...parts) => {
    const dir = join(ROOT, 'src', 'app', '[locale]', ...parts);

    expect(readFileSync(join(dir, 'page.tsx'), 'utf8')).not.toMatch(/images:/);
    expect(existsSync(join(dir, 'opengraph-image.tsx'))).toBe(true);
  });
});

describe('both profile axes carry an image route', () => {
  it.each(['channel', 'user'])('/%s/[username] has one', (type) => {
    const route = join(ROOT, 'src', 'app', '[locale]', type, '[username]', 'opengraph-image.tsx');

    expect(existsSync(route)).toBe(true);
    expect(readFileSync(route, 'utf8')).toContain('if (!user) return brandCard()');
  });

  it.each(['channel', 'user'])('/%s/[username] describes its card', (type) => {
    const route = readFileSync(
      join(ROOT, 'src', 'app', '[locale]', type, '[username]', 'opengraph-image.tsx'),
      'utf8'
    );

    expect(route).toMatch(/export const alt = '.{10,}'/);
  });
});
