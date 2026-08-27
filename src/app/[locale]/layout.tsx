import { asLocale, DEFAULT_LOCALE, isLocale, LOCALES, ogLocale } from '@/i18n/locales';
import { dictionaryOf, getTranslator } from '@/i18n/dictionary';
import { I18nProvider } from '@/i18n/context';
import '@/styles/globals.css';
import { SITE_CARD } from '@/misc/metadata';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header/Header';
import React from 'react';
import { Providers } from './providers';
import { Metadata } from 'next';
import { Insights } from '@/components/Insights';
import { config } from '@/config';
import { jetbrains, manrope } from '@/fonts';
import { notFound } from 'next/navigation';

/**
 * A layout may not export a static `metadata` here: the title, the description
 * and og:locale all depend on which language is being served, and a constant
 * would put english ones on every german page.
 */
export const generateMetadata = async ({ params }: LayoutProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    metadataBase: new URL(config.brand.url),
    title: {
      default: `${config.brand.name} | ${t('site.tagline')}`,
      template: `%s | ${config.brand.name}`
    },
    description: t('site.description', { brandName: config.brand.name }),
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
      locale: ogLocale(locale),
      siteName: config.brand.name,
      images: [SITE_CARD]
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
};

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// a first segment that is not a locale must miss the router entirely, or it
// reaches this layout and every page below reads it through a silent fallback
export const dynamicParams = false;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const requested = (await params).locale;

  // dynamicParams above should have stopped this; kept because every page below
  // reads its locale through asLocale, which falls back silently
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
