export const DEFAULT_LOCALE = 'en';

export const LOCALES = ['en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

// the bcp-47 tag Intl needs; the locale itself stays the short url segment
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-US',
  de: 'de-DE'
};

export const LOCALE_NAME: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch'
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const asLocale = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

// the default locale is served unprefixed, so its path carries no segment
export const localePath = (locale: Locale, path: string): string => {
  const clean = path.startsWith('/') ? path : `/${path}`;

  if (locale === DEFAULT_LOCALE) return clean;

  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
};

export const stripLocale = (path: string): string => {
  const [, first, ...rest] = path.split('/');

  if (!isLocale(first)) return path;

  return rest.length ? `/${rest.join('/')}` : '/';
};

// the same page in another language, from a pathname that may already carry one
export const swapLocale = (path: string, to: Locale): string => localePath(to, stripLocale(path));
