const logMessage = (type: string, color: string, ...args: unknown[]) => {
  const options = { timeZone: 'Europe/Berlin' };
  const date = new Date().toLocaleString('de-DE', options);

  const coloredType = `\x1b[${color}m${type}\x1b[97m`;
  console.log(`\x1b[37m${date}\x1b[97m [${coloredType}]:`, ...args);
};

export const logger = {
  log(...args: unknown[]): void {
    logMessage('LOG', '34', ...args);
  },

  info(...args: unknown[]): void {
    logMessage('INFO', '32', ...args);
  },

  warn(...args: unknown[]): void {
    logMessage('WARN', '33', ...args);
  },

  error(...args: unknown[]): void {
    logMessage('ERROR', '31', ...args);
  }
};
