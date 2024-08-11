import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { InternalServerError } from '@/app/api/ApiErrors';

const stripe = new Stripe(config.stripe.secretKey);

export async function POST(request: NextRequest) {
  const { twitchUsername } = await request.json();

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1PmcThP72WL1q5FjHGRRGdty',
          quantity: 1,
        },
      ],
      submit_type: 'donate',
      mode: 'payment',
      success_url: `${config.baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.baseUrl}/donate`,
      metadata: {
        twitchUsername: twitchUsername || '',
      }
    });
    return NextResponse.json({ id: session.id });
  } catch (error) {
    return InternalServerError((error as Error).message);
  }
}
