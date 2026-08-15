import { config } from '@/config';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // a dashboard on this domain rather than a subdomain, so it reads as a page
        '/insights',
        '/dashboard',
        '/settings',
        '/donate/success',
        '/design',
        '/api/'
      ]
    },
    sitemap: `${config.brand.url}/sitemap.xml`,
    host: config.brand.url
  };
}
