import localFont from 'next/font/local';

// self-hosted on purpose: next/font/google is a build-time fetch, and it killed an image once
export const manrope = localFont({
  src: [{ path: './manrope-latin.woff2', weight: '200 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-manrope'
});

export const jetbrains = localFont({
  src: [{ path: './jetbrains-mono-latin.woff2', weight: '100 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-jetbrains'
});
