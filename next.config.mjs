import { LOCALIZED_SEGMENTS, ROUTE_SLUGS } from './src/i18n/routes.mjs';

export { LOCALIZED_SEGMENTS, ROUTE_SLUGS };

// [locale, route, slug] for every route a language renames, and only those
const translated = Object.entries(ROUTE_SLUGS).flatMap(([route, byLocale]) =>
  Object.entries(byLocale).map(([locale, slug]) => [locale, route, slug])
);

// en is served unprefixed, so /en/... is a duplicate of a url that already exists
const localeRedirects = [
  { source: '/en', destination: '/', permanent: true },
  { source: '/en/:path*', destination: '/:path*', permanent: true },

  // and the english slug under a prefix is a second address for a page that has one
  ...translated.flatMap(([locale, route, slug]) => [
    { source: `/${locale}/${route}`, destination: `/${locale}/${slug}`, permanent: true },
    {
      source: `/${locale}/${route}/:path*`,
      destination: `/${locale}/${slug}/:path*`,
      permanent: true
    }
  ])
];

const localeRewrites = [
  { source: '/', destination: '/en' },
  ...LOCALIZED_SEGMENTS.flatMap((segment) => [
    { source: `/${segment}`, destination: `/en/${segment}` },
    { source: `/${segment}/:path*`, destination: `/en/${segment}/:path*` }
  ]),

  // the translated slug is what the reader sees; the route folder is english
  ...translated.flatMap(([locale, route, slug]) => [
    { source: `/${locale}/${slug}`, destination: `/${locale}/${route}` },
    { source: `/${locale}/${slug}/:path*`, destination: `/${locale}/${route}/:path*` }
  ])
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // the docker runner stage copies .next/standalone — without this it would
  // carry all of node_modules

  output: 'standalone',
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-cdn.jtvnw.net'
      }
    ]
  },

  /**
   * The api docs moved to api.moddex.tv/docs, which is the service that owns
   * the endpoints and the `@swagger` annotations describing them. Generating
   * them here stopped working at phase 2 — the annotations left with the routes,
   * so the page scanned an empty folder and published a document with no
   * endpoints in it, while still rendering as though it were fine.
   *
   * Permanent, and all three spellings, because moddex.tv/api/docs is what was
   * linked publicly and moddex.tv/docs and moddex.tv/api are what people guess.
   */
  async redirects() {
    return [
      {
        source: '/api/docs',
        destination: 'https://api.moddex.tv/docs',
        permanent: true
      },
      {
        source: '/docs',
        destination: 'https://api.moddex.tv/docs',
        permanent: true
      },
      {
        source: '/api',
        destination: 'https://api.moddex.tv/docs',
        permanent: true
      },
      ...localeRedirects
    ];
  },

  // beforeFiles, or /about would match the filesystem before it reaches the en tree
  async rewrites() {
    return { beforeFiles: localeRewrites, afterFiles: [], fallback: [] };
  }
};

export default nextConfig;
