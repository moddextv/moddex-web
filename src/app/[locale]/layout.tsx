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
import { UnknownPage } from '@/components/Errors';

/**
 * A layout may not export a static `metadata` here: the title, the description
 * and og:locale all depend on which language is being served, and a constant
 * would put english ones on every german page.
 */
export const generateMetadata = async ({ params }: LayoutProps): Promise<Metadata> => {
  const requested = (await params).locale;
  const locale = asLocale(requested);
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
    // a nonsense first segment renders the 404 body, so it must not be indexed
    robots: isLocale(requested)
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
        }
      : { index: false, follow: false },
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

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const requested = (await params).locale;

  const known = isLocale(requested);

  // withholding children is load-bearing: every page below reads its locale
  // through asLocale, which falls back silently, so /nonsense/user/maersux
  // would otherwise serve a real profile under a nonsense prefix
  const locale = known ? requested : DEFAULT_LOCALE;

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
            {known ? children : <UnknownPage />}
            <Footer locale={locale} />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
