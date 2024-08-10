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

export const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
};