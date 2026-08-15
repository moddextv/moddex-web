import { describe, expect, it } from 'vitest';
import { backupLate, clock, size } from '@/utils/jobHealth';
import { ago } from '@/components/Dashboard/ago';

const AT = '2026-08-14T03:00:00.000Z';

describe('clock', () => {
  it('shows only the time when the slot is today', () => {
    expect(clock(AT, new Date('2026-08-14T21:40:00.000Z'))).toBe('03:00 UTC');
  });

  it('adds the day once the slot is not today', () => {
    expect(clock(AT, new Date('2026-08-15T00:10:00.000Z'))).toBe('14 Aug 03:00 UTC');
  });

  it('reads in UTC, not the reader’s zone — the jobs are scheduled in UTC', () => {
    expect(clock('2026-01-05T23:30:00.000Z', new Date('2026-02-01T00:00:00.000Z'))).toBe(
      '5 Jan 23:30 UTC'
    );
  });

  it('pads both halves', () => {
    expect(clock('2026-08-14T04:05:00.000Z', new Date('2026-08-14T09:00:00.000Z'))).toBe(
      '04:05 UTC'
    );
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

describe('ago', () => {
  const now = Date.parse('2026-08-14T12:00:00.000Z');

  it('says never for a job that has not run', () => {
    expect(ago(null, now)).toBe('never');
  });

  it('collapses the last minute to just now', () => {
    expect(ago('2026-08-14T11:59:40.000Z', now)).toBe('just now');
  });

  it('counts minutes, then hours, then days', () => {
    expect(ago('2026-08-14T11:30:00.000Z', now)).toBe('30m ago');
    expect(ago('2026-08-14T09:00:00.000Z', now)).toBe('3h ago');
    expect(ago('2026-08-11T12:00:00.000Z', now)).toBe('3d ago');
  });

  it('does not fall back to minutes at the hour boundary', () => {
    expect(ago('2026-08-14T11:00:00.000Z', now)).toBe('1h ago');
  });
});
