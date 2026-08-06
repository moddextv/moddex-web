import '@/styles/globals.css';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Cairo, Lato } from 'next/font/google';
import React from 'react';
import { Providers } from './providers';
import { Metadata } from 'next';
import Tracking from '@/components/Tracking';
import { config } from '@/config';

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  preload: true,
  variable: '--font-lato'
});

const cairo = Cairo({
  weight: ['700'],
  subsets: ['latin'],
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
    <html
      lang="en"
      className={`${cairo.variable} ${lato.variable}`}
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
