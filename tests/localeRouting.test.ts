import { describe, expect, it } from 'vitest';
import nextConfig, { LOCALIZED_SEGMENTS } from '../next.config.mjs';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';

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
