import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatNumber,
  formatNumberShort,
  splitArray
} from '@/utils/utils';
import { isInteger } from '@/utils/validation';

describe('splitArray', () => {
  it('chunks evenly and keeps the remainder', () => {
    expect(splitArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(splitArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  it('does NOT mutate its input', () => {
    // the regression this file exists for: the old implementation spliced in a
    // loop, so the caller was handed the chunks and left holding an emptied
    // array. getUsersFromHelix worked around it with a spread; fetchUsers did
    // not, so a caller reading its argument afterwards saw [].
    const input = [1, 2, 3, 4, 5];
    splitArray(input, 2);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns one chunk when the size exceeds the length', () => {
    expect(splitArray([1, 2], 50)).toEqual([[1, 2]]);
  });

  it('returns [] for an empty input', () => {
    expect(splitArray([], 10)).toEqual([]);
  });

  it('throws rather than looping forever on a non-positive chunk size', () => {
    // the old `while (array.length) results.push(array.splice(0, 0))` never
    // shrank the array, so this hung and grew memory until the process died.
    expect(() => splitArray([1, 2], 0)).toThrow(RangeError);
    expect(() => splitArray([1, 2], -1)).toThrow(RangeError);
  });
});

describe('formatNumberShort', () => {
  it('leaves values under 1000 alone', () => {
    expect(formatNumberShort(0)).toBe('0');
    expect(formatNumberShort(999)).toBe('999');
  });

  it('scales into k/m/b', () => {
    expect(formatNumberShort(1000)).toBe('1.0k');
    expect(formatNumberShort(1500)).toBe('1.5k');
    expect(formatNumberShort(1_000_000)).toBe('1.0m');
    expect(formatNumberShort(2_500_000_000)).toBe('2.5b');
  });

  it('handles the real numbers this app shows', () => {
    // roughly the production row counts the homepage renders
    expect(formatNumberShort(8_101_526)).toBe('8.1m');
    expect(formatNumberShort(2_751_685)).toBe('2.8m');
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('defaults to 0 when called with nothing', () => {
    expect(formatNumber()).toBe('0');
  });
});

describe('formatDate', () => {
  it('returns an empty string for missing input rather than "Invalid Date"', () => {
    expect(formatDate()).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('formats an ISO timestamp', () => {
    expect(formatDate('2019-10-09T19:02:26Z')).toBe('October 9, 2019');
  });
});

describe('isInteger', () => {
  it('accepts integers and numeric strings', () => {
    expect(isInteger(5)).toBe(true);
    expect(isInteger('5')).toBe(true);
    expect(isInteger('22484632')).toBe(true);
  });

  it('rejects non-integers', () => {
    expect(isInteger('abc')).toBe(false);
    expect(isInteger(1.5)).toBe(false);
    expect(isInteger('1.5')).toBe(false);
  });

  it('rejects the values Number() would coerce to 0', () => {
    // this test found a real bug: Number(null), Number('') and Number([]) are
    // all 0, which Number.isInteger accepts, so isInteger(null) was true. The
    // api routes never hit it -- query params are strings and are guarded by
    // `if (param)` first -- but a function called isInteger saying yes to null
    // is a trap for whoever reuses it next.
    expect(isInteger(null)).toBe(false);
    expect(isInteger(undefined)).toBe(false);
    expect(isInteger('')).toBe(false);
    expect(isInteger('   ')).toBe(false);
    expect(isInteger([])).toBe(false);
    expect(isInteger({})).toBe(false);
    expect(isInteger(true)).toBe(false);
  });
});
