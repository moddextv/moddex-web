'use client';

import { Title } from '@/components/UI/Title';
import { useEffect } from 'react';
import { Button } from '@heroui/react';

export default function Error({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col items-center">
      <Title level={1} size="lg" mb="md">
        oops, something went wrong!
      </Title>
      <Button
        variant="solid"
        onClick={() => reset()}
      >
        try again
      </Button>
    </main>
  );
}
