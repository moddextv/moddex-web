import { Metadata } from 'next';
import { UnknownPage } from '@/components/Errors';
import { Footer } from '@/components/Footer';
import { I18nProvider } from '@/i18n/context';
import { dictionaryOf } from '@/i18n/dictionary';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'not found'
};

/**
 * For a `notFound()` thrown by a page below. It renders OUTSIDE the layout that
 * threw, so it mounts its own provider and shell or it renders nothing at all —
 * which is what the blank 404 used to be.
 *
 * It must stay SYNCHRONOUS. An async not-found renders an empty document here,
 * with no error and nothing in the log, so `Header` cannot be used: it awaits
 * the session. `TRAPS.md` 237.
 */
export default function NotFoundPage() {
  const dictionary = dictionaryOf(DEFAULT_LOCALE);

  return (
    <div className="min-h-screen flex flex-col bg-primary-900 font-sans text-base text-primary-100">
      <I18nProvider locale={DEFAULT_LOCALE} dictionary={dictionary} fallback={dictionary}>
        <Providers>
          <UnknownPage />
          <Footer locale={DEFAULT_LOCALE} />
        </Providers>
      </I18nProvider>
    </div>
  );
}
