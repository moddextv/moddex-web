'use client';

import { useI18n } from '@/i18n/context';
import { getRich, getTranslator } from '@/i18n/dictionary';
import { Locale } from '@/i18n/locales';
import { FC } from 'react';

interface PromiseProps {
  locale?: Locale;
}

// a client component so the server pages that state this promise can still
// render it without threading a locale through every one of them. `locale`
// overrides that for the legal pages, which are english whatever you read in
export const OptOutEffect: FC<PromiseProps> = ({ locale }) => {
  const context = useI18n();
  const rich = locale ? getRich(locale) : context.rich;

  return <>{rich('optOut.effect', { em: (chunk) => <em>{chunk}</em> })}</>;
};

export const OptOutReversible: FC<PromiseProps> = ({ locale }) => {
  const context = useI18n();
  const t = locale ? getTranslator(locale) : context.t;

  return <>{t('optOut.reversible')}</>;
};
