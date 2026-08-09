'use client';

import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getStripe } from '@/utils/stripe';
import { Mark } from '@/components/UI/Mark';
import { logger } from '@/misc/Logger';

/**
 * the checkout hand-off. one button, because there is one amount.
 *
 * the disabled state says "Opening Stripe" rather than "processing", which is
 * both true and less alarming: nothing has been charged yet and the reader is
 * about to be sent to a different site. an error puts the button back rather
 * than leaving it spinning forever.
 */
export const DonateForm = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFailed(false);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitchUsername: session?.user?.login || '' })
      });

      const { id, error } = await response.json();

      if (error) {
        logger.error(error);
        setLoading(false);
        setFailed(true);
        return;
      }

      const stripe = await getStripe();
      const { error: stripeError } = await stripe!.redirectToCheckout({
        sessionId: id
      });

      if (stripeError) {
        logger.error(stripeError.message);
        setLoading(false);
        setFailed(true);
      }
    } catch (error) {
      logger.error(error);
      setLoading(false);
      setFailed(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={loading}
        className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Mark size={15} className="animate-pulse" />
            Opening Stripe
          </>
        ) : (
          'Continue to Stripe'
        )}
      </button>

      {failed && (
        <p className="text-ui text-vip mt-3">
          Stripe could not be reached, so nothing was charged. Try again in a moment.
        </p>
      )}
    </form>
  );
};
