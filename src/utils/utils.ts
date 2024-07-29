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

export const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
};