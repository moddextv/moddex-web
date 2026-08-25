import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (...parts: string[]) => readFileSync(join(__dirname, '..', 'src', ...parts), 'utf8');

// every surface that states what the opt-out does. /privacy is the contract the
// 67 opted-out accounts relied on, so these must not drift apart again — they
// were five hand-written copies in three files.
const SURFACES = [
  ['app', '[locale]', 'page.tsx'],
  ['app', '[locale]', 'privacy', 'page.tsx'],
  ['components', 'Login.tsx'],
  ['components', 'Settings', 'OptOut.tsx']
];

// /tos stopped stating the effect on 2026-08-21 and points at /privacy instead:
// one page promises this, and it is the one the promise is judged against. it
// still has to not describe the effect in words of its own.
const POINTS_ELSEWHERE = [['app', '[locale]', 'tos', 'page.tsx']];

describe('the opt-out promise', () => {
  it.each(SURFACES)('%s/%s states it through the shared component', (...parts) => {
    const source = read(...parts);

    expect(source).toContain("from '@/components/OptOutPromise'");
    expect(source).toContain('<OptOutEffect />');
  });

  it.each(POINTS_ELSEWHERE)('%s/%s sends the reader to the page that promises it', (...parts) => {
    const source = read(...parts);

    expect(source).not.toContain('OptOutPromise');
    expect(source).toContain('href="/privacy"');
  });

  it.each([...SURFACES, ...POINTS_ELSEWHERE])(
    '%s/%s does not restate the effect in its own words',
    (...parts) => {
      const source = read(...parts).toLowerCase();

      // the phrasings the copies used before they were unified
      expect(source).not.toContain('stops being served');
      expect(source).not.toContain('cease to include you');
      expect(source).not.toContain('removed from every mod and vip list');
      expect(source).not.toContain('hides your profile');
      expect(source).not.toContain('it is reversible');
    }
  );

  it('keeps the emphasis that carries the meaning — served, not deleted', () => {
    expect(read('components', 'OptOutPromise.tsx')).toContain('<em>served</em>');
  });
});
