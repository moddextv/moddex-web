import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import Stripe from 'stripe';
import { config } from '@/config';
import { serverConfig } from '@/serverConfig';
import { Metadata } from 'next';
import { CheckoutUnreadable } from '@/components/Errors';
import { NoCheckout } from '@/components/Notices';
import { Container } from '@/components/UI/Container';
import { ThankYou } from '@/components/ThankYou';
import { Mark } from '@/components/UI/Mark';
import { logger } from '@/misc/Logger';
import { tierFor, tiersFrom } from '@/misc/donationTiers';
import { getBadges } from '@/utils/api/moddex/public';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';

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

export default async function SuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id: string }>;
}) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
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

  const catalogue = await getBadges().catch(() => []);
  const unlocked = amount
    ? tierFor(tiersFrom(catalogue, config.stripe.donation.default * 100, null), amount)
    : null;

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
    <ThankYou
      locale={locale}
      login={login}
      amountText={amountText}
      reference={reference}
      unlocked={unlocked}
    />
  );
}
