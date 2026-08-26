import { asLocale } from '@/i18n/locales';
import { getRich, getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { LocaleLink } from '@/components/UI/LocaleLink';
import Stripe from 'stripe';
import { config } from '@/config';
import { serverConfig } from '@/serverConfig';
import { Metadata } from 'next';
import { CheckoutUnreadable } from '@/components/Errors';
import { NoCheckout } from '@/components/Notices';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { Mark } from '@/components/UI/Mark';
import { logger } from '@/misc/Logger';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';
import { CSSProperties, FC, ReactNode } from 'react';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    alternates: alternatesFor('/donate/success', locale),
    title: t('success.metaTitle'),
    robots: { index: false, follow: false }
  };
};

const stripe = new Stripe(serverConfig.stripe.secretKey);

const Row: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
    <span className="text-ui text-primary-400">{label}</span>
    {children}
  </div>
);

export default async function SuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id: string }>;
}) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const rich = getRich(locale);
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return <NoCheckout />;
  }

  let session;
  let paymentIntent;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    paymentIntent = session.payment_intent as Stripe.PaymentIntent;
  } catch (error) {
    logger.error('error fetching session:', error);
    return <CheckoutUnreadable />;
  }

  const claimed = session?.metadata?.twitchUsername || '';
  let login = isUsername(claimed) ? claimed : '';

  if (login) {
    try {
      const { user: donor } = await getUser(login);
      if (donor?.login) login = donor.login;
    } catch (error) {
      logger.warn(`could not resolve ${login} for a receipt, using the checkout value`, error);
    }
  }

  const reference = paymentIntent?.id ?? '';
  const amount = session.amount_total ?? null;
  const currency = (session.currency ?? 'usd').toUpperCase();

  const amountText = amount ? t.money(amount, currency) : null;

  if (!login) {
    return (
      <main id="main" className="flex-grow">
        <Container>
          <section className="enter pt-12 pb-6 max-w-3xl">
            <div className="flex items-center gap-3.5 mb-5">
              <Mark size={26} split />
              <span className="text-ui text-primary-400">{t('success.settled')}</span>
            </div>

            <h1 className="text-h1 mb-3">{t('success.noLogin.heading')}</h1>
            <p className="text-lead text-primary-300 max-w-prose mb-6">
              {t('success.noLogin.body')}
            </p>

            <div className="panel flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
              <div className="min-w-0">
                <p className="text-meta text-primary-400 mb-1.5">
                  {t('success.noLogin.reference')}
                </p>
                <code className="text-base text-primary-100 break-all select-all">
                  {reference || t('success.noLogin.notReturned')}
                </code>
              </div>
              <a
                href={config.brand.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-soft shrink-0"
              >
                {t('success.noLogin.askDiscord')}
              </a>
            </div>
          </section>
        </Container>
      </main>
    );
  }

  return (
    <main id="main" className="flex-grow">
      <Container>
        <section className="enter pt-12 pb-6 max-w-3xl">
          <div className="flex items-center gap-3.5 mb-5">
            <Mark size={26} split />
            <span className="text-ui text-primary-400">{t('success.settled')}</span>
          </div>

          <h1 className="text-h1 mb-4">{t('success.heading')}</h1>
          <p className="text-lead text-primary-300 max-w-prose mb-8">
            {rich(
              'success.body',
              {
                login: (chunk) => <span className="text-primary-100 font-bold">{chunk}</span>
              },
              { brandName: config.brand.name, login }
            )}
          </p>

          <div className="panel-flush mb-6">
            <div className="rows">
              {amountText && (
                <Row label={t('success.amount')}>
                  <span className="text-base font-bold tabular">{amountText}</span>
                </Row>
              )}

              <Row label={t('success.badgeGranted')}>
                <span className="flex items-center gap-2.5">
                  <Image
                    src="/badges/donator.svg"
                    alt={t('badges.alt', { name: t('badges.donator') })}
                    width={18}
                    height={18}
                    radius="sm"
                  />
                  <span className="text-base font-bold">{t('badges.donator')}</span>
                </span>
              </Row>

              <Row label={t('success.assignedTo')}>
                <span className="text-base font-bold">{login}</span>
              </Row>

              <Row label={t('success.receipt')}>
                <span className="text-ui text-primary-300">{t('success.emailed')}</span>
              </Row>

              {reference && (
                <Row label={t('success.reference')}>
                  <span className="text-ui text-primary-300 select-all break-all">{reference}</span>
                </Row>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <LocaleLink href={`/user/${login}`} className="btn">
              {t('success.seeProfile')}
            </LocaleLink>
            <LocaleLink href="/settings" className="btn btn-soft">
              {t('success.pickBadge')}
            </LocaleLink>
          </div>
        </section>

        <section className="enter pb-4 max-w-3xl" style={{ '--i': 1 } as CSSProperties}>
          <div className="panel flex items-start gap-4">
            <Image
              src="/badges/top_donator.svg"
              alt={t('badges.alt', { name: t('badges.topDonator') })}
              width={42}
              height={42}
              radius="sm"
              className="shrink-0"
            />
            <div>
              <p className="text-base font-bold mb-1">{t('badges.topDonator')}</p>
              <p className="text-ui text-primary-300 leading-relaxed max-w-prose">
                {t('badges.topDonatorBody')}
              </p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
