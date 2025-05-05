'use client';

import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getStripe } from '@/utils/stripe';
import { Button } from '@heroui/react';
import { HeartIcon } from '@/components/Icons';
import { logger } from '@/misc/Logger';

export const DonateForm = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const twitchUsername = session?.user?.login || '';

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ twitchUsername })
    });

    const { id, error } = await response.json();

    if (error) {
      logger.error(error);
      setLoading(false);
      return;
    }

    const stripe = await getStripe();
    const { error: stripeError } = await stripe!.redirectToCheckout({
      sessionId: id
    });

    if (stripeError) {
      logger.error(stripeError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        className="text-lg hover:bg-green-700 text-white"
        variant="bordered"
        color="success"
        radius="sm"
        size="lg"
        startContent={<HeartIcon size={22} />}
        isDisabled={loading}
      >
        {loading ? 'processing...' : 'donate with stripe'}
      </Button>
    </form>
  );
};
