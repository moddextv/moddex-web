'use client';

import { Checkbox } from '@heroui/react';
import { FC, useState } from 'react';
import { setIgnoredUser } from '@/actions/userIgnoreState';

interface OptOutProps {
  userId: string;
  initialIsIgnored: boolean;
}

export const OptOut: FC<OptOutProps> = ({ userId, initialIsIgnored }) => {
  const [isIgnored, setIsIgnored] = useState(initialIsIgnored);
  const [loading, setLoading] = useState(false);

  const handleIgnoreToggle = async () => {
    setLoading(true);

    try {
      await setIgnoredUser(userId, !isIgnored);
      setIsIgnored(!isIgnored);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Checkbox
      size="lg"
      isSelected={isIgnored}
      isDisabled={loading}
      onChange={handleIgnoreToggle}
    >
      opt-out
    </Checkbox>
  );
};
