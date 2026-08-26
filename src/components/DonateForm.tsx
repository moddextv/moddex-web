'use client';

import { useI18n } from '@/i18n/context';
import { FormEvent, useState } from 'react';
import { startCheckout } from '@/actions/checkout';
import { useAction } from '@/hooks/useAction';
import { getStripe } from '@/utils/stripe';
import { Mark } from '@/components/UI/Mark';
import { logger } from '@/misc/Logger';

export const DonateForm = () => {
  const { t, locale } = useI18n();
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

    void checkout.run(locale);
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
            {t('donate.opening')}
          </>
        ) : (
          t('donate.continue')
        )}
      </button>

      {failed && <p className="text-ui text-vip mt-3">{t('donate.stripeUnreachable')}</p>}
    </form>
  );
};
