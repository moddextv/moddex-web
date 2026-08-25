'use client';

import { FC, useState } from 'react';
import { useT } from '@/i18n/context';
import { Translator } from '@/i18n/translate';
import { LocaleLink } from '@/components/UI/LocaleLink';

import { listDonations } from '@/actions/dashboard';
import type { Ledger, LedgerEntry } from '@/utils/api/moddex/admin';

// a refunded charge still wearing a donator badge is the case to catch
const COUNTED = new Set(['paid', 'db_insertion']);

const Who: FC<{ row: LedgerEntry; t: Translator }> = ({ row, t }) =>
  row.login ? (
    <LocaleLink href={`/user/${row.login}`} className="row-name text-base font-bold truncate">
      {row.displayName || row.login}
    </LocaleLink>
  ) : (
    <span className="text-base truncate" title={t('dash.don.noAccountLinked')}>
      {row.donorName || t('dash.don.anonymous')}
    </span>
  );

export const Donations: FC<{ initial: Ledger }> = ({ initial }) => {
  const t = useT();
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
        <h2 className="text-h2">{t('dash.donations')}</h2>
        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {t('dash.don.summary', { shown: t.number(rows.length), total: t.money(total, 'EUR') })}
        </span>
      </div>

      <div className="rows">
        <div className="row-head cols-donations">
          <span>{t('dash.don.who')}</span>
          <span>{t('dash.don.when')}</span>
          <span>{t('dash.status')}</span>
          <span className="text-right">{t('dash.amount')}</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="row cols-donations">
            <span className="min-w-0">
              <Who row={row} t={t} />
            </span>

            <span className="text-ui text-primary-300 tabular">{t.date(row.time)}</span>

            <span
              className={
                COUNTED.has(row.status) ? 'text-ui text-primary-400' : 'text-ui text-vip font-bold'
              }
            >
              {row.status}
            </span>

            <span className="text-ui tabular text-right">{t.money(row.amountCents, 'EUR')}</span>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="px-4 py-4">
          <button type="button" className="button" onClick={() => void more()} disabled={busy}>
            {busy ? t('dash.loading') : t('dash.loadMore')}
          </button>
        </div>
      ) : null}
    </div>
  );
};
