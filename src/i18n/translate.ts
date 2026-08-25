import { DEFAULT_LOCALE, Locale, LOCALE_TAG } from './locales';

export type Messages = Record<string, unknown>;
export type Dictionary = Record<string, string>;
export type Vars = Record<string, string | number>;

const PLURAL_KEYS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

export const flatten = (messages: Messages, prefix = ''): Dictionary => {
  const flat: Dictionary = {};

  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      flat[path] = value;
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const branch = value as Messages;
      const keys = Object.keys(branch);

      // a plural group is a leaf, not a namespace — keep its forms under one key
      if (keys.length > 0 && keys.every((form) => PLURAL_KEYS.has(form))) {
        for (const form of keys) flat[`${path}.${form}`] = String(branch[form]);
        continue;
      }

      Object.assign(flat, flatten(branch, path));
    }
  }

  return flat;
};

const interpolate = (text: string, vars: Vars): string =>
  text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));

const pluralOf = (
  dict: Dictionary,
  key: string,
  count: number,
  tag: string
): string | undefined => {
  const form = new Intl.PluralRules(tag).select(count);

  return dict[`${key}.${form}`] ?? dict[`${key}.other`];
};

export interface Translator {
  (key: string, vars?: Vars): string;
}

export const translator = (
  locale: Locale,
  dict: Dictionary,
  fallback: Dictionary = {}
): Translator => {
  const tag = LOCALE_TAG[locale] ?? LOCALE_TAG[DEFAULT_LOCALE];

  return (key, vars = {}) => {
    const count = typeof vars.count === 'number' ? vars.count : undefined;

    const text =
      count === undefined
        ? (dict[key] ?? fallback[key])
        : (pluralOf(dict, key, count, tag) ??
          pluralOf(fallback, key, count, tag) ??
          dict[key] ??
          fallback[key]);

    if (text === undefined) return key;

    return interpolate(text, vars);
  };
};
