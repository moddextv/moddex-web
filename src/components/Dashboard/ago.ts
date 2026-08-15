export const ago = (iso: string | null, now: number = Date.now()): string => {
  if (!iso) return 'never';

  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;

  return `${Math.round(minutes / 1440)}d ago`;
};
