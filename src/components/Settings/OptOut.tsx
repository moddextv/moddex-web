'use client';

import { FC, useState } from 'react';
import { useT } from '@/i18n/context';
import { setIgnoredUser } from '@/actions/settings';
import { OptOutEffect, OptOutReversible } from '@/components/OptOutPromise';
import { useAction } from '@/hooks/useAction';

interface OptOutProps {
  initialIsIgnored: boolean;
}

export const OptOut: FC<OptOutProps> = ({ initialIsIgnored }) => {
  const t = useT();
  const [isIgnored, setIsIgnored] = useState(initialIsIgnored);
  const [saved, setSaved] = useState(false);

  const save = useAction(setIgnoredUser, {
    onSuccess: () => {
      setIsIgnored((current) => !current);
      setSaved(true);
    }
  });

  const { pending: loading, error: failed } = save;

  const toggle = () => {
    void save.run(!isIgnored);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:justify-between">
      <div className="max-w-prose">
        <p className="text-base font-bold mb-2">{t('optOutPanel.title')}</p>
        <p className="text-read text-primary-300 leading-relaxed">
          <OptOutEffect /> {t('optOut.modsUnaffected')} <OptOutReversible />
        </p>

        {saved && !failed && (
          <p className="flex items-center gap-3 text-read text-primary-200 mt-4">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            {isIgnored ? 'Saved. Your entry is hidden.' : 'Saved. Your entry is listed again.'}
          </p>
        )}

        {failed && (
          <p className="text-read text-vip mt-4" role="alert">
            {failed} Nothing changed.
          </p>
        )}
      </div>

      <label className="flex items-center gap-3.5 shrink-0 cursor-pointer">
        <span className={isIgnored ? 'text-ui text-primary-200' : 'text-ui text-primary-400'}>
          {isIgnored ? 'Hidden' : 'Listed'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isIgnored}
          aria-label={t('optOutPanel.title')}
          data-on={isIgnored}
          disabled={loading}
          onClick={toggle}
          className="toggle cursor-pointer disabled:opacity-60"
        >
          <span />
        </button>
      </label>
    </div>
  );
};
