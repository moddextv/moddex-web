'use client';

import { FC } from 'react';

import { SearchBox, type Scope } from '@/components/Search/SearchBox';

const COPY: Record<Scope, { placeholder: string; label: string }> = {
  channel: { placeholder: 'forsen', label: 'Look up a Twitch channel' },
  user: { placeholder: 'nymn', label: 'Look up a Twitch account' }
};

export const PageSearch: FC<{ scope: Scope }> = ({ scope }) => (
  <SearchBox scope={scope} size="hero" className="mt-6 max-w-xl" {...COPY[scope]} />
);
