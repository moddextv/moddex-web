import { config } from '@/config';
import { LOCALES, localePath } from '@/i18n/locales';
import { LOCALIZED_SEGMENTS } from '@/i18n/routes.mjs';
import type { MetadataRoute } from 'next';

// a dashboard on this domain rather than a subdomain, so it reads as a page
const PRIVATE = ['/insights', '/dashboard', '/settings', '/donate/success', '/design', '/api/'];

/**
 * The same page under three languages is three urls, and a crawler told about
 * one of them learns nothing about the other two. Only paths that actually
 * carry a locale are expanded: /insights and /api are served by something other
 * than a page, and naming a locale beside them is exactly what the allowlist in
 * routes.mjs exists to prevent.
 */
const localized = (path: string): string[] => {
  const segment = path.split('/')[1] ?? '';

  if (!LOCALIZED_SEGMENTS.includes(segment)) return [path];

  return LOCALES.map((locale) => localePath(locale, path));
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...new Set(PRIVATE.flatMap(localized))]
    },
    sitemap: `${config.brand.url}/sitemap.xml`,
    host: config.brand.url
  };
}
