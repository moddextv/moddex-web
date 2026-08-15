// twitch logins: letters, digits and underscore, 1-25 characters
const USERNAME = /^[a-zA-Z0-9_]{1,25}$/;

export const isUsername = (value: string): boolean => USERNAME.test(value);
