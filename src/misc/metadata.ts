import type { Metadata } from 'next';

import { config } from '@/config';

export const SITE_CARD = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: `The ${config.brand.name} mark`
};

// next replaces openGraph wholesale rather than merging it, so every page restates this
export const openGraphFor = (url: string): Metadata['openGraph'] => ({
  type: 'website',
  locale: 'en_US',
  siteName: config.brand.name,
  images: [SITE_CARD],
  url
});
