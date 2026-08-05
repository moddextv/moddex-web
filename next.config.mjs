/** @type {import('next').NextConfig} */
const nextConfig = {
  // emits .next/standalone with only the traced runtime deps, which is what the
  // docker runner stage copies. without it the image carries all of node_modules.
  output: 'standalone',
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-cdn.jtvnw.net'
      }
    ]
  }
};

export default nextConfig;
