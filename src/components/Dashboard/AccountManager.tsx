'use client';

import { FC, useMemo, useState } from 'react';
import { Image } from '@/components/UI/Image';
import { SearchIcon } from '@/components/Icons';
import { formatDayMonthYear } from '@/utils/format';
import {
  findAccount,
  flagAccountAsBot,
  listBots,
  unflagAccountAsBot,
  type BotRow
} from '@/actions/bots';
import { listAdmins, makeAdmin, removeAdmin, type AdminRow } from '@/actions/admins';
import type { User } from '@/misc/account';
import { useAction } from '@/hooks/useAction';
import { actionGroup } from '@/hooks/actionGroup';
import { resolveHit, toAdminRow, toBotRow, visibleRows } from './accounts';

type Tab = 'bots' | 'admins';
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

export const AccountManager: FC<{ bots: BotRow[]; admins: AdminRow[] }> = ({
  bots: initialBots,
  admins: initialAdmins
}) => {
  const [bots, setBots] = useState(initialBots);
  const [admins, setAdmins] = useState(initialAdmins);
  const [tab, setTab] = useState<Tab>('bots');
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<User | null>(null);
  const [looked, setLooked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const term = query.trim().toLowerCase();

  const botRows = useMemo(() => bots.map(toBotRow), [bots]);
  const adminRows = useMemo(() => admins.map(toAdminRow), [admins]);

  const rows = tab === 'bots' ? botRows : adminRows;

  const matched = useMemo(() => visibleRows(rows, term, true), [rows, term]);
  const shown = useMemo(() => visibleRows(rows, term, showAll), [rows, term, showAll]);

  const hit = useMemo(() => resolveHit(botRows, adminRows, term), [botRows, adminRows, term]);

  const onType = (value: string) => {
    setQuery(value);
    setFound(null);
    setLooked(false);
    setConfirming(false);
    clearError();
  };

  const reload = async () => {
    const [freshBots, freshAdmins] = await Promise.all([listBots(), listAdmins()]);

    if (freshBots.ok) setBots(freshBots.data);
    if (freshAdmins.ok) setAdmins(freshAdmins.data);

    onType('');
  };

  const lookup = useAction(findAccount, {
    onSuccess: (account) => {
      setFound(account);
      setLooked(true);
    }
  });

  const flag = useAction(flagAccountAsBot, { onSuccess: reload });
  const unflag = useAction(unflagAccountAsBot, { onSuccess: reload });
  const grant = useAction(makeAdmin, { onSuccess: reload });
  const remove = useAction(removeAdmin, { onSuccess: reload });

  const { pending, error, clearError } = actionGroup(lookup, flag, unflag, grant, remove);

  const isBot = (id: string) => botRows.some((row) => row.userId === id);
  const isAdmin = (id: string) => adminRows.some((row) => row.userId === id);

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <span className="corner corner-tl text-mod" aria-hidden="true" />
        <h2 className="text-h2">Accounts</h2>

        <label className="search ml-auto w-full sm:w-80">
          <SearchIcon size={16} color="text-primary-400" />
          <input
            value={query}
            onChange={(event) => onType(event.target.value)}
            placeholder="A Twitch name or id"
            aria-label="Find an account to flag as a bot or make an admin"
            autoComplete="off"
          />
        </label>
      </div>

      {term && (
        <div className="px-4 pb-5">
          {hit && (
            <div className="flex items-center gap-3 flex-wrap">
              <Avatar
                src={hit.account.avatar}
                name={hit.account.name ?? hit.account.login ?? hit.account.userId}
              />
              <span className="text-base font-bold">
                {hit.account.name ?? hit.account.login ?? hit.account.userId}
              </span>
              <span className="text-micro text-primary-400">#{hit.account.userId}</span>
              {hit.bot && <span className="chip">bot</span>}
              {hit.admin && <span className="chip">admin</span>}
            </div>
          )}

          {!hit && !looked && (
            <button type="button" className="btn btn-soft" onClick={() => void lookup.run(term)}>
              Look up &quot;{term}&quot; on Twitch
            </button>
          )}

          {!hit && looked && !found && (
            <p className="text-ui text-primary-400">
              No account called <span className="text-primary-100 font-semibold">{term}</span> has
              been indexed yet. Search for it on moddex.tv first and that adds it.
            </p>
          )}

          {!hit && found && (
            <div className="flex flex-wrap items-center gap-3">
              <Avatar src={found.avatar} name={found.name || found.login} />
              <span className="min-w-0 mr-auto">
                <span className="block text-base font-bold truncate">
                  {found.name || found.login}
                </span>
                <span className="block text-micro text-primary-400">#{found.id}</span>
              </span>

              <button
                type="button"
                className="btn"
                disabled={pending || isBot(found.id)}
                onClick={() => void flag.run(found.id)}
              >
                {isBot(found.id) ? 'Already a bot' : 'Flag as bot'}
              </button>

              {isAdmin(found.id) ? (
                <span className="text-ui text-primary-400">is already an admin</span>
              ) : confirming ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={pending}
                  onClick={() => void grant.run(found.id)}
                >
                  Confirm: full admin
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => setConfirming(true)}
                >
                  Make admin
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="px-4 pb-5 text-ui text-vip" role="alert">
          {error}
        </p>
      )}

      <div className="tabs px-4">
        <button
          type="button"
          className="tab tab-mod"
          aria-current={tab === 'bots' ? 'page' : undefined}
          onClick={() => {
            setTab('bots');
            setShowAll(false);
          }}
        >
          Bots <span className="text-ui text-primary-400 tabular">{bots.length}</span>
        </button>
        <button
          type="button"
          className="tab tab-vip"
          aria-current={tab === 'admins' ? 'page' : undefined}
          onClick={() => {
            setTab('admins');
            setShowAll(false);
          }}
        >
          Admins <span className="text-ui text-primary-400 tabular">{admins.length}</span>
        </button>
      </div>

      <div className="rows">
        <div className="row-head cols-bots">
          <span>Account</span>
          <span>{tab === 'bots' ? 'Flagged by' : 'Granted by'}</span>
          <span className="text-right">When</span>
          <span />
        </div>

        {shown.map((row) => (
          <div key={row.userId} className="row cols-bots">
            <span className="flex items-center gap-3 min-w-0">
              <Avatar src={row.avatar} name={row.name ?? row.login ?? row.userId} />
              <span className="min-w-0">
                <span className="block text-base font-bold truncate">
                  {row.name ?? row.login ?? row.userId}
                </span>
                <span className="block text-micro text-primary-400 truncate">
                  {row.known === false ? 'not indexed yet' : `#${row.userId}`}
                </span>
              </span>
            </span>

            <span className="text-ui text-primary-300 truncate">{row.byLogin ?? '—'}</span>

            <span className="text-ui text-primary-400 tabular text-right">
              {(row.at && formatDayMonthYear(row.at)) ?? '—'}
            </span>

            {row.owner ? (
              <button
                type="button"
                className="btn btn-ghost justify-self-end"
                disabled={pending}
                title="The api refuses this. Press it to see what it says."
                onClick={() => void remove.run(row.userId)}
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost justify-self-end"
                disabled={pending || (tab === 'admins' && admins.length <= 1)}
                title={
                  tab === 'admins' && admins.length <= 1
                    ? "You can't remove the last admin"
                    : undefined
                }
                onClick={() =>
                  void (tab === 'bots' ? unflag.run(row.userId) : remove.run(row.userId))
                }
              >
                {tab === 'bots' ? 'Unflag' : 'Remove'}
              </button>
            )}
          </div>
        ))}
      </div>

      {matched.length > shown.length && (
        <p className="px-4 pt-4 text-ui text-primary-400">
          Showing {shown.length} of {matched.length}.{' '}
          <button
            type="button"
            className="text-primary-100 font-semibold underline underline-offset-2"
            onClick={() => setShowAll(true)}
          >
            Show all
          </button>
        </p>
      )}

      {!matched.length && (
        <p className="text-ui text-primary-400 px-4 pt-2 pb-4">
          {term ? `Nothing in ${tab} matches "${term}".` : `Nothing is flagged.`}
        </p>
      )}
    </div>
  );
};
