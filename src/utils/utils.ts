export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return date.toLocaleDateString('en-US', options);
};

/**
 * the mariadb driver hands back a Date for DATETIME columns while the gql path
 * supplies an ISO string, so everything below has to take both — and has to
 * survive whatever twitch put in the column, hence the NaN guard.
 */
const asDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "March 2011" — for the one place a profile states when an account started */
export const formatMonthYearLong = (value?: string | Date | null): string | null => {
  const date = asDate(value);
  return date
    ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;
};

/**
 * "Apr 2016". a grant date is read as a column of 24, where the day of the
 * month is noise: nobody scanning a mod list cares that it was the 14th, and
 * the extra glyphs were part of what made the old list feel like a ledger.
 */
export const formatMonthYear = (value?: string | Date | null): string | null => {
  const date = asDate(value);
  return date
    ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;
};

/**
 * "4 minutes ago". NOT safe to render during SSR — it reads the clock, so the
 * server and the client produce different strings and react logs a hydration
 * mismatch. call it from an effect.
 */
export const formatRelative = (value?: string | Date | null): string | null => {
  const date = asDate(value);
  if (!date) return null;

  const format = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 30],
    ['month', 12]
  ];

  let amount = (Date.now() - date.getTime()) / 1000;

  for (const [unit, size] of steps) {
    if (Math.abs(amount) < size) return format.format(-Math.round(amount), unit);
    amount /= size;
  }

  return format.format(-Math.round(amount), 'year');
};

export const formatNumber = (num: number|string = 0): string => {
  return num.toLocaleString('en-US');
};

export const formatNumberShort = (num: number): string => {
  if (num < 1000) return num.toString();

  const units = ['k', 'm', 'b', 't'];
  const order = Math.floor(Math.log10(num) / 3);
  const unitName = units[order - 1];
  const numFormatted = num / Math.pow(1000, order);

  return `${numFormatted.toFixed(1)}${unitName}`;
};

/**
 * chunks without touching the input. the previous implementation spliced in a
 * loop, so it handed back the chunks and left the caller holding an emptied
 * array -- fine for `splitArray(x)` used once, silently wrong for anything
 * that read `x` afterwards.
 */
export const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
  if (chunkSize < 1) {
    throw new RangeError(`chunkSize must be at least 1, got ${chunkSize}`);
  }

  const results: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
};