import '@/styles/globals.css';
import { Metadata } from 'next';
import { UnknownPage } from '@/components/Errors';
import { I18nProvider } from '@/i18n/context';
import { dictionaryOf } from '@/i18n/dictionary';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { jetbrains, manrope } from '@/fonts';
import { Providers } from './[locale]/providers';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'not found | moddex'
};

/**
 * The 404 for a url that matches no route at all.
 *
 * `not-found.tsx` cannot serve this. Next composes it from the root layout, and
 * ours is `[locale]/layout.tsx` — a top-level dynamic segment, which its own
 * documentation names as the case `global-not-found` exists for. Composed the
 * other way it renders as a bare `__next_error__` document with the body only in
 * the rsc payload, so the page a visitor sees is blank until hydration.
 *
 * The cost is that this bypasses the layout: no header, no footer, and english
 * whatever the requested prefix said, because a url matching nothing carries no
 * locale to read. Styles, fonts and the theme have to be mounted here for the
 * same reason — the layout that normally does it never runs.
 */
export default async function GlobalNotFound() {
  const dictionary = dictionaryOf(DEFAULT_LOCALE);

  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${manrope.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased flex flex-col bg-primary-900 font-sans text-base text-primary-100">
        <I18nProvider locale={DEFAULT_LOCALE} dictionary={dictionary} fallback={dictionary}>
          <Providers>
            <Header locale={DEFAULT_LOCALE} />
            <UnknownPage />
            <Footer locale={DEFAULT_LOCALE} />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
