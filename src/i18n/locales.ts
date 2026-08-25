import { config } from '@/config';

const { defaultLocale, locales } = config.i18n;

export type Locale = keyof typeof locales;

export const DEFAULT_LOCALE: Locale = defaultLocale;

export const LOCALES = Object.keys(locales) as Locale[];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as string[]).includes(value);

export const asLocale = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

export const localeName = (locale: Locale): string => locales[asLocale(locale)].name;

export const localeTag = (locale: Locale): string => locales[asLocale(locale)].tag;

// open graph writes the same tag with an underscore
export const ogLocale = (locale: Locale): string => localeTag(locale).replace('-', '_');

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
