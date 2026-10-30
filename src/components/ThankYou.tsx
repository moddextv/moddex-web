import { getRich, getTranslator } from '@/i18n/dictionary';
import type { Locale } from '@/i18n/locales';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { UnlockedDeck } from '@/components/UnlockedDeck';
import { config } from '@/config';
import type { Tier } from '@/misc/donationTiers';
import clsx from 'clsx';
import { CSSProperties, FC, ReactNode } from 'react';

interface ThankYouProps {
  locale: Locale;
  login: string;
  amountText: string | null;
  reference: string;
  unlocked: Tier | null;
}

const Row: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
    <span className="text-ui text-primary-400">{label}</span>
    {children}
  </div>
);

export const ThankYou: FC<ThankYouProps> = ({ locale, login, amountText, reference, unlocked }) => {
  const t = getTranslator(locale);
  const rich = getRich(locale);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-10 text-center">
          <div className="flex items-center justify-center gap-3.5 mb-5">
            <Mark size={26} split />
            <span className="text-ui text-primary-400">{t('success.settled')}</span>
          </div>

          <h1 className="text-h1 mb-4">{t('success.heading')}</h1>
          <p className="text-lead text-primary-300 max-w-prose mx-auto">
            {rich(
              'success.body',
              {
                login: (chunk) => <span className="text-primary-100 font-bold">{chunk}</span>
              },
              { brandName: config.brand.name, login }
            )}
          </p>
        </header>

        <section
          className={clsx(
            'enter grid items-center gap-10 pb-6 max-w-4xl mx-auto',
            unlocked && 'md:grid-cols-2'
          )}
          style={{ '--i': 1 } as CSSProperties}
        >
          {unlocked && <UnlockedDeck badges={unlocked.badges} login={login} />}

          <div>
            <div className="panel-flush mb-6">
              <div className="rows">
                {amountText && (
                  <Row label={t('success.amount')}>
                    <span className="text-base font-bold tabular">{amountText}</span>
                  </Row>
                )}

                <Row label={t('success.assignedTo')}>
                  <span className="text-base font-bold">{login}</span>
                </Row>

                <Row label={t('success.receipt')}>
                  <span className="text-ui text-primary-300">{t('success.emailed')}</span>
                </Row>

                {reference && (
                  <Row label={t('success.reference')}>
                    <span className="text-ui text-primary-300 select-all break-all">
                      {reference}
                    </span>
                  </Row>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {unlocked && (
                <LocaleLink href="/settings" className="btn">
                  {t('success.wearOne')}
                </LocaleLink>
              )}
              <LocaleLink href={`/user/${login}`} className={unlocked ? 'btn btn-soft' : 'btn'}>
                {t('success.seeProfile')}
              </LocaleLink>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
};
