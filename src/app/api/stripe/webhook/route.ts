import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { logger } from '@/misc/Logger';
import { donationExists, storeDonation } from '@/utils/donation';
import { getUser } from '@/utils/api/ivr';

/**
 * the source of truth for "a donation happened".
 *
 * it used to be /donate/success: the row was written while *rendering* that
 * page, so a donor who closed the tab after paying got no row and no badge,
 * and a render is the wrong place for a mutation regardless. that page is now
 * read-only and this endpoint owns the write.
 *
 * responses matter here -- stripe retries on any non-2xx for up to ~3 days:
 *   2xx  handled, or deliberately ignored (wrong event type, unpaid session)
 *   400  the request is not from stripe, or we cannot parse it -- never retry
 *   500  we failed to record a real payment -- please retry
 * returning 200 on a database failure would silently drop the donation, which
 * is the exact bug this endpoint exists to fix.
 */

// signature verification needs the byte-exact body, so nothing may parse or
// transform it first.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(config.stripe.secretKey);

const RELEVANT_EVENTS = new Set<string>([
  'checkout.session.completed',
  // card payments settle immediately; delayed methods (bank debits) land here
  // instead, sometimes days later.
  'checkout.session.async_payment_succeeded'
]);

export async function POST(request: NextRequest) {
  if (!config.stripe.webhookSecret) {
    // unsigned traffic must never be trusted, so refuse rather than degrade.
    logger.error(
      'stripe webhook called but STRIPE_WEBHOOK_SECRET is not configured'
    );
    return NextResponse.json(
      { error: 'webhook not configured' },
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
  } catch (error) {
    // bad signature or malformed body -- not from stripe, or replayed outside
    // the tolerance window. 400 so stripe stops trying.
    logger.error('stripe webhook signature verification failed:', error);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // a completed checkout is not necessarily a paid one.
  if (session.payment_status !== 'paid') {
    return NextResponse.json({
      received: true,
      ignored: `payment_status=${session.payment_status}`
    });
  }

  try {
    // stripe retries, and a donor can also be redirected while a retry is in
    // flight, so the write has to be idempotent. donationExists throws on a
    // database failure rather than reporting "no such row", which would let a
    // retry insert a second row for the same payment.
    if (await donationExists(session.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // the event payload carries payment_intent as a bare id; the charge id
    // lives on the expanded object.
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['payment_intent']
    });
    const paymentIntent = fullSession.payment_intent as Stripe.PaymentIntent | null;

    const twitchUsername = fullSession.metadata?.twitchUsername || '';
    const user = twitchUsername ? await getUser(twitchUsername) : null;

    await storeDonation({
      paymentId: fullSession.id,
      userId: user?.id || '',
      amount: fullSession.amount_total || 0,
      email: fullSession.customer_details?.email || '',
      name: fullSession.customer_details?.name || '',
      paymentIntentId: paymentIntent?.id || '',
      paymentStatus: fullSession.payment_status,
      chargeId: paymentIntent?.latest_charge?.toString() || ''
    });

    logger.info(
      `donation recorded from ${event.type}: session=${fullSession.id} user=${user?.id || 'unmatched'}`
    );

    return NextResponse.json({ received: true, recorded: true });
  } catch (error) {
    // a real payment we failed to record. 500 so stripe retries -- the
    // idempotency check above makes that safe.
    logger.error(
      `failed to record donation for session ${session.id}:`,
      error
    );
    return NextResponse.json({ error: 'failed to record' }, { status: 500 });
  }
}
