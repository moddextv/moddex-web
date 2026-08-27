import { Locale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { signIn } from '@/auth';
import { Facts, Good, StatePage } from '@/components/PageState';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { TwitchIcon } from '@/components/Icons';
import { config } from '@/config';
import { FC } from 'react';

interface SignInFailedProps {
  locale: Locale;
  error?: string;
  redirectTo?: string;
}

export const SignInFailed: FC<SignInFailedProps> = ({ locale, error, redirectTo }) => {
  const t = getTranslator(locale);
  const denied = error === 'AccessDenied';

  return (
    <StatePage>
      <h1 className="text-h1 mb-4">
        {denied ? t('errors.signIn.denied') : t('errors.signIn.heading')}
      </h1>
      <p className="text-lead text-primary-300 max-w-prose mb-8">
        {denied
          ? t('errors.signIn.deniedBody', { brandName: config.brand.name })
          : t('errors.signIn.body', { brandName: config.brand.name })}
      </p>

      <Facts
        rows={[
          { label: t('errors.signIn.signedIn'), value: t('errors.signIn.no') },
          {
            label: t('errors.signIn.account'),
            value: <Good>{t('errors.signIn.untouched')}</Good>
          },
          { label: t('errors.signIn.handedOver'), value: t('errors.signIn.nothingKept') },
          {
            label: t('errors.signIn.reported'),
            value: (
              <code className="text-ui text-vip font-semibold select-all break-all">
                {error || t('errors.couldNotRead')}
              </code>
            )
          }
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <form
          action={async () => {
            'use server';
            await signIn(
              'twitch',
              redirectTo ? { redirectTo: localePath(locale, redirectTo) } : undefined
            );
          }}
        >
          <button type="submit" className="btn btn-twitch">
            <TwitchIcon size={16} color="text-white" />
            {t('errors.signIn.tryAgain')}
          </button>
        </form>

        <LocaleLink href="/" className="btn btn-soft">
          {t('errors.signIn.browse')}
        </LocaleLink>
      </div>
    </StatePage>
  );
};
