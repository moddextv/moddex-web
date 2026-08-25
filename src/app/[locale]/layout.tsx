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
import { DEFAULT_LOCALE, isLocale, LOCALES } from '@/i18n/locales';
import { notFound } from 'next/navigation';
import { dictionaryOf } from '@/i18n/dictionary';
import { I18nProvider } from '@/i18n/context';

const manrope = localFont({
  src: [{ path: '../fonts/manrope-latin.woff2', weight: '200 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-manrope'
});

const jetbrains = localFont({
  src: [{ path: '../fonts/jetbrains-mono-latin.woff2', weight: '100 800', style: 'normal' }],
  display: 'swap',
  variable: '--font-jetbrains'
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
    url: config.brand.authorUrl
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

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const requested = (await params).locale;

  // an unknown first segment is a wrong url, not a locale to fall back from
  if (!isLocale(requested)) notFound();

  const locale = requested;

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-y-scroll antialiased flex flex-col bg-primary-900 font-sans text-base text-primary-100">
        <I18nProvider
          locale={locale}
          dictionary={dictionaryOf(locale)}
          fallback={dictionaryOf(DEFAULT_LOCALE)}
        >
          <Providers>
            <Insights />
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
