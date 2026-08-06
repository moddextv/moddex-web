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