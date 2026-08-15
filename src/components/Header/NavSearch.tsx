'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FC, FormEvent, useEffect, useState } from 'react';
import clsx from 'clsx';

type Scope = 'channel' | 'user';

export const NavSearch: FC = () => {
  const router = useRouter();
  const pathname = usePathname() || '/';

  const routeScope: Scope =
    pathname === '/user' || pathname.startsWith('/user/') || pathname.startsWith('/u/')
      ? 'user'
      : 'channel';

  const [scope, setScope] = useState<Scope>(routeScope);
  const [value, setValue] = useState('');

  useEffect(() => setScope(routeScope), [routeScope]);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const login = value.trim();
    if (!login) return;

    setValue('');
    router.push(`/${scope}/${encodeURIComponent(login)}`);
  };

  return (
    <form className="search flex-1 max-w-[560px]" onSubmit={submit} role="search">
      <span className="text-meta text-primary-400 shrink-0 hidden sm:inline">twitch.tv/</span>

      <input
        type="text"
        name="username"
        className="text-base"
        placeholder={scope === 'user' ? 'nymn' : 'forsen'}
        aria-label={`Look up a Twitch ${scope === 'user' ? 'account' : 'channel'}`}
        maxLength={25}
        autoComplete="off"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <span className="scope" role="group" aria-label="What to look up">
        {(
          [
            { key: 'channel', label: 'Channel', corner: 'corner-tl', tone: 'text-mod' },
            { key: 'user', label: 'Account', corner: 'corner-br', tone: 'text-vip' }
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            aria-label={option.label}
            title={option.label}
            aria-pressed={scope === option.key}
            onClick={() => setScope(option.key)}
          >
            <span
              aria-hidden="true"
              className={clsx(
                'corner',
                option.corner,
                scope === option.key ? option.tone : 'text-primary-600'
              )}
            />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </span>
    </form>
  );
};
