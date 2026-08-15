import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (...parts: string[]) => readFileSync(join(__dirname, '..', 'src', ...parts), 'utf8');

// every surface that states what the opt-out does. /privacy is the contract the
// 67 opted-out accounts relied on, so these must not drift apart again — they
// were five hand-written copies in three files.
const SURFACES = [
  ['app', 'page.tsx'],
  ['app', 'privacy', 'page.tsx'],
  ['app', 'tos', 'page.tsx'],
  ['components', 'Login.tsx'],
  ['components', 'Settings', 'OptOut.tsx']
];

describe('the opt-out promise', () => {
  it.each(SURFACES)('%s/%s states it through the shared component', (...parts) => {
    const source = read(...parts);

    expect(source).toContain("from '@/components/OptOutPromise'");
    expect(source).toContain('<OptOutEffect />');
  });

  it.each(SURFACES)('%s/%s does not restate the effect in its own words', (...parts) => {
    const source = read(...parts).toLowerCase();

    // the phrasings the copies used before they were unified
    expect(source).not.toContain('stops being served');
    expect(source).not.toContain('cease to include you');
    expect(source).not.toContain('removed from every mod and vip list');
    expect(source).not.toContain('hides your profile');
    expect(source).not.toContain('it is reversible');
  });

  it('keeps the emphasis that carries the meaning — served, not deleted', () => {
    expect(read('components', 'OptOutPromise.tsx')).toContain('<em>served</em>');
  });
});
