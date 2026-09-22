import { config } from '@/config';
import { LOCALES, localePath } from '@/i18n/locales';
import { LOCALIZED_SEGMENTS } from '@/i18n/routes.mjs';
import type { MetadataRoute } from 'next';

// a dashboard on this domain rather than a subdomain, so it reads as a page
const PRIVATE = ['/insights', '/dashboard', '/settings', '/donate/success', '/design', '/api/'];

// /u and /c redirect into the same profiles, so a list naming one needs both
const PROFILES = ['/user', '/channel', '/u', '/c'];

/**
 * Crawlers that walk the profile graph rather than reading the site. Profiles
 * are in no sitemap and a profile without roles is already noindex, so what
 * they collect is nothing this site asked to publish. Measured 2026-09-15:
 * ClaudeBot and Applebot together made 99 % of all traffic, ~17k requests an
 * hour, each url visited once, which is a full server render per request.
 */
const PROFILE_CRAWLERS = [
  'ClaudeBot',
  'Applebot',
  'PerplexityBot',
  'GPTBot',
  'Claude-SearchBot',
  'meta-externalagent',
  'Amazonbot',
  'ShapBot'
];

// an seo crawler brings no visitor, so it gets nothing at all
const BLOCKED_CRAWLERS = ['AhrefsBot'];

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

const expand = (paths: string[]): string[] => [...new Set(paths.flatMap(localized))];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: expand(PRIVATE)
      },
      // a named group replaces the wildcard one rather than adding to it
      {
        userAgent: PROFILE_CRAWLERS,
        disallow: expand([...PRIVATE, ...PROFILES])
      },
      {
        userAgent: BLOCKED_CRAWLERS,
        disallow: '/'
      }
    ],
    sitemap: `${config.brand.url}/sitemap.xml`,
    host: config.brand.url
  };
}
