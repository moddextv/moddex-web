import Stripe from 'stripe';
import { config } from '@/config';
import { Metadata } from 'next';
import { BadRequest, NotFound } from '@/components/Errors';
import { Title } from '@/components/UI/Title';
import { logger } from '@/misc/Logger';
import { Image } from '@/components/UI/Image';
import { getUser } from '@/utils/api/ivr';
import { storeDonation, donationExists } from '@/utils/donation';

export const metadata: Metadata = {
  title: 'donation successful',
};

const stripe = new Stripe(config.stripe.secretKey);

export default async function SuccessPage({ searchParams }: { searchParams: { session_id: string } }) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return <NotFound message="no payment id found" />;
  }

  let session;
  let user;
  let paymentIntent;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const existingDonation = await donationExists(session.id);
    if (existingDonation) {
      return <BadRequest message="this donation has already been processed. thank you for your support!" />;
    }

    paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    user = await getUser(session?.metadata?.twitchUsername || '');

    await storeDonation({
      paymentId: session.id,
      userId: user?.id || '',
      amount: session.amount_total || 0,
      email: session.customer_details?.email || '',
      name: session.customer_details?.name || '',
      paymentIntentId: paymentIntent.id || '',
      paymentStatus: session.payment_status,
      chargeId: paymentIntent.latest_charge?.toString() || '',
    });

  } catch (error) {
    logger.error('error fetching session:', error);
    return <BadRequest message="failed to retrieve session details" />;
  }

  const paymentIntentId = paymentIntent.id || 0;
  const amount = session.amount_total ?? null;
  const amountText = amount ? ` of $${(amount / 100).toFixed(2)}` : '';

  return (
    <main className="container mx-auto max-w-3xl py-16 px-6 flex-grow flex flex-col gap-8">
      <div className="flex flex-col-reverse md:flex-row gap-4 items-center">
        <Image
          src="/peepoLove.png"
          alt="Thanks!"
          width={64}
          height={42}
          radius="none"
        />
        <Title className="uppercase">thank you!</Title>
      </div>
      <p className="text-lg">
        your donation{amountText} has been successfully processed. you&apos;ve earned the donator badge, proudly displayed next to your name!
      </p>

      {user?.login ? (
        <p className="text-lg">the badge has been added to your account with twitch username: <span className="font-bold">{user.login}</span>.</p>
      ) : (
        <div className="text-lg">
          <p>we could not determine your twitch username.</p>
          {paymentIntentId ? (
            <>
              <p className="mt-2">please join our <a href="https://discord.gg/modchecker" className="underline" target="_blank" rel="noopener noreferrer">discord</a> and open a support ticket.</p>
              <p>
                <span>provide the following payment id and your twitch username to help us resolve this issue and assign the donator badge to you:</span><br />
                <span className="mt-2 font-bold">payment id: <code>{paymentIntentId}</code></span>
              </p>
            </>
          ) : (
            <p className="mt-2">please join our <a href="https://discord.gg/modchecker" className="underline" target="_blank" rel="noopener noreferrer">discord</a> and open a
              support ticket.</p>
          )}
        </div>
      )}

      <div className="text-lg">
        want to stand out even more? the top contributor receives an exclusive, one-of-a-kind badge that only the most generous supporter can hold.{' '}
        <span className="inline-flex">
          <Image
            src="/badges/top_donator.png"
            alt="top donator badge"
            width={25}
            height={25}
            className="inline cursor-help"
          />
        </span>
      </div>
    </main>
  );
}
