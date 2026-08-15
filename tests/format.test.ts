import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDayMonthYear,
  formatMonthYearLong,
  formatNumber,
  formatNumberShort
} from '@/utils/format';
import { signInOptions } from '@/utils/signIn';

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

describe('a date does not depend on where it is rendered', () => {
  const zoned = (zone: string, run: () => string | null) => {
    const original = process.env.TZ;
    process.env.TZ = zone;

    try {
      return run();
    } finally {
      process.env.TZ = original;
    }
  };

  it.each([
    ['UTC', 'December 8, 2016'],
    ['Europe/Zurich', 'December 8, 2016'],
    ['Pacific/Auckland', 'December 8, 2016'],
    ['America/Los_Angeles', 'December 8, 2016']
  ])('formatDate in %s', (zone, expected) => {
    expect(zoned(zone, () => formatDate('2016-12-08T23:30:00Z'))).toBe(expected);
  });

  it.each([
    ['UTC', 'Dec 08, 2016'],
    ['Europe/Zurich', 'Dec 08, 2016'],
    ['Pacific/Auckland', 'Dec 08, 2016']
  ])('formatDayMonthYear in %s', (zone, expected) => {
    expect(zoned(zone, () => formatDayMonthYear('2016-12-08T23:30:00Z'))).toBe(expected);
  });

  it('formatMonthYearLong does not roll into the next month', () => {
    expect(zoned('Pacific/Auckland', () => formatMonthYearLong('2016-11-30T23:30:00Z'))).toBe(
      'November 2016'
    );
  });
});

describe('signInOptions', () => {
  it('sends the header button to settings from anywhere signing in is the point', () => {
    for (const pathname of ['/', '/channel', '/channel/forsen', '/user/pajlada', '/tos']) {
      expect(signInOptions(pathname)).toEqual({ redirectTo: '/settings' });
    }
  });

  it('sends it to settings from the gates too', () => {
    expect(signInOptions('/settings')).toEqual({ redirectTo: '/settings' });
    expect(signInOptions('/dashboard')).toEqual({ redirectTo: '/settings' });
  });

  it('stays put on the donation pages, where signing in is a step', () => {
    expect(signInOptions('/donate')).toBeUndefined();
    expect(signInOptions('/donate/success')).toBeUndefined();
  });

  it('does not treat a lookalike route as a donation page', () => {
    expect(signInOptions('/user/donatello')).toEqual({ redirectTo: '/settings' });
  });
});
