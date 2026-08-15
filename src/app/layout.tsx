import '@/styles/globals.css';
import { SITE_CARD } from '@/misc/metadata';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header/Header';
import localFont from 'next/font/local';
import React from 'react';
import { Providers } from './providers';
import { Metadata } from 'next';
import { Insights } from '@/components/Insights';
import { config } from '@/config';

const manrope = localFont({
  src: [{ path: './fonts/manrope-latin.woff2', weight: '200 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-manrope'
});

const DESCRIPTION = `Every channel a Twitch account holds mod, vip or founder in, and the day they got it. Twitch shows a broadcaster their own list. ${config.brand.name} keeps the other half.`;

export const metadata: Metadata = {
  metadataBase: new URL(config.brand.url),
  title: {
    default: `${config.brand.name} | Twitch mod, vip and founder lists`,
    template: `%s | ${config.brand.name}`
  },
  description: DESCRIPTION,
  applicationName: config.brand.name,
  authors: {
    name: 'maersux',
    url: 'https://github.com/maersux'
  },
  other: { 'darkreader-lock': 'true' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  },
  // no title or description here: they are inherited, and every page would share the home card
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: config.brand.name,
    images: [SITE_CARD]
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-screen overflow-y-scroll antialiased flex flex-col bg-primary-900 font-sans text-base text-primary-100">
        <Providers>
          <Insights />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
