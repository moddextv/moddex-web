import '@/styles/globals.css';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import localFont from 'next/font/local';
import React from 'react';
import { Providers } from './providers';
import { Metadata } from 'next';
import Tracking from '@/components/Tracking';
import { config } from '@/config';

// self-hosted rather than `next/font/google` on purpose. that helper downloads
// the woff2 from fonts.gstatic.com during `next build`, which put a network
// call inside the docker build — and inside the emulated arm64 half of the
// cross-build it ran for 503 s and then died with a FetchError. that is the
// reason no arm64 image ever came out of CI.
//
// one file for the whole 400-800 range: manrope ships as a variable font and
// google serves the same latin woff2 for every weight in the request, so five
// weights are one 24 KB download. the range below is the font's real `wght`
// axis — naming a single weight would leave the browser to fake the other four.
//
// this is the only typeface. lato and cairo were removed once the port was
// complete: lato was loaded and applied to nothing, and cairo set headings in a
// face the v3 direction does not use.
const manrope = localFont({
  src: [{ path: './fonts/manrope-latin.woff2', weight: '200 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-manrope'
});

export const metadata: Metadata = {
  metadataBase: new URL(config.brand.url),
  title: {
    default: config.brand.name,
    template: `%s | ${config.brand.name}`
  },
  description: `${config.brand.domain} - the ultimate tool for exploring twitch mods and vips. discover information about moderators, vips, and user roles across twitch channels.`,
  authors: {
    name: 'maersux',
    url: 'https://github.com/maersux'
  },
  // no `keywords`. the meta keywords tag has been ignored by google since 2009
  // and is not read by search console either, so the list was cost without
  // benefit — and it was the last place the old brand name was asserted as
  // ours rather than described as history.
  openGraph: {
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${config.brand.url}/${config.brand.name}.png`,
        height: 128,
        width: 128
      }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `dark` is set here, server-side, on purpose. heroui emits its light
    // palette under `:root`, so an html element with no theme class renders
    // every heroui surface -- dropdown, tooltip, input, checkbox -- white on
    // this near-black page. next-themes only adds the class after hydration,
    // which made that the first paint for everyone and the permanent state for
    // anyone whose OS prefers light. the design is dark-only; there is no
    // toggle left to honour.
    <html lang="en" className={`dark ${manrope.variable}`} suppressHydrationWarning>
      {/* `font-sans` is the fix for the site having had no body typeface at all:
        lato was loaded and never applied, so every paragraph rendered in the
        browser default. `sans` now resolves to manrope in tailwind.config.mjs,
        and tailwind's preflight already puts it on <html>, so this is belt and
        braces rather than the only thing holding it up. */}
      <body className="min-h-screen overflow-y-scroll antialiased flex flex-col bg-primary-900 font-sans text-base text-primary-100">
        <Providers>
          <Tracking />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
