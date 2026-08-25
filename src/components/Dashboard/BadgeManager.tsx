'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/context';
import Link from 'next/link';
import { Badges } from '@/components/User/Badges';
import { Image } from '@/components/UI/Image';
import { SearchIcon } from '@/components/Icons';
import { flagAccountAsBot, listBots, unflagAccountAsBot } from '@/actions/bots';
import { makeAdmin, removeAdmin } from '@/actions/admins';
import {
  grantUserBadge,
  listBadgeCounts,
  listBadgeHolders,
  revokeUserBadge
} from '@/actions/badges';
import { useAction } from '@/hooks/useAction';
import { formatDayMonthYear } from '@/utils/format';
import type { Badge } from '@/misc/badges';
import { toBotRow, toHolderRow, visibleRows, type Row } from './accounts';
import { SOURCES, kindOf } from './badgeRouting';

// a bot flagged before anybody looked it up has an id and no login, and there is
// no profile behind an id
const Name: FC<{ login: string | null; fallback?: string }> = ({ login, fallback }) =>
  login ? (
    <Link href={`/channel/${login}`} className="row-name text-base font-bold truncate">
      {login}
    </Link>
  ) : (
    <span className="text-base font-bold truncate">{fallback}</span>
  );

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

export const BadgeManager: FC<{ catalogue: Badge[]; counts: Record<string, number | null> }> = ({
  catalogue,
  counts: initialCounts
}) => {
  const t = useT();
  const [counts, setCounts] = useState(initialCounts);
  const [selected, setSelected] = useState(catalogue[0]?.name ?? '');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const kind = kindOf(selected);

  const load = useCallback(async (name: string) => {
    const which = kindOf(name);

    if (which === 'twitch') return [];
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

    const fresh = await listBadgeCounts();
    if (fresh.ok) setCounts(fresh.data.counts);
  };

  // useAction freezes the function it is given on the first render, so the badge
  // travels as an argument rather than inside a closure
  const grantBadge = useAction(grantUserBadge, { onSuccess: reload });
  const revokeBadge = useAction(revokeUserBadge, { onSuccess: reload });
  const promote = useAction(makeAdmin, { onSuccess: reload });
  const demote = useAction(removeAdmin, { onSuccess: reload });
  const flag = useAction(flagAccountAsBot, { onSuccess: reload });
  const unflag = useAction(unflagAccountAsBot, { onSuccess: reload });

  const take = (userId: string) =>
    void (kind === 'admins'
      ? demote.run(userId)
      : kind === 'bots'
        ? unflag.run(userId)
        : revokeBadge.run(userId, selected));

  const writes = [grantBadge, revokeBadge, promote, demote, flag, unflag];
  const busy = writes.some((one) => one.pending);
  const term = query.trim().toLowerCase();

  const matched = useMemo(() => visibleRows(rows, term, true), [rows, term]);
  const shown = useMemo(() => visibleRows(rows, term, showAll), [rows, term, showAll]);

  const error = writes.map((one) => one.error).find(Boolean) ?? null;

  const pick = (name: string) => {
    setSelected(name);
    setQuery('');
    setShowAll(false);
  };

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <span className="corner corner-tl text-mod" aria-hidden="true" />
        <h2 className="text-h2">{t('dash.badges')}</h2>
        <span className="ml-auto text-ui text-primary-400">
          who holds what, and who may hand it out
        </span>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-5">
        {catalogue.map((one) => {
          const active = one.name === selected;
          const count = counts[one.name];

          return (
            <button
              key={one.id}
              type="button"
              onClick={() => pick(one.name)}
              className={`option${active ? ' is-active' : ''}`}
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
              <span className="text-micro text-primary-400">
                {count === null || count === undefined ? '·' : count.toLocaleString('en-US')}
              </span>
            </button>
          );
        })}
      </div>

      {kind === 'twitch' ? (
        <p className="text-read text-primary-300 max-w-prose px-4 pb-5">
          <span className="font-bold">{selected}</span> comes from twitch and is written by the
          sweep, so it is a count rather than a roster:{' '}
          <span className="font-bold">
            {counts[selected] === null || counts[selected] === undefined
              ? 'an unknown number of'
              : counts[selected].toLocaleString('en-US')}
          </span>{' '}
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
          </div>

          {rows.length === 0 ? (
            <p className="text-read text-primary-300 max-w-prose px-4 pb-4">
              Nobody holds <span className="font-bold">{selected}</span> yet.
            </p>
          ) : (
            <div className="rows">
              <div className="row-head cols-badges">
                <span>{t('dash.account')}</span>
                <span>{t('dash.givenBy')}</span>
                <span>When</span>
                <span />
              </div>

              {shown.map((row) => (
                <div key={row.userId} className="row cols-badges">
                  <span className="flex items-center gap-3 min-w-0">
                    <Avatar src={row.avatar} name={row.login ?? row.userId} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 min-w-0">
                        <Name login={row.login} fallback={row.userId} />
                        <Badges badges={row.badges} size={16} />
                      </span>
                      {(row.owner || row.ignored || row.known === false) && (
                        <span className="flex items-center gap-2 text-micro">
                          {row.owner && <span className="text-mod">owner</span>}
                          {row.ignored && <span className="text-vip">opted out</span>}
                          {row.known === false && (
                            <span className="text-primary-400">never fetched</span>
                          )}
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="text-ui text-primary-300 truncate">{row.byLogin ?? '·'}</span>

                  <span className="text-ui text-primary-300">
                    {row.at ? formatDayMonthYear(row.at) : '·'}
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
