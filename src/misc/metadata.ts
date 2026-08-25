import type { Metadata } from 'next';

import { config } from '@/config';
import { DEFAULT_LOCALE, Locale, LOCALES, localePath, ogLocale } from '@/i18n/locales';

export const SITE_CARD = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: `The ${config.brand.name} mark`
};

// next replaces openGraph wholesale rather than merging it, so every page restates this
export const openGraphFor = (
  url: string,
  locale: Locale = DEFAULT_LOCALE
): Metadata['openGraph'] => ({
  type: 'website',
  locale: ogLocale(locale),
  siteName: config.brand.name,
  images: [SITE_CARD],
  url: localePath(locale, url)
});

/**
 * A page's canonical has to carry its locale, or every translation declares
 * itself a duplicate of the english one and none of them is ever indexed.
 *
 * `languages` is what tells a crawler the set is a translation rather than
 * repeated content, and `x-default` points at the unprefixed default.
 */
export const alternatesFor = (
  url: string,
  locale: Locale = DEFAULT_LOCALE
): Metadata['alternates'] => ({
  canonical: localePath(locale, url),
  languages: {
    ...Object.fromEntries(LOCALES.map((entry) => [entry, localePath(entry, url)])),
    'x-default': localePath(DEFAULT_LOCALE, url)
  }
});

// the two together, since no page has ever wanted one without the other
export const pageMetadata = (url: string, locale: Locale = DEFAULT_LOCALE): Metadata => ({
  alternates: alternatesFor(url, locale),
  openGraph: openGraphFor(url, locale)
});
