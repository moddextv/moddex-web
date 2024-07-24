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
    console.error(error);
  }, [error]);

  return (
    <div className="text-center">
      <Title level={1} size="lg" mb="md">
        oops, something went wrong!
      </Title>
      <Button variant="solid" onClick={() => reset()}>
        try again
      </Button>
    </div>
  );
}
