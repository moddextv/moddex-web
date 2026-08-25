/**
 * Two languages, one handle.
 *
 *   server component   const t = getTranslator(locale)
 *   client component   const t = useT()            // or useI18n() for rich/path
 *
 *   t('nav.about')                 a message, by dotted key
 *   t('roles.mod', { count: n })   the plural form the language uses
 *   t.number(n) t.date(iso) …      anything else a locale decides
 *
 * Everything a reader sees comes from `messages/en.json` and `messages/de.json`,
 * which carry the same keys — a test holds them level. The locale itself is a
 * path segment (`/de/…`, english unprefixed) and is passed down, never global:
 * this app renders on the server, where module state is shared between requests.
 *
 *   locales.ts     which languages exist, and how a path carries one
 *   translate.ts   key → string: lookup, plurals, {vars}, <tags>
 *   format.ts      number, date, money, "3d ago" — all through Intl
 *   dictionary.ts  the json, flattened once at import
 *   context.tsx    the client half: provider and hooks
 *   rich.tsx       <link>…</link> in a message → react elements
 */

export type { Locale } from './locales';
export {
  asLocale,
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  localeName,
  localePath,
  localeTag,
  ogLocale,
  stripLocale,
  swapLocale
} from './locales';

export type { Translator, Vars } from './translate';
export { optional } from './translate';

export { dictionaryOf, getRich, getTranslator, messageKeys } from './dictionary';

export type { RichTranslator, Tags } from './rich';

export { I18nProvider, useI18n, useT } from './context';
