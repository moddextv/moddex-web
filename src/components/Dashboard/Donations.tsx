'use client';

import { FC, useState } from 'react';
import Link from 'next/link';

import { listDonations } from '@/actions/dashboard';
import { formatDayMonthYear } from '@/utils/format';
import type { Ledger, LedgerEntry } from '@/utils/api/moddex/admin';

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'EUR' });

// a refunded charge still wearing a donator badge is the case to catch
const COUNTED = new Set(['paid', 'db_insertion']);

const Who: FC<{ row: LedgerEntry }> = ({ row }) =>
  row.login ? (
    <Link href={`/user/${row.login}`} className="row-name text-base font-bold truncate">
      {row.displayName || row.login}
    </Link>
  ) : (
    <span className="text-base truncate" title="no twitch account was linked to this donation">
      {row.donorName || 'anonymous'}
    </span>
  );

export const Donations: FC<{ initial: Ledger }> = ({ initial }) => {
  const [rows, setRows] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.cursor);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [busy, setBusy] = useState(false);

  const total = rows
    .filter((row) => COUNTED.has(row.status))
    .reduce((sum, row) => sum + row.amountCents, 0);

  const more = async () => {
    if (!cursor) return;

    setBusy(true);
    const next = await listDonations(cursor);
    setBusy(false);

    if (!next.ok) return;

    setRows([...rows, ...next.data.items]);
    setCursor(next.data.cursor);
    setHasMore(next.data.hasMore);
  };

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">Donations</h2>
        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {rows.length.toLocaleString('en-US')} shown · {money(total)} counted
        </span>
      </div>

      <div className="rows">
        <div className="row-head cols-donations">
          <span>Who</span>
          <span>When</span>
          <span>Status</span>
          <span className="text-right">Amount</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="row cols-donations">
            <span className="min-w-0">
              <Who row={row} />
            </span>

            <span className="text-ui text-primary-300 tabular">{formatDayMonthYear(row.time)}</span>

            <span
              className={
                COUNTED.has(row.status) ? 'text-ui text-primary-400' : 'text-ui text-vip font-bold'
              }
            >
              {row.status}
            </span>

            <span className="text-ui tabular text-right">{money(row.amountCents)}</span>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="px-4 py-4">
          <button type="button" className="button" onClick={() => void more()} disabled={busy}>
            {busy ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </div>
  );
};
