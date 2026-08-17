'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Image } from '@/components/UI/Image';
import { SearchIcon } from '@/components/Icons';
import { findAccount, flagAccountAsBot, listBots, unflagAccountAsBot } from '@/actions/bots';
import { listAdmins, makeAdmin, removeAdmin } from '@/actions/admins';
import {
  grantUserBadge,
  listBadgeCounts,
  listBadgeHolders,
  revokeUserBadge
} from '@/actions/badges';
import { useAction } from '@/hooks/useAction';
import { formatDayMonthYear } from '@/utils/format';
import type { Badge } from '@/misc/badges';
import type { User } from '@/misc/account';
import { toAdminRow, toBotRow, toHolderRow, visibleRows, type Row } from './accounts';

type Kind = 'admins' | 'bots' | 'badge' | 'twitch';

// twitch decides these three, so they are a count rather than a roster
const KINDS: Record<string, Kind> = {
  admin: 'admins',
  bot: 'bots',
  affiliate: 'twitch',
  partner: 'twitch',
  staff: 'twitch'
};

const SOURCES: Record<string, string> = {
  affiliate: 'twitch',
  partner: 'twitch',
  staff: 'twitch',
  donator: 'the donations',
  'top donator': 'the donations',
  booster: 'discord boosts'
};

const kindOf = (badge: string): Kind => KINDS[badge] ?? 'badge';

const Avatar: FC<{ src: string | null; name: string }> = ({ src, name }) =>
  src ? (
    <Image
      src={src}
      alt={name}
      width={28}
      height={28}
      radius="full"
      className="w-7 h-7 bg-primary-700 shrink-0"
    />
  ) : (
    <span className="avatar w-7 h-7 text-micro shrink-0" aria-hidden="true">
      ?
    </span>
  );

export const BadgeManager: FC<{ catalogue: Badge[]; counts: Record<string, number> }> = ({
  catalogue,
  counts: initialCounts
}) => {
  const [counts, setCounts] = useState(initialCounts);
  const [selected, setSelected] = useState(catalogue[0]?.name ?? '');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [add, setAdd] = useState('');
  const [found, setFound] = useState<User | null>(null);
  const [looked, setLooked] = useState(false);

  const kind = kindOf(selected);

  const load = useCallback(async (name: string) => {
    const which = kindOf(name);

    if (which === 'twitch') return [];
    if (which === 'admins') {
      const result = await listAdmins();
      return result.ok ? result.data.map(toAdminRow) : [];
    }
    if (which === 'bots') {
      const result = await listBots();
      return result.ok ? result.data.map(toBotRow) : [];
    }

    const result = await listBadgeHolders(name);
    return result.ok ? result.data.map(toHolderRow) : [];
  }, []);

  useEffect(() => {
    let live = true;

    void load(selected).then((next) => {
      if (live) setRows(next);
    });

    return () => {
      live = false;
    };
  }, [selected, load]);

  const reload = async () => {
    setRows(await load(selected));
    setAdd('');
    setFound(null);
    setLooked(false);

    const fresh = await listBadgeCounts();
    if (fresh.ok) setCounts(fresh.data);
  };

  const lookup = useAction(findAccount, {
    onSuccess: (account) => {
      setFound(account);
      setLooked(true);
    }
  });

  // useAction freezes the function it is given on the first render, so the badge
  // travels as an argument rather than inside a closure
  const grantBadge = useAction(grantUserBadge, { onSuccess: reload });
  const revokeBadge = useAction(revokeUserBadge, { onSuccess: reload });
  const promote = useAction(makeAdmin, { onSuccess: reload });
  const demote = useAction(removeAdmin, { onSuccess: reload });
  const flag = useAction(flagAccountAsBot, { onSuccess: reload });
  const unflag = useAction(unflagAccountAsBot, { onSuccess: reload });

  const give = (userId: string) =>
    void (kind === 'admins'
      ? promote.run(userId)
      : kind === 'bots'
        ? flag.run(userId)
        : grantBadge.run(userId, selected));

  const take = (userId: string) =>
    void (kind === 'admins'
      ? demote.run(userId)
      : kind === 'bots'
        ? unflag.run(userId)
        : revokeBadge.run(userId, selected));

  const writes = [grantBadge, revokeBadge, promote, demote, flag, unflag];
  const busy = lookup.pending || writes.some((one) => one.pending);
  const term = query.trim().toLowerCase();

  const matched = useMemo(() => visibleRows(rows, term, true), [rows, term]);
  const shown = useMemo(() => visibleRows(rows, term, showAll), [rows, term, showAll]);

  const already = found ? rows.some((row) => row.userId === found.id) : false;
  const error = lookup.error ?? writes.map((one) => one.error).find(Boolean) ?? null;

  const pick = (name: string) => {
    setSelected(name);
    setQuery('');
    setShowAll(false);
    setAdd('');
    setFound(null);
    setLooked(false);
  };

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <span className="corner corner-tl text-mod" aria-hidden="true" />
        <h2 className="text-h2">Badges</h2>
        <span className="ml-auto text-ui text-primary-400">
          who holds what, and who may hand it out
        </span>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-5">
        {catalogue.map((one) => {
          const active = one.name === selected;
          const count = counts[one.name] ?? 0;

          return (
            <button
              key={one.id}
              type="button"
              onClick={() => pick(one.name)}
              className={`flex items-center gap-2 h-10 px-3 rounded-md border transition-colors ${
                active
                  ? 'border-primary-300 bg-primary-800'
                  : 'border-primary-700 hover:border-primary-600'
              }`}
            >
              <Image
                src={one.svg}
                alt={`The ${one.name} badge`}
                width={18}
                height={18}
                radius="sm"
              />
              <span className={active ? 'text-ui font-bold' : 'text-ui text-primary-300'}>
                {one.name}
              </span>
              <span className="text-micro text-primary-400">{count.toLocaleString('en-US')}</span>
            </button>
          );
        })}
      </div>

      {kind === 'twitch' ? (
        <p className="text-read text-primary-300 max-w-prose px-4 pb-5">
          <span className="font-bold">{selected}</span> comes from twitch and is written by the
          sweep, so it is a count rather than a roster:{' '}
          <span className="font-bold">{(counts[selected] ?? 0).toLocaleString('en-US')}</span>{' '}
          accounts. Nobody can hand it out here, and listing a million of them would answer nothing.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap px-4 pb-4">
            <label className="search w-full sm:w-72">
              <SearchIcon size={16} color="text-primary-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Filter the ${selected} list`}
                aria-label={`Filter the ${selected} list`}
                autoComplete="off"
              />
            </label>

            <label className="search w-full sm:w-72">
              <SearchIcon size={16} color="text-primary-400" />
              <input
                value={add}
                onChange={(event) => {
                  setAdd(event.target.value);
                  setFound(null);
                  setLooked(false);
                }}
                placeholder="Add a Twitch name"
                aria-label={`Give somebody the ${selected} badge`}
                autoComplete="off"
              />
            </label>

            {add.trim() && !found && (
              <button
                type="button"
                className="btn btn-soft"
                disabled={busy}
                onClick={() => void lookup.run(add)}
              >
                Look up
              </button>
            )}

            {found && (
              <span className="flex items-center gap-2">
                <Avatar src={found.avatar} name={found.login} />
                <span className="text-base font-bold">{found.login}</span>
                {already ? (
                  <span className="text-ui text-primary-400">has it already</span>
                ) : (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() => give(found.id)}
                  >
                    Give {selected}
                  </button>
                )}
              </span>
            )}

            {looked && !found && (
              <span className="text-ui text-primary-400">no such twitch account</span>
            )}
          </div>

          {rows.length === 0 ? (
            <p className="text-read text-primary-300 max-w-prose px-4 pb-4">
              Nobody holds <span className="font-bold">{selected}</span> yet.
            </p>
          ) : (
            <div className="rows">
              <div className="row-head cols-badges">
                <span>Account</span>
                <span>Given by</span>
                <span>When</span>
                <span />
              </div>

              {shown.map((row) => (
                <div key={row.userId} className="row cols-badges">
                  <span className="flex items-center gap-3 min-w-0">
                    <Avatar src={row.avatar} name={row.login ?? row.userId} />
                    <span className="min-w-0">
                      <span className="text-base font-bold truncate">
                        {row.login ?? row.userId}
                      </span>
                      {row.owner && <span className="text-micro text-mod"> · owner</span>}
                      {row.ignored && <span className="text-micro text-vip"> · opted out</span>}
                      {row.known === false && (
                        <span className="text-micro text-primary-400"> · never fetched</span>
                      )}
                    </span>
                  </span>

                  <span className="text-ui text-primary-300 truncate">{row.byLogin ?? '—'}</span>

                  <span className="text-ui text-primary-300">
                    {row.at ? formatDayMonthYear(row.at) : '—'}
                  </span>

                  {row.owner ? (
                    <span className="text-micro text-primary-400 justify-self-end">protected</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost justify-self-end"
                      disabled={busy}
                      onClick={() => take(row.userId)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {matched.length > shown.length && (
                <button
                  type="button"
                  className="btn btn-ghost m-4"
                  onClick={() => setShowAll(true)}
                >
                  Show all {matched.length}
                </button>
              )}
            </div>
          )}

          {SOURCES[selected] && (
            <p className="text-read text-primary-300 max-w-prose px-4 py-4">
              {selected} is also written by {SOURCES[selected]}, so a hand grant holds until that
              runs again and decides otherwise.
            </p>
          )}
        </>
      )}

      {error && <p className="text-read text-vip px-4 pb-4">{error}</p>}
    </div>
  );
};
