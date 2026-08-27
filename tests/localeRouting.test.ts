import { DEFAULT_LOCALE, LOCALES, localePath, stripLocale, swapLocale } from '@/i18n/locales';
import { describe, expect, it } from 'vitest';
import nextConfig, { LOCALIZED_SEGMENTS, ROUTE_SLUGS } from '../next.config.mjs';
import { alternatesFor, openGraphFor } from '@/misc/metadata';

const rewrites = async () => {
  const result = await nextConfig.rewrites!();

  return (Array.isArray(result) ? result : (result.beforeFiles ?? [])) ?? [];
};

const redirects = async () => nextConfig.redirects!();

// anything here is served by something other than a page, so a locale must never reach it
const OFF_LIMITS = [
  'insights',
  'api',
  'health',
  'robots.txt',
  'sitemap.xml',
  'manifest.webmanifest',
  '_next',
  'icon.svg'
];

describe('the locale rewrite is an allowlist', () => {
  it('never mentions a path that is not a page', async () => {
    const sources = (await rewrites()).map((rule) => rule.source);

    for (const path of OFF_LIMITS) {
      expect(sources.filter((source) => source.includes(path))).toEqual([]);
    }
  });

  it('does not reach the visitor counter, which is the one this rule exists for', () => {
    expect(LOCALIZED_SEGMENTS).not.toContain('insights');
    expect(LOCALIZED_SEGMENTS.some((segment) => 'insights'.startsWith(segment))).toBe(false);
  });

  it('sends the root and every listed segment into the default tree', async () => {
    const rules = await rewrites();
    const find = (source: string) => rules.find((rule) => rule.source === source);

    expect(find('/')?.destination).toBe(`/${DEFAULT_LOCALE}`);

    for (const segment of LOCALIZED_SEGMENTS) {
      expect(find(`/${segment}`)?.destination).toBe(`/${DEFAULT_LOCALE}/${segment}`);
      expect(find(`/${segment}/:path*`)?.destination).toBe(`/${DEFAULT_LOCALE}/${segment}/:path*`);
    }
  });

  it('covers every route folder that exists, so a new page cannot be silently unlocalized', async () => {
    const { readdirSync } = await import('fs');
    const entries = readdirSync(new URL('../src/app/[locale]', import.meta.url), {
      withFileTypes: true
    });

    const folders = entries
      .filter((entry) => entry.isDirectory() && entry.name !== 'fonts')
      .map((entry) => entry.name);

    expect([...folders].sort()).toEqual([...LOCALIZED_SEGMENTS].sort());
  });
});

describe('the default locale is not served twice', () => {
  it('redirects its prefix away permanently', async () => {
    const rules = await redirects();
    const bare = rules.find((rule) => rule.source === `/${DEFAULT_LOCALE}`);
    const deep = rules.find((rule) => rule.source === `/${DEFAULT_LOCALE}/:path*`);

    expect(bare).toMatchObject({ destination: '/', permanent: true });
    expect(deep).toMatchObject({ destination: '/:path*', permanent: true });
  });

  it('leaves the other locales alone', async () => {
    const sources = (await redirects()).map((rule) => rule.source);

    for (const locale of LOCALES.filter((entry) => entry !== DEFAULT_LOCALE)) {
      expect(sources).not.toContain(`/${locale}`);
      expect(sources).not.toContain(`/${locale}/:path*`);
    }
  });
});

describe('a translated page is not a duplicate of the english one', () => {
  it('gives each locale its own canonical', () => {
    expect(alternatesFor('/about', 'en')?.canonical).toBe('/about');
    expect(alternatesFor('/about', 'de')?.canonical).toBe('/de/ueber-moddex');
  });

  it('lists every locale as an alternate, with the default as x-default', () => {
    const languages = alternatesFor('/about', 'de')?.languages ?? {};

    for (const locale of LOCALES) {
      expect(languages[locale]).toBe(localePath(locale, '/about'));
    }

    expect(languages['x-default']).toBe('/about');
  });

  it('carries the locale into openGraph rather than hard-coding en_US', () => {
    expect(openGraphFor('/about', 'de')).toMatchObject({
      locale: 'de_DE',
      url: '/de/ueber-moddex'
    });
    expect(openGraphFor('/about', 'en')).toMatchObject({ locale: 'en_US', url: '/about' });
  });

  // the whole locale tree would be dropped from the index if this ever came back
  it('never points a translated page at the default as its canonical', () => {
    for (const locale of LOCALES.filter((entry) => entry !== DEFAULT_LOCALE)) {
      expect(alternatesFor('/leaderboard', locale)?.canonical).not.toBe('/leaderboard');
    }
  });
});

describe('a route keeps its own name in every language', () => {
  /**
   * The one invariant everything else rests on. A path in the code is always
   * the english one; localePath renders it for a reader and stripLocale reads
   * it back. If that round trip is not the identity, swapLocale sends people to
   * a url that does not exist and every canonical on the site is a guess.
   */
  it('renders and reads back every segment in every locale', () => {
    for (const locale of LOCALES) {
      for (const segment of LOCALIZED_SEGMENTS) {
        const path = `/${segment}`;

        expect(stripLocale(localePath(locale, path)), `${locale} ${path}`).toBe(path);
        expect(
          stripLocale(localePath(locale, `${path}/deeper/still`)),
          `${locale} ${path}/deeper/still`
        ).toBe(`${path}/deeper/still`);
      }

      expect(stripLocale(localePath(locale, '/'))).toBe('/');
    }
  });

  it('swaps between two translated urls without going through english', () => {
    expect(swapLocale('/de/rangliste', 'fr')).toBe('/fr/classement');
    expect(swapLocale('/fr/compte/maersux', 'de')).toBe('/de/account/maersux');
    expect(swapLocale('/de/kanal/forsen', 'en')).toBe('/channel/forsen');
    expect(swapLocale('/leaderboard', 'de')).toBe('/de/rangliste');
  });

  it('leaves a route no language renames alone', () => {
    for (const locale of LOCALES) {
      expect(localePath(locale, '/settings')).toBe(
        locale === DEFAULT_LOCALE ? '/settings' : `/${locale}/settings`
      );
    }
  });

  // a username that happens to read like a slug is still a username
  it('translates the first segment and nothing deeper', () => {
    expect(localePath('de', '/user/leaderboard')).toBe('/de/account/leaderboard');
    expect(stripLocale('/de/account/leaderboard')).toBe('/user/leaderboard');
  });

  /**
   * The leaderboard builds its filter links as `/leaderboard?scale=mod`, so
   * without splitting the query off first the segment reads
   * "leaderboard?scale=mod", matches no slug, and every filter click lands on a
   * redirect. The browser found this; the round trip above did not.
   */
  it('keeps a query string off the segment it would otherwise hide', () => {
    expect(localePath('de', '/leaderboard?scale=mod')).toBe('/de/rangliste?scale=mod');
    expect(localePath('fr', '/user/nightbot?sort=followers')).toBe(
      '/fr/compte/nightbot?sort=followers'
    );
    expect(localePath('de', '/leaderboard#top')).toBe('/de/rangliste#top');
    expect(stripLocale('/de/rangliste?scale=vip')).toBe('/leaderboard?scale=vip');
    expect(swapLocale('/de/rangliste?scale=vip', 'fr')).toBe('/fr/classement?scale=vip');
  });
});

describe('the slug table cannot describe an ambiguous url', () => {
  const slugsOf = (locale: string) =>
    Object.values(ROUTE_SLUGS)
      .map((byLocale) => (byLocale as Record<string, string>)[locale])
      .filter(Boolean);

  it('names only routes that exist', () => {
    for (const route of Object.keys(ROUTE_SLUGS)) {
      expect(LOCALIZED_SEGMENTS, `${route} is not a route`).toContain(route);
    }
  });

  it('gives no two routes the same slug in one language', () => {
    for (const locale of LOCALES) {
      const slugs = slugsOf(locale);

      expect(new Set(slugs).size, `${locale} reuses a slug`).toBe(slugs.length);
    }
  });

  /**
   * A slug equal to another route's english name would resolve to two different
   * pages depending on the language, which is the one thing a url may not do.
   */
  it('never reuses another route’s english name as a translated slug', () => {
    for (const locale of LOCALES) {
      for (const [route, byLocale] of Object.entries(ROUTE_SLUGS)) {
        const slug = (byLocale as Record<string, string>)[locale];

        if (!slug || slug === route) continue;

        expect(LOCALIZED_SEGMENTS, `${locale}: ${slug} is another route`).not.toContain(slug);
      }
    }
  });

  it('keeps every slug typeable: lowercase ascii, no diacritics', () => {
    for (const byLocale of Object.values(ROUTE_SLUGS)) {
      for (const slug of Object.values(byLocale as Record<string, string>)) {
        expect(slug, slug).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it('never collides with a locale code, which would swallow the prefix', () => {
    for (const byLocale of Object.values(ROUTE_SLUGS)) {
      for (const slug of Object.values(byLocale as Record<string, string>)) {
        expect(LOCALES as string[], slug).not.toContain(slug);
      }
    }
  });

  it('leaves the short links, the signed-in pages and the contract untranslated', () => {
    for (const route of ['c', 'u', 'dashboard', 'settings', 'design', 'privacy', 'tos']) {
      expect(Object.keys(ROUTE_SLUGS), `${route} should keep one name`).not.toContain(route);
    }
  });
});

describe('a translated url is served, and the english one under a prefix is not', () => {
  it('rewrites every translated slug onto its route folder', async () => {
    const rules = await rewrites();

    for (const [route, byLocale] of Object.entries(ROUTE_SLUGS)) {
      for (const [locale, slug] of Object.entries(byLocale as Record<string, string>)) {
        const find = (source: string) => rules.find((rule) => rule.source === source);

        expect(find(`/${locale}/${slug}`)?.destination).toBe(`/${locale}/${route}`);
        expect(find(`/${locale}/${slug}/:path*`)?.destination).toBe(`/${locale}/${route}/:path*`);
      }
    }
  });

  it('redirects the english slug under a prefix to the translated one', async () => {
    const rules = await redirects();

    for (const [route, byLocale] of Object.entries(ROUTE_SLUGS)) {
      for (const [locale, slug] of Object.entries(byLocale as Record<string, string>)) {
        expect(rules.find((rule) => rule.source === `/${locale}/${route}`)).toMatchObject({
          destination: `/${locale}/${slug}`,
          permanent: true
        });
      }
    }
  });
});

/**
 * The 404 for an unmatched url is composed by next at the routing level, not by
 * `not-found.tsx`, and only while the flag is on. Turn the flag off and the page
 * is still there, still correct, and never reached — which reads exactly like a
 * working 404 until somebody types a wrong url.
 */
describe('the global 404 is wired up, not merely written', () => {
  it('keeps the flag that makes next use it at all', () => {
    expect(nextConfig.experimental?.globalNotFound).toBe(true);
  });

  it('has the file the flag points at', async () => {
    const { existsSync } = await import('fs');

    expect(existsSync(new URL('../src/app/global-not-found.tsx', import.meta.url))).toBe(true);
  });

  // it bypasses the layout, so nothing else brings the stylesheet or the fonts
  it('mounts its own styles, fonts and dictionary, because no layout runs', async () => {
    const { readFileSync } = await import('fs');
    const source = readFileSync(
      new URL('../src/app/global-not-found.tsx', import.meta.url),
      'utf8'
    );

    expect(source).toContain('globals.css');
    expect(source).toContain('@/fonts');
    expect(source).toContain('I18nProvider');
    expect(source).toContain('<html');
  });
});
