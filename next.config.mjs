/**
 * Every top-level path that carries a locale, listed rather than excluded.
 *
 * A negative lookahead would be shorter and is exactly how the visitor counter
 * was lost once: a matcher meant to exclude something quietly caught the collect
 * endpoint, and the failure was invisible because the script still loaded. This
 * list cannot reach /insights, /api, /health, or any metadata file, because it
 * never mentions them. tests/localeRouting.test.ts pins that.
 */
export const LOCALIZED_SEGMENTS = [
  'about',
  'c',
  'channel',
  'dashboard',
  'design',
  'donate',
  'leaderboard',
  'privacy',
  'settings',
  'tos',
  'u',
  'user'
];

// en is served unprefixed, so /en/... is a duplicate of a url that already exists
const localeRedirects = [
  { source: '/en', destination: '/', permanent: true },
  { source: '/en/:path*', destination: '/:path*', permanent: true }
];

const localeRewrites = [
  { source: '/', destination: '/en' },
  ...LOCALIZED_SEGMENTS.flatMap((segment) => [
    { source: `/${segment}`, destination: `/en/${segment}` },
    { source: `/${segment}/:path*`, destination: `/en/${segment}/:path*` }
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
