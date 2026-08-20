'use client';

import { FC, useState } from 'react';
import Link from 'next/link';

import { SearchIcon } from '@/components/Icons';
import { checkMembership } from '@/actions/dashboard';
import { useAction } from '@/hooks/useAction';
import { formatDayMonthYear } from '@/utils/format';
import type { Membership } from '@/utils/api/moddex';

const ROLES = [
  { key: 'mod', label: 'Mod' },
  { key: 'vip', label: 'Vip' },
  { key: 'founder', label: 'Founder' }
] as const;

type Asked = { login: string; channel: string };

const Result: FC<{ asked: Asked; held: Membership }> = ({ asked, held }) => {
  const any = ROLES.some(({ key }) => held[key]);

  return (
    <div className="px-4 pb-5">
      <p className="text-read pb-3">
        <Link href={`/user/${asked.login}`} className="font-bold underline">
          {asked.login}
        </Link>{' '}
        {any ? 'holds' : 'holds nothing'} in{' '}
        <Link href={`/channel/${asked.channel}`} className="font-bold underline">
          {asked.channel}
        </Link>
      </p>

      <div className="flex flex-wrap gap-2">
        {ROLES.map(({ key, label }) => {
          const on = held[key];

          return (
            <span
              key={key}
              className={`chip ${on ? 'text-base' : 'text-primary-400 opacity-60'}`}
              aria-label={`${label}: ${on ? 'held' : 'not held'}`}
            >
              <span className={on ? `text-${key}` : undefined}>{on ? '●' : '○'}</span>
              {label}
              {on?.grantedAt ? (
                <span className="text-micro text-primary-400">
                  {formatDayMonthYear(on.grantedAt)}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const QuickCheck: FC = () => {
  const [login, setLogin] = useState('');
  const [channel, setChannel] = useState('');
  const [asked, setAsked] = useState<Asked | null>(null);
  const [held, setHeld] = useState<Membership | null>(null);

  const check = useAction(checkMembership, {
    onSuccess: (data) => setHeld(data)
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!login.trim() || !channel.trim()) return;

    setHeld(null);
    setAsked({ login: login.trim().toLowerCase(), channel: channel.trim().toLowerCase() });
    void check.run(login, channel);
  };

  return (
    <div className="panel-flush">
      <div className="px-4 pt-5 pb-4">
        <h2 className="text-h2">Quick check</h2>
      </div>

      <form onSubmit={submit} className="flex items-center gap-3 flex-wrap px-4 pb-4">
        <label className="search w-full sm:w-56">
          <SearchIcon size={16} color="text-primary-400" />
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="account"
            aria-label="Account login"
            autoComplete="off"
          />
        </label>

        <span className="text-ui text-primary-400">in</span>

        <label className="search w-full sm:w-56">
          <SearchIcon size={16} color="text-primary-400" />
          <input
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            placeholder="channel"
            aria-label="Channel login"
            autoComplete="off"
          />
        </label>

        <button
          type="submit"
          className="btn btn-soft"
          disabled={check.pending || !login.trim() || !channel.trim()}
        >
          {check.pending ? 'Checking…' : 'Check'}
        </button>
      </form>

      {check.error ? (
        <p className="text-read text-primary-300 px-4 pb-5">
          {check.code === 'opted out' ? 'That account has opted out of being listed.' : check.error}
        </p>
      ) : null}

      {held && asked ? <Result asked={asked} held={held} /> : null}
    </div>
  );
};
