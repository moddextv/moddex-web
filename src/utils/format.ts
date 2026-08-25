export const LOCALE = 'en-US';

// pinned, or a server-rendered date disagrees with the browser that hydrates it
const ZONE = 'UTC';

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: ZONE
  };

  return date.toLocaleDateString(LOCALE, options);
};

const asDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatMonthYearLong = (value?: string | null): string | null => {
  const date = asDate(value);
  return date
    ? date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric', timeZone: ZONE })
    : null;
};

export const formatDayMonthYear = (value?: string | null): string | null => {
  const date = asDate(value);
  return date
    ? date.toLocaleDateString(LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: ZONE
      })
    : null;
};

export const formatDateTime = (value?: string | null): string | null => {
  const date = asDate(value);
  return date
    ? date.toLocaleString(LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: ZONE
      })
    : null;
};

export const formatRelative = (value?: string | null): string | null => {
  const date = asDate(value);
  if (!date) return null;

  const format = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
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

export const formatNumber = (num: number | string = 0): string => {
  return num.toLocaleString(LOCALE);
};

export const formatNumberShort = (num: number): string => {
  if (num < 1000) return num.toString();

  const units = ['k', 'm', 'b', 't'];
  const order = Math.floor(Math.log10(num) / 3);
  const unitName = units[order - 1];
  const numFormatted = num / Math.pow(1000, order);

  return `${numFormatted.toFixed(1)}${unitName}`;
};

export const plural = (count: number, one: string, many = `${one}s`): string =>
  count === 1 ? one : many;
