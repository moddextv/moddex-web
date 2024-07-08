const logMessage = (type: string, color: string, ...args: any[]) => {
    const options = { timeZone: 'Europe/Berlin' };
    const date = new Date().toLocaleString('de-DE', options);

    const coloredType = `\x1b[${color}m${type}\x1b[97m`;
    console.log(`\x1b[37m${date}\x1b[97m [${coloredType}]:`, ...args);
};

export const logger = {
    log(...args: any[]): void {
        logMessage('LOG', '34', ...args);
    },

    info(...args: any[]): void {
        logMessage('INFO', '32', ...args);
    },

    warn(...args: any[]): void {
        logMessage('WARN', '33', ...args);
    },

    error(...args: any[]): void {
        logMessage('ERROR', '31', ...args);
    },

    irc(...args: any[]): void {
        logMessage('IRC', '96', ...args);
    },

    web(...args: any[]): void {
        logMessage('WEB', '95', ...args);
    }
};