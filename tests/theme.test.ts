import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const CSS = readFileSync(join(__dirname, '..', 'src', 'styles', 'globals.css'), 'utf8');

const declarationsIn = (block: string): string[] =>
  block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('--'))
    .sort();

const blockAfter = (selector: string): string => {
  const start = CSS.indexOf(selector);
  expect(start, `no rule matching ${selector} in globals.css`).toBeGreaterThan(-1);

  const open = CSS.indexOf('{', start);
  const close = CSS.indexOf('}', open);
  return CSS.slice(open + 1, close);
};

describe('the light ramp is written twice and must not drift', () => {
  const explicit = declarationsIn(blockAfter('\n.light {'));
  const preference = declarationsIn(blockAfter(':root:not(.dark):not(.light) {'));

  it('declares the same tokens with the same values in both places', () => {
    expect(preference).toEqual(explicit);
  });

  it('is not comparing two empty blocks', () => {
    expect(explicit.length).toBeGreaterThan(10);
  });
});

describe('every role channel has a derived token', () => {
  const channels = [...new Set([...CSS.matchAll(/^\t--([a-z]+)-rgb:/gm)].map((m) => m[1]))];

  it('found the channels to check', () => {
    expect(channels).toContain('mod');
    expect(channels.length).toBeGreaterThan(4);
  });

  it.each(channels)('--%s derives from its channel', (name) => {
    expect(CSS).toContain(`--${name}: rgb(var(--${name}-rgb));`);
  });
});

/*
 * The estate vocabulary. Every name here is spelled the same and holds the same
 * value in moddex-api/src/public/docs.css and moddex-status/src/public/styles.css,
 * and each of those repos runs its own copy of this table. Three deploys means
 * no shared package, so a copy per repo is the only thing that can fail loudly
 * in whichever one drifts — and drift is what happened: the status page's light
 * theme was built by a different method and five of its greys were wrong.
 *
 * Changing a value here is a change to all three. Adding a token that only this
 * site has is fine and does not belong in this list.
 */
const ESTATE: Record<string, [dark: string, light: string]> = {
  '--base-rgb': ['11 11 12', '255 255 255'],
  '--raised-rgb': ['17 17 19', '242 242 245'],
  '--line-rgb': ['35 35 38', '226 226 231'],
  '--line-strong-rgb': ['51 51 58', '196 196 204'],
  '--text-rgb': ['231 231 234', '24 24 27'],
  '--text-alt-rgb': ['138 138 147', '110 110 120'],
  '--text-dim-rgb': ['85 85 95', '154 154 164'],
  '--mod-rgb': ['74 222 128', '21 128 61'],
  '--vip-rgb': ['244 114 182', '219 39 119'],
  '--founder-rgb': ['251 191 36', '180 83 9'],
  '--radius-xs': ['4px', '4px'],
  '--radius-sm': ['6px', '6px'],
  '--radius-md': ['8px', '8px'],
  '--radius-lg': ['12px', '12px'],
  '--radius-full': ['9999px', '9999px'],
  '--ease': ['cubic-bezier(0.2, 0, 0, 1)', 'cubic-bezier(0.2, 0, 0, 1)'],
  '--duration': ['150ms', '150ms'],
  '--brand-mark': ['24px', '24px'],
  '--brand-gap': ['12px', '12px']
};

const parse = (block: string): Record<string, string> =>
  Object.fromEntries(
    block
      .split('\n')
      .map((line) => line.trim().match(/^(--[\w-]+):\s*(.+);$/))
      .filter((match) => match !== null)
      .map((match) => [match[1], match[2]])
  );

describe('the estate vocabulary', () => {
  const dark = parse(blockAfter('\n:root {'));
  const light = { ...dark, ...parse(blockAfter('\n.light {')) };

  // the semantic channels point at the tailwind ramp here and hold the numbers
  // outright on the other two sites, so one hop of indirection is resolved
  const read = (scope: Record<string, string>, name: string): string | undefined => {
    const value = scope[name];
    const indirect = value?.match(/^var\((--[\w-]+)\)$/);
    return indirect ? scope[indirect[1]] : value;
  };

  it.each(Object.entries(ESTATE))('%s is the estate value in both themes', (name, expected) => {
    expect([read(dark, name), read(light, name)]).toEqual(expected);
  });
});
