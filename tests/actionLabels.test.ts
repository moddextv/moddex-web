import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ACTIONS = join(__dirname, '..', 'src', 'actions');

const labelledCalls = (source: string) => {
  const found: { label: string; enclosing: string }[] = [];
  let enclosing = '';

  for (const line of source.split('\n')) {
    const declaration = /export\s+async\s+function\s+([A-Za-z0-9_]+)/.exec(line);
    if (declaration) enclosing = declaration[1];

    // every attempt( is caught, not only the ones already written the right way
    // — matching `attempt('x'` alone let a template literal through silently
    if (!/\battempt\(/.test(line)) continue;

    const literal = /\battempt\('([^']+)'\s*,/.exec(line);

    found.push({ label: literal ? literal[1] : line.trim(), enclosing });
  }

  return found;
};

const files = readdirSync(ACTIONS).filter((name) => name.endsWith('.ts'));

describe('attempt labels', () => {
  it('finds the call sites at all, so this suite cannot pass by reading nothing', () => {
    const total = files.reduce(
      (sum, name) => sum + labelledCalls(readFileSync(join(ACTIONS, name), 'utf8')).length,
      0
    );

    expect(total).toBeGreaterThan(10);
  });

  it.each(files)('%s labels every attempt with its own function name', (name) => {
    const calls = labelledCalls(readFileSync(join(ACTIONS, name), 'utf8'));

    for (const { label, enclosing } of calls) {
      expect(`${name}: ${label}`).toBe(`${name}: ${enclosing}`);
    }
  });
});
