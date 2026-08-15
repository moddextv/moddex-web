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

// late once a quarter of its own interval has passed on top of it
export const backupLate = (at: string, everySeconds: number, now: number = Date.now()): boolean =>
  now - new Date(at).getTime() > everySeconds * 1250;
