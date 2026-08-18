import { config } from '@/config';
import { BrowseAxis, browsePageCount, browsePagePath } from '@/misc/browsePages';
import { getStats } from '@/utils/api/moddex';
import { logger } from '@/misc/Logger';
import type { MetadataRoute } from 'next';

// counting the browse pages needs the api, so this must not be prerendered
export const dynamic = 'force-dynamic';

const PAGES = ['/', '/channel', '/user', '/donate', '/about', '/privacy', '/tos'];

const browsePaths = (axis: BrowseAxis, total: number): string[] => {
  const last = browsePageCount(total);
  const paths: string[] = [];

  for (let page = 1; page <= last; page++) paths.push(browsePagePath(axis, page));

  return paths;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let browse: string[] = [];

  try {
    const { channels, users } = await getStats();

    browse = [...browsePaths('channel', channels), ...browsePaths('user', users)];
  } catch (error) {
    logger.error('sitemap: listing the pages this site publishes without the browse pages', error);
  }

  return [...PAGES, ...browse].map((path) => ({ url: `${config.brand.url}${path}` }));
}
