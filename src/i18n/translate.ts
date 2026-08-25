import { Formatters, formatters } from './format';
import { Locale, localeTag } from './locales';

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

/**
 * For a key that comes from a url or an api rather than from the code, where
 * "no such message" is an ordinary answer and printing the key would be wrong.
 */
export const optional = (t: Translator, key: string | undefined | null): string | null => {
  if (!key) return null;

  const text = t(key);

  return text === key ? null : text;
};

export type Token = { text: string } | { tag: string; text: string };

/**
 * Splits `a <link>b</link> c` into its parts so a translator can move the
 * linked words inside the sentence instead of the sentence being cut into
 * three keys around them. One level, no nesting — anything more belongs in
 * markup rather than in a message.
 */
export const tokenize = (text: string): Token[] => {
  const tokens: Token[] = [];
  const pattern = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) tokens.push({ text: text.slice(last, match.index) });

    tokens.push({ tag: match[1] as string, text: match[2] as string });
    last = match.index + match[0].length;
  }

  if (last < text.length) tokens.push({ text: text.slice(last) });

  return tokens;
};

/**
 * Everything a locale decides hangs off one handle: `t('key')` for a message,
 * `t.number` / `t.date` / `t.since` for a value. A call site that renders text
 * already has `t` in scope, so nothing else ever has to know the locale exists.
 */
export interface Translator extends Formatters {
  (key: string, vars?: Vars): string;
  readonly locale: Locale;
}

export const translator = (
  locale: Locale,
  dict: Dictionary,
  fallback: Dictionary = {}
): Translator => {
  const tag = localeTag(locale);

  const translate = (key: string, vars: Vars = {}): string => {
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

  return Object.assign(translate, { locale }, formatters(tag));
};
