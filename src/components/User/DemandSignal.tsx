'use client';

import { FC, useEffect } from 'react';

import { signalDemand } from '@/actions/roleList';

export const DemandSignal: FC<{ channelId: string }> = ({ channelId }) => {
  useEffect(() => {
    void signalDemand(channelId);
  }, [channelId]);

  return null;
};
