import Stripe from 'stripe';
import { config } from '@/config';
import { Metadata } from 'next';
import { CheckoutUnreadable, NoCheckout } from '@/components/Errors';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { Mark } from '@/components/UI/Mark';
import { logger } from '@/misc/Logger';
import { getUser } from '@/utils/api/ivr';
import Link from 'next/link';
import { CSSProperties, FC, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Thank you',
  // this page only exists directly after a checkout, and its content is a
  // specific person's payment. keeping it out of the index is the point.
  robots: { index: false, follow: false }
};

const stripe = new Stripe(config.stripe.secretKey);

const Row: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
    <span className="text-ui text-primary-400">{label}</span>
    {children}
  </div>
);

/**
 * two states, and which one you get depends on whether Stripe handed back a
 * twitch login the site could resolve.
 *
 * deliberately read-only. the donation is recorded by the webhook on
 * api.moddex.tv, which fires whether or not the donor ever lands here. writing
 * on render meant a closed tab lost the row and the badge, and Stripe's
 * redirect can arrive before, after, or never.
 */
export default async function SuccessPage({
  searchParams
}: {
  searchParams: { session_id: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return <NoCheckout />;
  }

  let session;
  let user;
  let paymentIntent;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    user = await getUser(session?.metadata?.twitchUsername || '');
  } catch (error) {
    logger.error('error fetching session:', error);
    return <CheckoutUnreadable />;
  }

  const reference = paymentIntent?.id ?? '';
  const amount = session.amount_total ?? null;
  const currency = (session.currency ?? 'usd').toUpperCase();
  const amountText = amount ? `$${(amount / 100).toFixed(2)} ${currency}` : null;
  const login = user?.login;

  // stripe redirected but the checkout metadata carried no resolvable twitch
  // login, so there is no profile to put the badge on. the payment is fine; the
  // page says so first and asks for one thing afterwards.
  if (!login) {
    return (
      <main id="main" className="flex-grow">
        <Container>
          <section className="enter pt-12 pb-6 max-w-3xl">
            <div className="flex items-center gap-3.5 mb-5">
              <Mark size={26} split />
              <span className="text-ui text-primary-400">Payment settled</span>
            </div>

            <h1 className="text-h1 mb-3">
              The payment worked. The badge needs one more step.
            </h1>
            <p className="text-lead text-primary-300 max-w-prose mb-6">
              Stripe did not pass back a twitch username, so there is no profile
              to put the badge on. Send the reference below plus your twitch name
              and it gets assigned by hand.
            </p>

            <div className="panel flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
              <div className="min-w-0">
                <p className="text-meta text-primary-400 mb-1.5">
                  Payment reference
                </p>
                <code className="text-base text-primary-100 break-all select-all">
                  {reference || 'not returned by Stripe'}
                </code>
              </div>
              <a
                href={`mailto:${config.brand.email}?subject=${encodeURIComponent(`${config.brand.name} donator badge`)}`}
                className="btn btn-soft shrink-0"
              >
                Email {config.brand.email}
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

          {/* no exclamation mark, and no "thanks for your support" above a
              button that had not been pressed, which is what the old /donate
              opened with. the thanks belong here, once. */}
          <h1 className="text-h1 mb-4">Thank you, genuinely</h1>
          <p className="text-lead text-primary-300 max-w-prose mb-8">
            Donations are the only thing keeping {config.brand.name} free to
            read, and there is no paid tier waiting in the wings. The donator
            badge is on <span className="text-primary-100 font-bold">{login}</span>{' '}
            already and will show up next to your name everywhere{' '}
            {config.brand.name} prints it.
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
                    src="/badges/donator.png"
                    alt=""
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
                  <span className="text-ui text-primary-300 select-all break-all">
                    {reference}
                  </span>
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
              src="/badges/top_donator.png"
              alt="The top donator badge"
              width={42}
              height={42}
              radius="sm"
              className="shrink-0"
            />
            <div>
              <p className="text-base font-bold mb-1">top donator</p>
              <p className="text-ui text-primary-300 leading-relaxed max-w-prose">
                Held by exactly one account at a time, whoever has given the
                most. It moves when somebody passes you.
              </p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
