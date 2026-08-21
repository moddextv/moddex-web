import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) return walk(path);

    return /\.tsx?$/.test(entry) ? [path] : [];
  });

// a comment is not something a reader sees, and the rule is about copy. block
// comments go first, or the `*` of a jsdoc line survives the line stripper.
const copy = (source: string) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*)/.test(line))
    .join('\n');

const FILES = walk(SRC);

describe('DESIGN.md §5: no em-dashes or en-dashes in anything a reader sees', () => {
  it('found the source tree', () => {
    expect(FILES.length).toBeGreaterThan(50);
  });

  // written after the dashboard shipped with sixteen of them, four in page
  // titles. §8 says to grep the diff, and grepping the diff is what nobody did.
  it.each(FILES.map((file) => [file.slice(SRC.length + 1), file]))('%s', (_name, file) => {
    const found = copy(readFileSync(file, 'utf8'))
      .split('\n')
      .map((line, index) => ({ line, number: index + 1 }))
      .filter((entry) => /[—–]/.test(entry.line));

    expect(
      found.map((entry) => `line ${entry.number}: ${entry.line.trim()}`),
      'use a period, a comma, or "·" for an absent value'
    ).toEqual([]);
  });
});
