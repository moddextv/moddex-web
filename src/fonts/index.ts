import localFont from 'next/font/local';

/**
 * Self-hosted, and they have to stay that way: next/font/google is a fetch at
 * build time, which is what killed the emulated arm64 image once.
 *
 * These are build inputs rather than public assets — next/font subsets them,
 * hashes them and emits the @font-face itself. Serving them from public/ would
 * mean hand-writing that and losing the preload with it.
 */

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
