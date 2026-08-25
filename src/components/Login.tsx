import { signIn } from '@/auth';
import { Container } from '@/components/UI/Container';
import { TwitchIcon } from '@/components/Icons';
import { config } from '@/config';
import { OptOutEffect, OptOutReversible } from '@/components/OptOutPromise';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { Locale } from '@/i18n/locales';
import { getRich, getTranslator } from '@/i18n/dictionary';
import { FC, ReactNode } from 'react';

interface LoginProps {
  locale: Locale;
  heading?: string;
  blurb?: string;
  redirectTo?: string;
}

const Can: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <li className="flex gap-4">
    <span className="corner corner-tl text-mod mt-1.5" aria-hidden="true" />
    <span>
      <span className="block text-base font-bold mb-1">{title}</span>
      <span className="block text-ui text-primary-300 leading-relaxed">{children}</span>
    </span>
  </li>
);

const Scope: FC<{ label: string; granted: boolean; yes: string; never: string }> = ({
  label,
  granted,
  yes,
  never
}) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', minHeight: '44px' }}>
    <span className={granted ? 'text-base' : 'text-base text-primary-400'}>{label}</span>
    <span className={granted ? 'text-ui text-mod font-bold' : 'text-ui text-primary-400'}>
      {granted ? yes : never}
    </span>
  </div>
);

export const Login: FC<LoginProps> = ({ locale, heading, blurb, redirectTo }) => {
  const t = getTranslator(locale);
  const rich = getRich(locale);
  const yes = t('login.yes');
  const never = t('login.never');

  return (
    <main id="main" className="flex-grow">
      <Container>
        <section className="enter pt-16 pb-8 max-w-2xl">
          <h1 className="text-h1 mb-4 max-w-[20ch]">{heading ?? t('login.heading')}</h1>
          <p className="text-lead text-primary-300 max-w-prose mb-8">
            {blurb ?? t('login.blurb', { brandName: config.brand.name })}
          </p>

          <form
            action={async () => {
              'use server';
              await signIn('twitch', redirectTo ? { redirectTo } : undefined);
            }}
          >
            <button type="submit" className="btn btn-twitch">
              <TwitchIcon size={16} color="text-white" />
              {t('login.continue')}
            </button>
          </form>

          <p className="text-ui text-primary-400 mt-4">{t('login.landBack')}</p>
        </section>

        <section className="enter grid gap-6 md:grid-cols-2 pb-4">
          <div className="panel">
            <h2 className="text-h2 mb-5">{t('login.canDo')}</h2>
            <ul className="flex flex-col gap-5">
              <Can title={t('login.optOut')}>
                <OptOutEffect /> <OptOutReversible />
              </Can>
              <Can title={t('login.pickBadge')}>{t('login.pickBadgeBody')}</Can>
              <Can title={t('login.attachDonation')}>{t('login.attachDonationBody')}</Can>
            </ul>
          </div>

          <div className="panel-flush">
            <h2 className="text-h2 px-4 pb-5">{t('login.handsOver')}</h2>
            <div className="rows">
              <Scope label={t('login.scopes.userId')} granted yes={yes} never={never} />
              <Scope label={t('login.scopes.loginName')} granted yes={yes} never={never} />
              <Scope label={t('login.scopes.avatar')} granted yes={yes} never={never} />
              <Scope label={t('login.scopes.password')} granted={false} yes={yes} never={never} />
              <Scope label={t('login.scopes.chat')} granted={false} yes={yes} never={never} />
              <Scope label={t('login.scopes.behalf')} granted={false} yes={yes} never={never} />
            </div>
            <p className="text-ui text-primary-400 px-4 py-4">
              {rich('login.fullTerms', {
                link: (chunk) => (
                  <LocaleLink
                    href="/tos#accounts"
                    className="text-primary-200 font-semibold hover:underline"
                  >
                    {chunk}
                  </LocaleLink>
                )
              })}
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
};
