'use server';

import Stripe from 'stripe';
import { auth } from '@/auth';
import { asLocale, localePath } from '@/i18n/locales';
import { serverConfig } from '@/serverConfig';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';

const stripe = new Stripe(serverConfig.stripe.secretKey);

/**
 * `locale` decides where stripe sends the donor back, so it is clamped by
 * asLocale rather than trusted: this argument crosses from the browser into a
 * url stripe will redirect to, and anything but a locale we ship has no
 * business there. An unknown value reads as english, which is the old behaviour.
 */
export async function startCheckout(locale?: string): Promise<ActionResult<{ id: string }>> {
  return attempt('startCheckout', async () => {
    const session = await auth();
    const twitchUsername = session?.user?.login ?? '';
    const back = (path: string) => `${serverConfig.baseUrl}${localePath(asLocale(locale), path)}`;

    const checkout = await stripe.checkout.sessions.create({
      line_items: [{ price: serverConfig.stripe.donation.price, quantity: 1 }],
      submit_type: 'donate',
      mode: 'payment',
      success_url: `${back('/donate/success')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: back('/donate'),
      metadata: { twitchUsername }
    });

    return { id: checkout.id };
  });
}
