// pinned, or a server-rendered date disagrees with the browser that hydrates it
const ZONE = 'UTC';

const asDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 30],
  ['month', 12]
];

export interface Formatters {
  number(value: number | string): string;
  money(cents: number, currency: string): string;
  date(value?: string | null): string;
  dateLong(value?: string | null): string;
  dateTime(value?: string | null): string;
  monthYear(value?: string | null): string;
  time(value?: string | null): string;
  dayTime(value?: string | null): string;
  since(value?: string | null): string;
  ago(value?: string | null): string;
}

const relative =
  (tag: string, style: 'long' | 'narrow') =>
  (value?: string | null): string => {
    const date = asDate(value);

    if (!date) return '';

    const format = new Intl.RelativeTimeFormat(tag, { numeric: 'auto', style });
    let amount = (Date.now() - date.getTime()) / 1000;

    for (const [unit, size] of RELATIVE_STEPS) {
      if (Math.abs(amount) < size) return format.format(-Math.round(amount), unit);
      amount /= size;
    }

    return format.format(-Math.round(amount), 'year');
  };

const dateIn =
  (tag: string, options: Intl.DateTimeFormatOptions) =>
  (value?: string | null): string => {
    const date = asDate(value);

    return date ? date.toLocaleString(tag, { ...options, timeZone: ZONE }) : '';
  };

export const formatters = (tag: string): Formatters => ({
  number: (value) => Number(value).toLocaleString(tag),

  money: (cents, currency) =>
    new Intl.NumberFormat(tag, { style: 'currency', currency }).format(cents / 100),

  date: dateIn(tag, { day: '2-digit', month: 'short', year: 'numeric' }),

  dateLong: dateIn(tag, { day: 'numeric', month: 'long', year: 'numeric' }),

  dateTime: dateIn(tag, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }),

  monthYear: dateIn(tag, { month: 'long', year: 'numeric' }),

  // the jobs are scheduled in UTC, so these two name the zone rather than hide it
  time: dateIn(tag, { hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' }),

  dayTime: dateIn(tag, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }),

  since: relative(tag, 'long'),

  // the same fact in the width a dashboard tile has: "3d ago", "vor 3 Tagen"
  ago: relative(tag, 'narrow')
});
