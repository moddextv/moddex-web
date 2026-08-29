import { Formatters } from '@/i18n/format';

export const clock = (iso: string, t: Formatters, now: Date = new Date()): string =>
  now.toISOString().slice(0, 10) === iso.slice(0, 10) ? t.time(iso) : t.dayTime(iso);

export const size = (bytes: number): string => `${Math.round(bytes / 1_048_576)} MB`;

// floor, not round: rounding the minutes while the seconds are a remainder
// printed 3339s as "56m 39s", which is a minute more than it took
export const duration = (value: number): string =>
  value >= 60 ? `${Math.floor(value / 60)}m ${value % 60}s` : `${value}s`;

// late once a quarter of its own interval has passed on top of it
const staleAfter = (at: string, everySeconds: number, now: number = Date.now()): boolean =>
  now - new Date(at).getTime() > everySeconds * 1250;

export const backupLate = staleAfter;

const DAILY_SECONDS = 86_400;

// how many of the nightly jobs made their last slot, on the same grace as a
// backup: a job running long is not an alert, a job not running at all is
export const nightlyRuns = (
  runs: Record<string, { at: string }>,
  now: number = Date.now()
): { ran: number; total: number } => {
  const entries = Object.values(runs);

  return {
    ran: entries.filter((run) => !staleAfter(run.at, DAILY_SECONDS, now)).length,
    total: entries.length
  };
};
