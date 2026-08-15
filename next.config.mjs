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
   * Permanent, and both spellings, because moddex.tv/api/docs is what was
   * linked publicly and moddex.tv/docs is what people guess.
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
      }
    ];
  }
};

export default nextConfig;
