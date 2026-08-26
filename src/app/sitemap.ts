import { config } from '@/config';
import { BrowseAxis, browsePageCount, browsePagePath } from '@/misc/browsePages';
import { DEFAULT_LOCALE, localePath, LOCALES } from '@/i18n/locales';
import { getStats } from '@/utils/api/moddex/public';
import { logger } from '@/misc/Logger';
import type { MetadataRoute } from 'next';

// counting the browse pages needs the api, so this must not be prerendered
export const dynamic = 'force-dynamic';

const PAGES = ['/', '/channel', '/user', '/leaderboard', '/donate', '/about', '/privacy', '/tos'];

const browsePaths = (axis: BrowseAxis, total: number): string[] => {
  const last = browsePageCount(total);
  const paths: string[] = [];

  for (let page = 1; page <= last; page++) paths.push(browsePagePath(axis, page));

  return paths;
};

const absolute = (locale: string, path: string) =>
  `${config.brand.url}${localePath(locale as never, path)}`;

/**
 * Google wants every language version listed as its own entry, each carrying the
 * whole set of alternates including itself. Listing only the english url with
 * the others hanging off it is the shape that reads as complete and is not: it
 * announces the translations without offering them a place in the index.
 *
 * Until 2026-08-26 this file emitted the english tree alone, so `/de/rangliste`
 * could only be found by crawling an english page and following the hreflang in
 * its head. That works, and it is slower than saying so here.
 */
const entries = (path: string): MetadataRoute.Sitemap => {
  const languages = {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, absolute(locale, path)])),
    'x-default': absolute(DEFAULT_LOCALE, path)
  };

  return LOCALES.map((locale) => ({ url: absolute(locale, path), alternates: { languages } }));
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let browse: string[] = [];

  try {
    const { channels, users } = await getStats();

    browse = [...browsePaths('channel', channels), ...browsePaths('user', users)];
  } catch (error) {
    logger.error('sitemap: listing the pages this site publishes without the browse pages', error);
  }

  return [...PAGES, ...browse].flatMap(entries);
}
