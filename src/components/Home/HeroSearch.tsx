'use client';

import { FC, useState } from 'react';

import { SearchBox, type Scope } from '@/components/Search/SearchBox';

const EXAMPLES: { scope: Scope; login: string }[] = [
  { scope: 'channel', login: 'forsen' },
  { scope: 'user', login: 'nymn' },
  { scope: 'user', login: 'nightbot' }
];

export const HeroSearch: FC = () => {
  const [scope, setScope] = useState<Scope>('channel');

  return (
    <div>
      <SearchBox scope={scope} onScope={setScope} size="hero" />

      <p className="mt-4 hidden sm:flex items-center gap-2.5 flex-wrap text-ui text-primary-400">
        <span>try</span>
        {EXAMPLES.map((example) => (
          <a
            key={`${example.scope}-${example.login}`}
            href={`/${example.scope}/${example.login}`}
            className="chip font-mono"
          >
            {example.login}
          </a>
        ))}
      </p>
    </div>
  );
};
