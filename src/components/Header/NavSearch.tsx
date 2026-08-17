'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { SearchIcon } from '@/components/Icons';

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
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => setScope(routeScope), [routeScope]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const login = value.trim();
    if (!login) return;

    setValue('');
    setOpen(false);
    router.push(`/${scope}/${encodeURIComponent(login)}`);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className={clsx('btn btn-ghost w-10 px-0 shrink-0 ml-auto lg:hidden', open && 'invisible')}
      >
        <SearchIcon size={20} />
      </button>

      <form
        className={clsx(
          'search',
          open
            ? 'absolute inset-x-0 top-0 z-30 h-auto flex-col items-stretch gap-2 rounded-none border-x-0 border-t-0 p-3'
            : 'hidden lg:flex lg:flex-1 lg:max-w-[560px]'
        )}
        onSubmit={submit}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
        role="search"
      >
        <span className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-meta text-primary-400 shrink-0 hidden lg:inline">twitch.tv/</span>

          <input
            ref={input}
            type="text"
            name="username"
            className="text-base flex-1 min-w-0"
            placeholder={scope === 'user' ? 'nymn' : 'forsen'}
            aria-label={`Look up a Twitch ${scope === 'user' ? 'account' : 'channel'}`}
            maxLength={25}
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />

          {open ? (
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setOpen(false)}
              className="text-meta text-primary-400 shrink-0 px-2"
            >
              Cancel
            </button>
          ) : null}
        </span>

        <span
          className={clsx('scope', open && 'w-full [&>button]:flex-1')}
          role="group"
          aria-label="What to look up"
        >
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
              {option.label}
            </button>
          ))}
        </span>
      </form>
    </>
  );
};
