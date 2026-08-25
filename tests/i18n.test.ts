import { flatten, translator } from '@/i18n/translate';
import {
  asLocale,
  DEFAULT_LOCALE,
  dictionaryOf,
  getTranslator,
  isLocale,
  localeName,
  localePath,
  LOCALES,
  localeTag,
  messageKeys,
  ogLocale,
  stripLocale,
  swapLocale
} from '@/i18n';
import { describe, expect, it } from 'vitest';

describe('flatten', () => {
  it('joins nested namespaces with dots', () => {
    expect(flatten({ nav: { about: 'about' } })).toEqual({ 'nav.about': 'about' });
  });

  it('keeps a plural group as one key rather than a namespace', () => {
    const flat = flatten({ roles: { mod: { one: 'moderator', other: 'moderators' } } });

    expect(flat).toEqual({
      'roles.mod.one': 'moderator',
      'roles.mod.other': 'moderators'
    });
  });

  it('does not mistake a namespace whose keys merely look plural-ish', () => {
    const flat = flatten({ page: { one: 'first', extra: 'x' } });

    expect(flat).toEqual({ 'page.one': 'first', 'page.extra': 'x' });
  });
});

describe('translator', () => {
  const dict = {
    'nav.about': 'about',
    greet: 'Hello {name}, you have {count} new',
    'roles.mod.one': 'moderator',
    'roles.mod.other': 'moderators'
  };

  const t = translator('en', dict);

  it('returns the key itself when nothing matches', () => {
    expect(t('nothing.here')).toBe('nothing.here');
  });

  it('interpolates named variables', () => {
    expect(t('greet', { name: 'ann', count: 2 })).toBe('Hello ann, you have 2 new');
  });

  it('leaves an unknown placeholder in place rather than printing undefined', () => {
    expect(translator('en', { x: 'a {missing} b' })('x')).toBe('a {missing} b');
  });

  it('selects the plural form from the count', () => {
    expect(t('roles.mod', { count: 1 })).toBe('moderator');
    expect(t('roles.mod', { count: 4 })).toBe('moderators');
    expect(t('roles.mod', { count: 0 })).toBe('moderators');
  });

  it('falls back to the default locale for a key the locale is missing', () => {
    const partial = translator('de', { 'nav.about': 'Über' }, dict);

    expect(partial('nav.about')).toBe('Über');
    expect(partial('greet', { name: 'ann', count: 2 })).toBe('Hello ann, you have 2 new');
  });

  it('falls back across a plural group too', () => {
    const partial = translator('de', {}, dict);

    expect(partial('roles.mod', { count: 3 })).toBe('moderators');
  });
});

describe('locales', () => {
  it('serves the default locale unprefixed and the others under a segment', () => {
    expect(localePath('en', '/user/maersux')).toBe('/user/maersux');
    expect(localePath('de', '/user/maersux')).toBe('/de/user/maersux');
  });

  it('does not leave a bare trailing slash on the root', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('de', '/')).toBe('/de');
  });

  it('swaps the locale of a path that already carries one', () => {
    expect(swapLocale('/de/user/maersux', 'en')).toBe('/user/maersux');
    expect(swapLocale('/user/maersux', 'de')).toBe('/de/user/maersux');
    expect(swapLocale('/de/user/maersux', 'de')).toBe('/de/user/maersux');
  });

  it('swaps the root in both directions without a trailing slash', () => {
    expect(swapLocale('/', 'de')).toBe('/de');
    expect(swapLocale('/de', 'en')).toBe('/');
  });

  it('leaves a path alone whose first segment merely looks like a locale', () => {
    expect(stripLocale('/user/de')).toBe('/user/de');
    expect(swapLocale('/c/deadmau5', 'de')).toBe('/de/c/deadmau5');
  });

  it('gives every configured locale a name and a tag Intl accepts', () => {
    for (const locale of LOCALES) {
      expect(localeName(locale)).toBeTruthy();
      expect(() => new Intl.PluralRules(localeTag(locale))).not.toThrow();
      expect(ogLocale(locale)).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });

  it('recognises only the locales it ships', () => {
    expect(isLocale('de')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(asLocale('fr')).toBe(DEFAULT_LOCALE);
    expect(asLocale(undefined)).toBe(DEFAULT_LOCALE);
  });
});

describe('the shipped message files', () => {
  it('gives every locale the same keys as the default, so nothing silently falls back', () => {
    const base = messageKeys(DEFAULT_LOCALE);

    expect(base.length).toBeGreaterThan(0);

    for (const locale of LOCALES) {
      expect({ locale, keys: messageKeys(locale) }).toEqual({ locale, keys: base });
    }
  });

  it('resolves a real key in every locale without returning the key itself', () => {
    for (const locale of LOCALES) {
      const t = getTranslator(locale);

      expect(t('nav.about')).not.toBe('nav.about');
      expect(dictionaryOf(locale)['nav.about']).toBeTruthy();
    }
  });
});

describe('a server component never reaches for the client hook', () => {
  it('every useT/useI18n caller is a client component or imported by one', () => {
    const { readFileSync, readdirSync, statSync } = require('node:fs');
    const { join } = require('node:path');
    const root = join(__dirname, '..', 'src');

    const walkAll = (dir: string): string[] =>
      readdirSync(dir).flatMap((entry: string) => {
        const full = join(dir, entry);

        return statSync(full).isDirectory() ? walkAll(full) : full.endsWith('.tsx') ? [full] : [];
      });

    // these two are only ever rendered from UserList, which is 'use client'
    const CLIENT_BY_IMPORT = ['UserListItem.tsx', 'UserListLoading.tsx'];

    const offenders = walkAll(root)
      .filter((file: string) => {
        const source = readFileSync(file, 'utf8');

        if (!/\buseT\(\)|\buseI18n\(\)/.test(source)) return false;
        if (source.startsWith("'use client'")) return false;

        return !CLIENT_BY_IMPORT.some((name) => file.endsWith(name));
      })
      .map((file: string) => file.split('src')[1]);

    expect(offenders).toEqual([]);
  });
});

describe('every key a component asks for exists', () => {
  /**
   * The other tests hold the two message files against each other, which says
   * nothing about whether either matches the code. A renamed key reads as an
   * ordinary word on the page, because a missing message renders as its own key.
   */
  it('finds no t() call and no key constant without a message behind it', () => {
    const { readFileSync, readdirSync, statSync } = require('node:fs');
    const { join } = require('node:path');
    const root = join(__dirname, '..', 'src');

    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((entry: string) => {
        const full = join(dir, entry);

        if (statSync(full).isDirectory()) return entry === 'messages' ? [] : walk(full);

        return /\.tsx?$/.test(full) ? [full] : [];
      });

    const known = new Set(messageKeys(DEFAULT_LOCALE));
    const groups = new Set(
      [...known]
        .filter((key) => /\.(one|other|zero|two|few|many)$/.test(key))
        .map((key) => key.slice(0, key.lastIndexOf('.')))
    );

    const NAMESPACES = [...new Set([...known].map((key) => key.split('.')[0] ?? ''))].join('|');
    const LITERAL = new RegExp(`'((?:${NAMESPACES})\\.[A-Za-z0-9.]+)'`, 'g');

    const missing: string[] = [];

    for (const file of walk(root)) {
      const source: string = readFileSync(file, 'utf8');

      for (const match of source.matchAll(LITERAL)) {
        const key = match[1] ?? '';

        if (known.has(key) || groups.has(key)) continue;
        missing.push(`${file.split('src')[1]}: ${key}`);
      }
    }

    expect([...new Set(missing)]).toEqual([]);
  });
});

describe('an internal link keeps the reader in their language', () => {
  /**
   * A plain <Link href="/user/x"> sends a german reader back into the english
   * tree, and nothing about the page looks wrong when it happens.
   */
  it('uses LocaleLink or localePath for every internal href', () => {
    const { readFileSync, readdirSync, statSync } = require('node:fs');
    const { join } = require('node:path');
    const root = join(__dirname, '..', 'src');

    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((entry: string) => {
        const full = join(dir, entry);

        if (statSync(full).isDirectory()) return entry === 'messages' ? [] : walk(full);

        return /\.tsx?$/.test(full) ? [full] : [];
      });

    // an <a> or a <Link> whose href is a literal page path rather than a
    // LocaleLink, and the same mistake made through the router. /api/... is
    // exempt: those are routes, and have no locale
    const BARE = [
      /<(?:Link|a)\s[^>]*href=(?:"\/(?!api\/)|\{`\/(?!api\/))/gs,
      /router\.(?:push|replace)\(\s*[`'"]\//g,
      /\bredirect\(\s*[`'"]\//g
    ];

    const offenders = walk(root)
      .filter((file: string) => !file.endsWith('LocaleLink.tsx'))
      .flatMap((file: string) => {
        const source = readFileSync(file, 'utf8') as string;
        const found = BARE.flatMap((pattern) => source.match(pattern) ?? []);

        return found.map((hit: string) => `${file.split('src')[1]}: ${hit.slice(0, 40)}`);
      });

    expect(offenders).toEqual([]);
  });
});
