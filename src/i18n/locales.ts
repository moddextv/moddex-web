import { config } from '@/config';
import { routeFor, slugFor } from './routes.mjs';

const { defaultLocale, locales } = config.i18n;

export type Locale = keyof typeof locales;

export const DEFAULT_LOCALE: Locale = defaultLocale;

export const LOCALES = Object.keys(locales) as Locale[];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as string[]).includes(value);

export const asLocale = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

export const localeName = (locale: Locale): string => locales[asLocale(locale)].name;

export const localeTag = (locale: Locale): string => locales[asLocale(locale)].tag;

export const localeFlag = (locale: Locale): string =>
  `/flags/${locales[asLocale(locale)].flag}.svg`;

// open graph writes the same tag with an underscore
export const ogLocale = (locale: Locale): string => localeTag(locale).replace('-', '_');

// a query string would otherwise ride along on the segment and stop it matching
const splitSuffix = (path: string): [string, string] => {
  const at = path.search(/[?#]/);

  return at === -1 ? [path, ''] : [path.slice(0, at), path.slice(at)];
};

// a path in this codebase is always the english one; localePath renders it
export const localePath = (locale: Locale, path: string): string => {
  const [bare, suffix] = splitSuffix(path.startsWith('/') ? path : `/${path}`);
  const [, first, ...deeper] = bare.split('/');
  const translated = first ? [slugFor(locale, first), ...deeper].join('/') : '';

  const rendered =
    locale === DEFAULT_LOCALE
      ? translated
        ? `/${translated}`
        : '/'
      : translated
        ? `/${locale}/${translated}`
        : `/${locale}`;

  return `${rendered}${suffix}`;
};

// and back: a url the reader sees becomes the english path the code passes round
export const stripLocale = (path: string): string => {
  const [bare, suffix] = splitSuffix(path);
  const [, first, ...rest] = bare.split('/');

  if (!isLocale(first)) return path;
  if (!rest.length) return `/${suffix}`;

  const [slug, ...deeper] = rest;

  return `/${[routeFor(first, slug ?? ''), ...deeper].join('/')}${suffix}`;
};

// the same page in another language, from a pathname that may already carry one
export const swapLocale = (path: string, to: Locale): string => localePath(to, stripLocale(path));
