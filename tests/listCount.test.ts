import { describe, expect, it } from 'vitest';
import { showListTotal } from '@/components/User/listCount';

describe('showListTotal', () => {
  it('refuses the total the list has already passed', () => {
    expect(showListTotal(175, 1466)).toBe(false);
  });

  it('shows it while the list is still shorter', () => {
    expect(showListTotal(1466, 100)).toBe(true);
  });

  it('shows it on the last page, where the two meet exactly', () => {
    expect(showListTotal(1466, 1466)).toBe(true);
  });

  it('has nothing to show when the api sent no total', () => {
    expect(showListTotal(null, 0)).toBe(false);
  });

  it('shows a zero total for an empty list rather than falling back', () => {
    expect(showListTotal(0, 0)).toBe(true);
  });
});
