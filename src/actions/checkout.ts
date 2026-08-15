'use server';

import Stripe from 'stripe';
import { auth } from '@/auth';
import { serverConfig } from '@/serverConfig';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';

const stripe = new Stripe(serverConfig.stripe.secretKey);

export async function startCheckout(): Promise<ActionResult<{ id: string }>> {
  return attempt('startCheckout', async () => {
    const session = await auth();
    const twitchUsername = session?.user?.login ?? '';

    const checkout = await stripe.checkout.sessions.create({
      line_items: [{ price: serverConfig.stripe.donation.price, quantity: 1 }],
      submit_type: 'donate',
      mode: 'payment',
      success_url: `${serverConfig.baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${serverConfig.baseUrl}/donate`,
      metadata: { twitchUsername }
    });

    return { id: checkout.id };
  });
}
