import de from './messages/de.json';
import en from './messages/en.json';
import { DEFAULT_LOCALE, Locale, LOCALES } from './locales';
import { Dictionary, flatten, Messages, translator, Translator } from './translate';
import { richFrom, RichTranslator } from './rich';

// imported rather than read from disk, so the messages are bundled into the image
const SOURCES: Record<Locale, Messages> = { en, de };

const DICTIONARIES = Object.fromEntries(
  LOCALES.map((locale) => [locale, flatten(SOURCES[locale])])
) as Record<Locale, Dictionary>;

export const dictionaryOf = (locale: Locale): Dictionary =>
  DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];

export const getTranslator = (locale: Locale): Translator =>
  translator(locale, dictionaryOf(locale), DICTIONARIES[DEFAULT_LOCALE]);

export const getRich = (locale: Locale): RichTranslator => richFrom(getTranslator(locale));

export const messageKeys = (locale: Locale): string[] =>
  Object.keys(DICTIONARIES[locale] ?? {}).sort();
