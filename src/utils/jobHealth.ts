const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const clock = (iso: string, now: Date = new Date()): string => {
  const at = new Date(iso);
  const hours = String(at.getUTCHours()).padStart(2, '0');
  const minutes = String(at.getUTCMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes} UTC`;

  const sameDay = now.toISOString().slice(0, 10) === iso.slice(0, 10);

  return sameDay ? time : `${at.getUTCDate()} ${MONTHS[at.getUTCMonth()]} ${time}`;
};

export const size = (bytes: number): string => `${Math.round(bytes / 1_048_576)} MB`;

// floor, not round: rounding the minutes while the seconds are a remainder
// printed 3339s as "56m 39s", which is a minute more than it took
export const duration = (value: number): string =>
  value >= 60 ? `${Math.floor(value / 60)}m ${value % 60}s` : `${value}s`;

// late once a quarter of its own interval has passed on top of it
export const staleAfter = (at: string, everySeconds: number, now: number = Date.now()): boolean =>
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
