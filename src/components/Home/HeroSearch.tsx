'use client';

import { FC } from 'react';

import { SearchBox } from '@/components/Search/SearchBox';

const EXAMPLES = ['forsen', 'nymn', 'nightbot'];

export const HeroSearch: FC = () => (
  <div>
    {/* channel view, because a profile carries both directions as tabs and this
        one is the small list — /user/nightbot is 590k rows to land on by typo */}
    <SearchBox
      scope="channel"
      placeholder="search a channel or account"
      label="Look up a Twitch channel or account"
    />

    <p className="mt-4 hidden sm:flex items-center gap-2.5 flex-wrap text-ui text-primary-400">
      <span>try</span>
      {EXAMPLES.map((login) => (
        <a key={login} href={`/channel/${login}`} className="chip font-mono">
          {login}
        </a>
      ))}
    </p>
  </div>
);
