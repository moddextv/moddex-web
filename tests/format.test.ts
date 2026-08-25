import { getTranslator } from '@/i18n';
import { describe, expect, it } from 'vitest';
import { signInOptions } from '@/utils/signIn';

const en = getTranslator('en');
const de = getTranslator('de');

describe('a number carries its locale', () => {
  it('groups thousands the way each language does', () => {
    expect(en.number(1234567)).toBe('1,234,567');
    expect(de.number(1234567)).toBe('1.234.567');
  });

  it('puts the currency where the language puts it', () => {
    expect(en.money(2500, 'USD')).toBe('$25.00');
    expect(de.money(2500, 'EUR')).toBe('25,00\u00a0\u20ac');
  });
});

describe('a date carries its locale', () => {
  const iso = '2019-10-09T19:02:26Z';

  it('formats the short form each way round', () => {
    expect(en.date(iso)).toBe('Oct 09, 2019');
    expect(de.date(iso)).toBe('09. Okt. 2019');
  });

  it("names the month in the reader's language", () => {
    expect(en.dateLong(iso)).toBe('October 9, 2019');
    expect(de.dateLong(iso)).toBe('9. Oktober 2019');
    expect(en.monthYear(iso)).toBe('October 2019');
    expect(de.monthYear(iso)).toBe('Oktober 2019');
  });

  it('returns an empty string for missing input rather than "Invalid Date"', () => {
    for (const t of [en, de]) {
      expect(t.date()).toBe('');
      expect(t.date(null)).toBe('');
      expect(t.date('')).toBe('');
      expect(t.since(null)).toBe('');
    }
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
  ])('dateLong in %s', (zone, expected) => {
    expect(zoned(zone, () => en.dateLong('2016-12-08T23:30:00Z'))).toBe(expected);
  });

  it.each([
    ['UTC', 'Dec 08, 2016'],
    ['Europe/Zurich', 'Dec 08, 2016'],
    ['Pacific/Auckland', 'Dec 08, 2016']
  ])('date in %s', (zone, expected) => {
    expect(zoned(zone, () => en.date('2016-12-08T23:30:00Z'))).toBe(expected);
  });

  it('monthYear does not roll into the next month', () => {
    expect(zoned('Pacific/Auckland', () => en.monthYear('2016-11-30T23:30:00Z'))).toBe(
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
