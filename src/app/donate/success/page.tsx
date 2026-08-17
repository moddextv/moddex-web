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
import { LOCALE } from '@/utils/format';
import Link from 'next/link';
import { CSSProperties, FC, ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: '/donate/success' },
  title: 'Thank you',
  robots: { index: false, follow: false }
};

const stripe = new Stripe(serverConfig.stripe.secretKey);

const Row: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
    <span className="text-ui text-primary-400">{label}</span>
    {children}
  </div>
);

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
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

  const amountText = amount
    ? new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(amount / 100)
    : null;

  if (!login) {
    return (
      <main id="main" className="flex-grow">
        <Container>
          <section className="enter pt-12 pb-6 max-w-3xl">
            <div className="flex items-center gap-3.5 mb-5">
              <Mark size={26} split />
              <span className="text-ui text-primary-400">Payment settled</span>
            </div>

            <h1 className="text-h1 mb-3">The payment worked. The badge needs one more step.</h1>
            <p className="text-lead text-primary-300 max-w-prose mb-6">
              Stripe didn&apos;t pass back a Twitch username, so there&apos;s no profile to put the
              badge on. Send us the reference below plus your Twitch name and we&apos;ll assign it
              by hand.
            </p>

            <div className="panel flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
              <div className="min-w-0">
                <p className="text-meta text-primary-400 mb-1.5">Payment reference</p>
                <code className="text-base text-primary-100 break-all select-all">
                  {reference || 'not returned by Stripe'}
                </code>
              </div>
              <a
                href={config.brand.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-soft shrink-0"
              >
                Ask on Discord
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
            <span className="text-ui text-primary-400">Payment settled</span>
          </div>

          <h1 className="text-h1 mb-4">Thank you, genuinely</h1>
          <p className="text-lead text-primary-300 max-w-prose mb-8">
            Donations are the only thing keeping {config.brand.name} free to read, and there&apos;s
            no paid tier waiting in the wings. The donator badge is on{' '}
            <span className="text-primary-100 font-bold">{login}</span> already, and it&apos;ll show
            up next to your name everywhere {config.brand.name} prints it.
          </p>

          <div className="panel-flush mb-6">
            <div className="rows">
              {amountText && (
                <Row label="Amount">
                  <span className="text-base font-bold tabular">{amountText}</span>
                </Row>
              )}

              <Row label="Badge granted">
                <span className="flex items-center gap-2.5">
                  <Image
                    src="/badges/donator.svg"
                    alt="The donator badge"
                    width={18}
                    height={18}
                    radius="sm"
                  />
                  <span className="text-base font-bold">donator</span>
                </span>
              </Row>

              <Row label="Assigned to">
                <span className="text-base font-bold">{login}</span>
              </Row>

              <Row label="Receipt">
                <span className="text-ui text-primary-300">Emailed by Stripe</span>
              </Row>

              {reference && (
                <Row label="Reference">
                  <span className="text-ui text-primary-300 select-all break-all">{reference}</span>
                </Row>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/user/${login}`} className="btn">
              See it on your profile
            </Link>
            <Link href="/settings" className="btn btn-soft">
              Pick a chat badge
            </Link>
          </div>
        </section>

        <section className="enter pb-4 max-w-3xl" style={{ '--i': 1 } as CSSProperties}>
          <div className="panel flex items-start gap-4">
            <Image
              src="/badges/top_donator.svg"
              alt="The top donator badge"
              width={42}
              height={42}
              radius="sm"
              className="shrink-0"
            />
            <div>
              <p className="text-base font-bold mb-1">top donator</p>
              <p className="text-ui text-primary-300 leading-relaxed max-w-prose">
                Held by exactly one account at a time, whoever has given the most. It moves when
                somebody passes you.
              </p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
