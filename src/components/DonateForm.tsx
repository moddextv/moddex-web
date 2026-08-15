'use client';

import { FormEvent, useState } from 'react';
import { startCheckout } from '@/actions/checkout';
import { useAction } from '@/hooks/useAction';
import { getStripe } from '@/utils/stripe';
import { Mark } from '@/components/UI/Mark';
import { logger } from '@/misc/Logger';

export const DonateForm = () => {
  const [stripeFailed, setStripeFailed] = useState(false);

  const checkout = useAction(startCheckout, {
    onSuccess: async ({ id }) => {
      const stripe = await getStripe();
      const { error } = await stripe!.redirectToCheckout({ sessionId: id });

      if (error) {
        logger.error(error.message);
        setStripeFailed(true);
      }
    }
  });

  const loading = checkout.pending;
  const failed = checkout.error || stripeFailed;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStripeFailed(false);

    void checkout.run();
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
          We couldn&apos;t reach Stripe, so nothing was charged. Try again in a moment.
        </p>
      )}
    </form>
  );
};
