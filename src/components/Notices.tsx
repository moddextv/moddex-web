'use client';

import { useI18n } from '@/i18n';
import { Facts, Good, StatePage, Status } from '@/components/PageState';
import { OptOutEffect } from '@/components/OptOutPromise';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { FC } from 'react';

export const OptedOut: FC<{ username: string }> = ({ username }) => {
  const { t, rich } = useI18n();

  return (
    <StatePage>
      <div className="flex items-center gap-3 mb-4">
        <span className="corner corner-tl text-mod" aria-hidden="true" />
        <p className="text-ui text-primary-400">{t('notices.optedOut.kicker')}</p>
      </div>

      <h1 className="text-h1 mb-4">{t('notices.optedOut.heading')}</h1>
      <p className="text-lead text-primary-300 max-w-prose mb-8">
        {rich(
          'notices.optedOut.body',
          {
            name: (chunk) => <span className="text-primary-100 font-bold break-all">{chunk}</span>
          },
          { username }
        )}{' '}
        <OptOutEffect /> {t('notices.optedOut.after')}
      </p>

      <Facts
        rows={[
          { label: t('notices.optedOut.profileServed'), value: t('notices.optedOut.no') },
          { label: t('notices.optedOut.inLists'), value: t('notices.optedOut.no') },
          { label: t('notices.optedOut.fromApi'), value: t('notices.optedOut.no') },
          {
            label: t('notices.optedOut.moderates'),
            value: <Good>{t('notices.optedOut.stillIndexed')}</Good>
          }
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <LocaleLink href="/channel" className="btn">
          {t('notices.optedOut.lookUp')}
        </LocaleLink>
        <LocaleLink href="/settings" className="btn btn-soft">
          {t('notices.optedOut.optOutYourself')}
        </LocaleLink>
      </div>

      <p className="text-ui text-primary-400 mt-8">
        <Status code={403} />
      </p>
    </StatePage>
  );
};

export const TeamOnly: FC<{ login?: string }> = ({ login }) => {
  const { t } = useI18n();

  return (
    <StatePage>
      <p className="text-meta text-primary-400 mb-2.5">{t('notices.teamOnly.kicker')}</p>
      <h1 className="text-h1 mb-4">{t('notices.teamOnly.heading')}</h1>
      <p className="text-lead text-primary-300 max-w-prose mb-8">
        {t('notices.teamOnly.body', { as: login ? t('notices.teamOnly.as', { login }) : '' })}
      </p>

      <div className="flex flex-wrap gap-3">
        <LocaleLink href="/" className="btn">
          {t('notices.teamOnly.home')}
        </LocaleLink>
        <LocaleLink href="/settings" className="btn btn-soft">
          {t('notices.teamOnly.settings')}
        </LocaleLink>
      </div>

      <p className="text-ui text-primary-400 mt-8">
        <Status code={403} />
      </p>
    </StatePage>
  );
};

export const NoCheckout: FC = () => {
  const { t } = useI18n();

  return (
    <StatePage>
      <h1 className="text-h1 mb-4">{t('notices.noCheckout.heading')}</h1>
      <p className="text-lead text-primary-300 max-w-prose mb-8">{t('notices.noCheckout.body')}</p>

      <div className="flex flex-wrap gap-3">
        <LocaleLink href="/donate" className="btn">
          {t('notices.noCheckout.donate')}
        </LocaleLink>
        <LocaleLink href="/" className="btn btn-soft">
          {t('notices.noCheckout.home')}
        </LocaleLink>
      </div>

      <p className="text-ui text-primary-400 mt-8">
        <Status code={404} />
      </p>
    </StatePage>
  );
};
