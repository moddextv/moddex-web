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
// reason no arm64 image ever came out of CI and moddex.tv is running a
// hand-built local one. the files in ./fonts are the exact latin-subset woff2
// google was serving, so this is a like-for-like swap, not a redesign.
const lato = localFont({
  src: [
    { path: './fonts/lato-300.woff2', weight: '300', style: 'normal' },
    { path: './fonts/lato-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/lato-700.woff2', weight: '700', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-lato'
});

const cairo = localFont({
  src: [{ path: './fonts/cairo-700.woff2', weight: '700', style: 'normal' }],
  display: 'swap',
  variable: '--font-cairo'
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
  // 'modchecker' stays in the keyword list on purpose: it is the term the
  // existing audience will search for after the rename.
  keywords: [config.brand.name, 'modchecker', 'twitch', 'mods', 'vips', 'modlookup', 'viplookup', 'modscanner', 'twitch lookup tool', 'twitch user search', 'twitch channel search', 'Find twitch users', 'Find twitch channels', 'twitch user lookup', 'twitch channel lookup', 'twitch profile search', 'twitch profile lookup', 'discover twitch users', 'discover twitch channels', 'twitch username search', 'twitch username lookup', 'twitch streamer search', 'twitch streamer lookup'],
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

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    // `dark` is set here, server-side, on purpose. heroui emits its light
    // palette under `:root`, so an html element with no theme class renders
    // every heroui surface -- dropdown, tooltip, input, checkbox -- white on
    // this near-black page. next-themes only adds the class after hydration,
    // which made that the first paint for everyone and the permanent state for
    // anyone whose OS prefers light. the design is dark-only; there is no
    // toggle left to honour.
    <html
      lang="en"
      className={`dark ${cairo.variable} ${lato.variable}`}
      suppressHydrationWarning
    >
    <body className="min-h-screen overflow-y-scroll antialiased flex flex-col bg-primary-900">
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
