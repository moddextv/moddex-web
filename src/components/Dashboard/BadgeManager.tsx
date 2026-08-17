'use client';

import { FC, useState } from 'react';
import { Image } from '@/components/UI/Image';
import { SearchIcon } from '@/components/Icons';
import { findAccount } from '@/actions/bots';
import { grantUserBadge, revokeUserBadge } from '@/actions/badges';
import { useAction } from '@/hooks/useAction';
import type { Badge } from '@/misc/badges';
import type { User } from '@/misc/account';

const SOURCES: Record<string, string> = {
  affiliate: 'twitch',
  partner: 'twitch',
  staff: 'twitch',
  donator: 'donations',
  'top donator': 'donations',
  booster: 'discord boosts'
};

const ELSEWHERE: Record<string, string> = {
  admin: 'the admins tab',
  bot: 'the bot list'
};

export const BadgeManager: FC<{ catalogue: Badge[] }> = ({ catalogue }) => {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<User | null>(null);
  const [looked, setLooked] = useState(false);

  const lookup = useAction(findAccount, {
    onSuccess: (account) => {
      setFound(account);
      setLooked(true);
    }
  });

  const refetch = async () => {
    const again = await findAccount(query.trim().toLowerCase());

    if (again.ok) setFound(again.data);
  };

  const grant = useAction(grantUserBadge, { onSuccess: refetch });
  const revoke = useAction(revokeUserBadge, { onSuccess: refetch });

  const busy = grant.pending || revoke.pending || lookup.pending;
  const held = new Set((found?.badges ?? []).map((badge) => badge.name));

  const toggle = (name: string) => {
    if (!found || busy) return;

    void (held.has(name) ? revoke.run(found.id, name) : grant.run(found.id, name));
  };

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">Badges</h2>

        <label className="search ml-auto w-full sm:w-80">
          <SearchIcon size={16} color="text-primary-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setFound(null);
              setLooked(false);
            }}
            placeholder="A Twitch name"
            aria-label="Find an account to grant or revoke a badge"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="btn btn-soft"
          disabled={busy || !query.trim()}
          onClick={() => void lookup.run(query)}
        >
          Look up
        </button>
      </div>

      {looked && !found && (
        <p className="text-read text-primary-300 max-w-prose px-4 pb-4">
          There is no twitch account called {query.trim()}, or it has opted out.
        </p>
      )}

      {found && (
        <>
          <div className="flex items-center gap-3 flex-wrap px-4 pb-4">
            {found.avatar && (
              <Image
                src={found.avatar}
                alt={found.login}
                width={28}
                height={28}
                radius="full"
                className="w-7 h-7 bg-primary-700 shrink-0"
              />
            )}
            <span className="text-base font-bold truncate">{found.login}</span>
            <span className="text-ui text-primary-300 ml-auto">
              {found.discord ? 'discord linked' : 'no discord linked'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 px-4 py-4">
            {catalogue.map((badge) => {
              const owns = held.has(badge.name);
              const managed = ELSEWHERE[badge.name];

              return (
                <button
                  key={badge.id}
                  type="button"
                  disabled={busy || !!managed}
                  onClick={() => toggle(badge.name)}
                  title={
                    managed
                      ? `Managed on ${managed}`
                      : SOURCES[badge.name]
                        ? `Derived from ${SOURCES[badge.name]} — the next sync decides again`
                        : undefined
                  }
                  className={`flex items-center gap-2 h-10 px-3 rounded-md border transition-colors ${
                    owns
                      ? 'border-primary-300 bg-primary-800'
                      : 'border-primary-700 hover:border-primary-600'
                  } ${managed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Image
                    src={badge.svg}
                    alt={`The ${badge.name} badge`}
                    width={18}
                    height={18}
                    radius="sm"
                  />
                  <span className={owns ? 'text-ui font-bold' : 'text-ui text-primary-300'}>
                    {badge.name}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-read text-primary-300 max-w-prose px-4 pb-4">
            Every badge here is also written by something else: twitch, the donations or the discord
            boosts. Granting one by hand holds until that source runs again and decides otherwise.{' '}
            <span className="font-bold">admin</span> and <span className="font-bold">bot</span> are
            managed elsewhere and cannot be set here.
          </p>
        </>
      )}

      {(grant.error || revoke.error || lookup.error) && (
        <p className="text-read text-vip px-4 pb-4">
          {grant.error || revoke.error || lookup.error}
        </p>
      )}
    </div>
  );
};
