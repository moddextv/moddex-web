import { config } from '@/config';
import type { MetadataRoute } from 'next';

// profiles are found by crawling, not listed here
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/channel', '/user', '/donate', '/about', '/privacy', '/tos'];

  return pages.map((path) => ({ url: `${config.brand.url}${path}` }));
}
