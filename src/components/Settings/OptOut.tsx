'use client';

import { Switch } from '@heroui/react';
import { FC, useState } from 'react';
import { setIgnoredUser } from '@/actions/userIgnoreState';

interface OptOutProps {
  initialIsIgnored: boolean;
}

export const OptOut: FC<OptOutProps> = ({ initialIsIgnored }) => {
  const [isIgnored, setIsIgnored] = useState(initialIsIgnored);
  const [loading, setLoading] = useState(false);

  const handleIgnoreToggle = async () => {
    setLoading(true);

    try {
      await setIgnoredUser(!isIgnored);
      setIsIgnored(!isIgnored);
    } finally {
      setLoading(false);
    }
  };

  return (
    // a switch rather than a checkbox: this is a persistent on/off setting that
    // saves immediately, not something you tick as part of a form.
    //
    // the colour is explicit because heroui's default is color="primary", and
    // `primary` in this palette is the neutral grey ramp rather than an accent
    // -- a checked control came out #55555F on a near-black background, which
    // is why it read as broken. mod green is the ui's affirmative colour.
    <Switch
      size="lg"
      isSelected={isIgnored}
      isDisabled={loading}
      onChange={handleIgnoreToggle}
      classNames={{
        wrapper:
          'bg-primary-700 group-data-[selected=true]:bg-mod',
        thumb: 'bg-primary-100',
        label: 'text-primary-100'
      }}
    >
      opt-out
    </Switch>
  );
};
