import { FC } from 'react';
import { DEFAULT_LOCALE, Locale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';

// the contract stays in one language, so every other locale says so rather than
// leaving the reader to assume the page simply was not translated yet
export const LegalLanguageNotice: FC<{ locale: Locale }> = ({ locale }) => {
  if (locale === DEFAULT_LOCALE) return null;

  const t = getTranslator(locale);

  return (
    <aside className="panel mb-8" role="note">
      <div className="flex items-center gap-3 mb-2.5">
        <span className="corner corner-tl text-vip" aria-hidden="true" />
        <strong className="text-ui font-semibold">{t('legal.englishOnly.title')}</strong>
      </div>
      <p className="text-primary-300 max-w-prose">{t('legal.englishOnly.body')}</p>
    </aside>
  );
};
