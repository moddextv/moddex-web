'use client';

import { Facts, Good, ReloadButton, StatePage, Status } from '@/components/PageState';
import { PageSearch } from '@/components/Search/PageSearch';
import { config } from '@/config';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { useI18n } from '@/i18n/context';
import { FC } from 'react';

export const NotFoundUser: FC<{ username: string }> = ({ username }) => {
  const { t, rich } = useI18n();

  return (
    <StatePage>
      <h1 className="text-h1 mb-4">
        {rich(
          'errors.notFound.heading',
          {
            name: (chunk) => <span className="text-primary-400 break-all">{chunk}</span>
          },
          { username }
        )}
      </h1>
      <p className="text-lead text-primary-300 max-w-prose mb-6">{t('errors.notFound.body')}</p>

      <PageSearch scope="channel" />

      <div className="flex flex-wrap gap-3 mt-8">
        <LocaleLink href="/channel" className="btn">
          {t('errors.common.channels')}
        </LocaleLink>
        <LocaleLink href="/" className="btn btn-soft">
          {t('errors.common.home')}
        </LocaleLink>
      </div>

      <p className="text-ui text-primary-400 mt-8">
        <Status code={404}>{t('errors.notFound.untouched')}</Status>
      </p>
    </StatePage>
  );
};

export const InvalidUsername: FC<{ username: string }> = ({ username }) => {
  const { t, rich } = useI18n();

  return (
    <StatePage>
      <h1 className="text-h1 mb-4">
        {rich(
          'errors.invalid.heading',
          {
            name: (chunk) => <span className="text-primary-400 break-all">{chunk}</span>
          },
          { username }
        )}
      </h1>
      <p className="text-lead text-primary-300 max-w-prose mb-6">{t('errors.invalid.body')}</p>

      <PageSearch scope="channel" />

      <div className="flex flex-wrap gap-3 mt-8">
        <LocaleLink href="/channel" className="btn">
          {t('errors.common.channels')}
        </LocaleLink>
        <LocaleLink href="/" className="btn btn-soft">
          {t('errors.common.home')}
        </LocaleLink>
      </div>

      <p className="text-ui text-primary-400 mt-8">
        <Status code={404} />
      </p>
    </StatePage>
  );
};

export const UnknownPage: FC = () => {
  const { t } = useI18n();

  return (
    <StatePage>
      <h1 className="text-h1 mb-4">{t('errors.unknownPage.heading')}</h1>
      <p className="text-lead text-primary-300 max-w-prose mb-8">{t('errors.unknownPage.body')}</p>

      <div className="flex flex-wrap gap-3">
        <LocaleLink href="/" className="btn">
          {t('errors.common.home')}
        </LocaleLink>
        <LocaleLink href="/channel" className="btn btn-soft">
          {t('errors.common.channels')}
        </LocaleLink>
        <LocaleLink href="/user" className="btn btn-soft">
          {t('errors.common.accounts')}
        </LocaleLink>
        <LocaleLink href="/donate" className="btn btn-soft">
          {t('errors.common.donate')}
        </LocaleLink>
        <LocaleLink href="/docs" className="btn btn-soft">
          {t('errors.common.apiDocs')}
        </LocaleLink>
      </div>

      <p className="text-ui text-primary-400 mt-8">
        <Status code={404} />
      </p>
    </StatePage>
  );
};

export const BannedUser: FC<{ username: string; reason?: string }> = ({ username, reason }) => {
  const { t } = useI18n();
  const kind = reason?.toLowerCase();
  const banned = kind === 'tos_banned';
  const deactivated = kind === 'deactivated';

  return (
    <StatePage>
      <div className="flex items-start gap-5 mb-6">
        <span className="avatar w-16 h-16 text-xl" aria-hidden="true">
          {username.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h1 className="text-h1 mb-3 break-all">
            {banned && t('errors.banned.isBanned', { username })}
            {deactivated && t('errors.banned.isDeleted', { username })}
            {!banned && !deactivated && t('errors.banned.isUnavailable', { username })}
          </h1>
          <p className="text-lead text-primary-300 max-w-prose">
            {t('errors.banned.body', { brandName: config.brand.name })}
          </p>
        </div>
      </div>

      <Facts
        rows={[
          {
            label: t('errors.banned.reason'),
            value: (
              <span className="text-base font-bold text-primary-100">
                {reason ?? t('errors.banned.notGiven')}
              </span>
            )
          },
          {
            label: t('errors.banned.retained'),
            value: <Good>{t('errors.banned.stillIndexed')}</Good>
          },
          { label: t('errors.banned.shown'), value: t('errors.banned.noneShown') }
        ]}
      />

      <div className="flex flex-wrap gap-3">
        {banned && <ReloadButton>{t('errors.banned.checkAgain')}</ReloadButton>}
        <LocaleLink href="/channel" className={banned ? 'btn btn-soft' : 'btn'}>
          {t('errors.common.lookUp')}
        </LocaleLink>
      </div>

      {banned && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">{t('errors.banned.reversible')}</p>
      )}
      {deactivated && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">{t('errors.banned.sticks')}</p>
      )}
      {!banned && !deactivated && (
        <p className="text-ui text-primary-400 mt-6 max-w-prose">
          {t('errors.banned.unrecognized')}
        </p>
      )}
    </StatePage>
  );
};

export const CheckoutUnreadable: FC = () => {
  const { t } = useI18n();

  return (
    <StatePage>
      <h1 className="text-h1 mb-4">{t('errors.checkout.heading')}</h1>
      <p className="text-lead text-primary-300 max-w-prose mb-8">
        {t('errors.checkout.body', { brandName: config.brand.name })}
      </p>

      <Facts
        rows={[
          { label: t('errors.checkout.payment'), value: <Good>{t('errors.checkout.taken')}</Good> },
          {
            label: t('errors.checkout.receipt'),
            value: <Good>{t('errors.checkout.emailed')}</Good>
          },
          { label: t('errors.checkout.badge'), value: <Good>{t('errors.checkout.granted')}</Good> },
          {
            label: t('errors.checkout.thisPage'),
            value: (
              <span className="text-ui text-founder font-semibold">
                {t('errors.checkout.unreadable')}
              </span>
            )
          }
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <LocaleLink href="/settings" className="btn">
          {t('errors.checkout.checkProfile')}
        </LocaleLink>
        <a
          href={config.brand.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-soft"
        >
          {t('errors.checkout.askDiscord')}
        </a>
      </div>

      <p className="text-ui text-primary-400 mt-6 max-w-prose">
        {t('errors.checkout.byHand')} <Status code={400} />
      </p>
    </StatePage>
  );
};
