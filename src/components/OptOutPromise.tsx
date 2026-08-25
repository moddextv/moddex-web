'use client';

import { useI18n } from '@/i18n';
import { FC } from 'react';

// a client component so the server pages that state this promise can still
// render it without threading a locale through every one of them
export const OptOutEffect: FC = () => {
  const { rich } = useI18n();

  return <>{rich('optOut.effect', { em: (chunk) => <em>{chunk}</em> })}</>;
};

export const OptOutReversible: FC = () => {
  const { t } = useI18n();

  return <>{t('optOut.reversible')}</>;
};
