import '@/styles/globals.css';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Cairo, Lato } from 'next/font/google'; // Outfit ??
import React from 'react';
import { Providers } from './providers';
import { Metadata } from 'next';
import Tracking from '@/components/Tracking';

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
  metadataBase: new URL('https://modchecker.com'),
  title: {
    default: 'modchecker',
    template: '%s | modchecker'
  },
  description: 'modchecker.com - see tracked mods/vips of a twitch channel or see a list of channels a user has mod/vip privileges in',
  authors: {
    name: 'maersux',
    url: 'https://github.com/maersux'
  },
  keywords: ['modchecker', 'twitch', 'mods', 'vips', 'modlookup', 'viplookup', 'modscanner', 'twitch lookup tool', 'twitch user search', 'twitch channel search', 'Find twitch users', 'Find twitch channels', 'twitch user lookup', 'twitch channel lookup', 'twitch profile search', 'twitch profile lookup', 'discover twitch users', 'discover twitch channels', 'twitch username search', 'twitch username lookup', 'twitch streamer search', 'twitch streamer lookup'],
  openGraph: {
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://modchecker.com/modchecker.png',
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
    <body className="min-h-screen antialiased flex flex-col">
    <Providers>
      <Tracking />
      <Header />
      <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col gap-8">
        {children}
      </main>
      <Footer />
    </Providers>
    </body>
    </html>
  );
}
