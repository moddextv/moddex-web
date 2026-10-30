'use server';

import Stripe from 'stripe';
import { auth } from '@/auth';
import { asLocale, localePath } from '@/i18n/locales';
import { serverConfig } from '@/serverConfig';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { isAmount } from '@/misc/donationTiers';

const stripe = new Stripe(serverConfig.stripe.secretKey);

let product: string | null = null;

// every amount is booked against the one donation product the configured price belongs to
const donationProduct = async (): Promise<string> => {
  if (product) return product;

  const price = await stripe.prices.retrieve(serverConfig.stripe.donation.price);
  product = typeof price.product === 'string' ? price.product : price.product.id;

  return product;
};

/**
 * `locale` decides where stripe sends the donor back, so it is clamped by
 * asLocale rather than trusted: this argument crosses from the browser into a
 * url stripe will redirect to, and anything but a locale we ship has no
 * business there. An unknown value reads as english, which is the old behaviour.
 */
export async function startCheckout(
  locale: string | undefined,
  amountCents: number
): Promise<ActionResult<{ url: string }>> {
  return attempt('startCheckout', async () => {
    if (!isAmount(amountCents)) throw new Error(`refusing a donation of ${amountCents} cents`);

    const session = await auth();
    const twitchUsername = session?.user?.login ?? '';
    const back = (path: string) => `${serverConfig.baseUrl}${localePath(asLocale(locale), path)}`;

    const checkout = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product: await donationProduct()
          },
          quantity: 1
        }
      ],
      submit_type: 'donate',
      mode: 'payment',
      success_url: `${back('/donate/success')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: back('/donate'),
      metadata: { twitchUsername }
    });

    if (!checkout.url) throw new Error('stripe returned a checkout session without a url');

    return { url: checkout.url };
  });
}
