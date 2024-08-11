import { Stripe, loadStripe } from '@stripe/stripe-js';
import { config } from '@/config';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripe.publishableSecretKey);
  }
  return stripePromise;
};