import { config } from '@/config';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${config.brand.name} | Twitch mod, vip and founder lists`,
    short_name: config.brand.name,
    description: `Every channel a Twitch account holds mod, vip or founder in, and the day they got it.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b0c',
    theme_color: '#0b0b0c',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
}
