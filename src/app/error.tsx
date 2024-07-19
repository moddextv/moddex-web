'use client';

import { Title } from '@/components/UI/Title';
import { useEffect } from 'react';
import { Button } from '@nextui-org/react';

export default function Error({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div className="text-center">
      <Title level={1} size="lg" mb="md">
        oops, something went wrong!
      </Title>
      <Button
        variant="solid"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        try again
      </Button>
    </div>
  );
}
