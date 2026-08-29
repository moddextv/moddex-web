import { getTranslator } from '@/i18n/dictionary';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { backupLate, clock, nightlyRuns, size } from '@/utils/jobHealth';

const AT = '2026-08-14T03:00:00.000Z';
const en = getTranslator('en');

describe('the schedule notes name a time the api sent', () => {
  it('prints the slot the job is actually due at', () => {
    expect(en('dash.jh.snapshotNote', { slot: en.time('2026-08-29T02:00:00.000Z') })).toBe(
      'one point a day at 02:00 UTC'
    );
    expect(en('dash.jh.roleCountsNote', { slot: en.time('2026-08-29T02:30:00.000Z') })).toBe(
      'the browse rankings, rebuilt at 02:30 UTC'
    );
  });
});

describe('clock', () => {
  it('shows only the time when the slot is today', () => {
    expect(clock(AT, en, new Date('2026-08-14T21:40:00.000Z'))).toBe('03:00 UTC');
  });

  it('adds the day once the slot is not today', () => {
    expect(clock(AT, en, new Date('2026-08-15T00:10:00.000Z'))).toBe('Aug 14, 03:00 UTC');
  });

  it('reads in UTC, not the reader’s zone — the jobs are scheduled in UTC', () => {
    expect(clock('2026-01-05T23:30:00.000Z', en, new Date('2026-02-01T00:00:00.000Z'))).toBe(
      'Jan 5, 23:30 UTC'
    );
  });

  it('pads both halves', () => {
    expect(clock('2026-08-14T04:05:00.000Z', en, new Date('2026-08-14T09:00:00.000Z'))).toBe(
      '04:05 UTC'
    );
  });

  // a hand-written month table printed "14 Mar" on the german dashboard
  it('names the month in the language the dashboard is read in', () => {
    const notToday = new Date('2026-03-20T00:00:00.000Z');
    const march = '2026-03-14T03:00:00.000Z';

    expect(clock(march, getTranslator('de'), notToday)).toBe('14. März, 03:00 UTC');
    expect(clock(march, getTranslator('fr'), notToday)).toBe('14 mars, 03:00 UTC');
  });
});

describe('size', () => {
  it('reports whole megabytes', () => {
    expect(size(726 * 1_048_576)).toBe('726 MB');
  });

  it('rounds rather than truncating, so a near-full MB does not read as one less', () => {
    expect(size(1_048_576 * 1.6)).toBe('2 MB');
  });

  it('says 0 MB rather than nothing for an empty file — the 12 August failure shape', () => {
    expect(size(0)).toBe('0 MB');
  });
});

describe('backupLate', () => {
  const daily = 86_400;
  const ran = Date.parse('2026-08-14T03:00:00.000Z');

  it('is not late immediately after it ran', () => {
    expect(backupLate(AT, daily, ran + 1_000)).toBe(false);
  });

  it('is not late at exactly one interval — the grace exists so a slow run is not an alert', () => {
    expect(backupLate(AT, daily, ran + daily * 1000)).toBe(false);
  });

  it('is still not late inside the quarter-interval grace', () => {
    expect(backupLate(AT, daily, ran + daily * 1200)).toBe(false);
  });

  it('is late once the grace is spent', () => {
    expect(backupLate(AT, daily, ran + daily * 1251)).toBe(true);
  });
});

describe('a relative time is narrow, and speaks the language it is read in', () => {
  const now = new Date('2026-08-14T12:00:00.000Z');
  const en = getTranslator('en');
  const de = getTranslator('de');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('answers empty for a missing timestamp, so the caller names its own "never"', () => {
    expect(en.ago(null)).toBe('');
    expect(de.ago(null)).toBe('');
  });

  it('keeps the english wording the dashboard already had', () => {
    expect(en.ago('2026-08-14T11:30:00.000Z')).toBe('30m ago');
    expect(en.ago('2026-08-14T09:00:00.000Z')).toBe('3h ago');
    expect(en.ago('2026-08-11T12:00:00.000Z')).toBe('3d ago');
  });

  it('says the same thing in german rather than leaving it english', () => {
    expect(de.ago('2026-08-14T09:00:00.000Z')).toBe('vor 3 Std.');
    expect(de.ago('2026-08-11T12:00:00.000Z')).toBe('vor 3 Tagen');
  });

  it('rounds to the nearest unit', () => {
    expect(en.ago('2026-08-14T11:00:00.000Z')).toBe('1h ago');
  });
});

describe('nightlyRuns', () => {
  const daily = 86_400;
  const night = '2026-08-21T04:55:38.000Z';
  const now = Date.parse('2026-08-21T09:00:00.000Z');

  const runs = (...ats: string[]) =>
    Object.fromEntries(ats.map((at, index) => [`job_${index}`, { at }]));

  it('counts every job that made its last slot', () => {
    expect(nightlyRuns(runs(night, night, night, night, night), now)).toEqual({ ran: 5, total: 5 });
  });

  // a job that stops running is the failure this tile exists for, and it looks
  // like nothing at all on a page that only shows the last run's duration
  it('drops one that has not run since the slot before last', () => {
    const stale = '2026-08-19T04:55:38.000Z';

    expect(nightlyRuns(runs(night, night, stale), now)).toEqual({ ran: 2, total: 3 });
  });

  it('gives a long-running job the same grace a backup gets', () => {
    const ran = Date.parse('2026-08-20T04:55:38.000Z');

    expect(nightlyRuns(runs(night), ran + daily * 1200).ran).toBe(1);
    expect(nightlyRuns(runs('2026-08-20T04:55:38.000Z'), ran + daily * 1251).ran).toBe(0);
  });

  it('reports nothing rather than dividing by zero when no job has ever run', () => {
    expect(nightlyRuns({}, now)).toEqual({ ran: 0, total: 0 });
  });
});
