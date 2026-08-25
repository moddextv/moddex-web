'use client';

import { FC, useState, useTransition } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { listAudit, type AuditView } from '@/actions/dashboard';
import { formatDateTime } from '@/utils/format';
import type { AuditEntry, AuditPage, AuditParty } from '@/utils/api/moddex/admin';

const VIEWS: { id: AuditView; label: string }[] = [
  { id: 'actions', label: 'Actions' },
  { id: 'logins', label: 'Sign-ins' },
  { id: 'everything', label: 'Everything' }
];

const Who: FC<{ row: AuditEntry }> = ({ row }) => {
  const party: AuditParty | null = row.actor ?? row.subject;

  if (!party) return <span className="text-ui text-primary-400">system</span>;

  const about = !row.actor;

  if (!party.login) {
    return (
      <span className="text-ui text-primary-300 tabular truncate" title={party.id}>
        {party.id}
      </span>
    );
  }

  return (
    <Link
      href={`/user/${party.login}`}
      title={about ? 'the account this was about' : 'who did it'}
      className={clsx('row-name text-ui truncate', !about && 'font-bold')}
    >
      {about ? '→ ' : ''}
      {party.name || party.login}
    </Link>
  );
};

export const AuditLog: FC<{ initial: AuditPage }> = ({ initial }) => {
  const [view, setView] = useState<AuditView>('actions');
  const [page, setPage] = useState(initial);
  const [rows, setRows] = useState(initial.items);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  const show = (next: AuditView) => {
    if (next === view) return;

    startTransition(async () => {
      const result = await listAudit(next);
      if (!result.ok) return;

      setView(next);
      setPage(result.data);
      setRows(result.data.items);
    });
  };

  const more = async () => {
    if (!page.cursor) return;

    setBusy(true);
    const next = await listAudit(view, page.cursor);
    setBusy(false);

    if (!next.ok) return;

    setRows([...rows, ...next.data.items]);
    setPage({ ...next.data, total: page.total });
  };

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">Audit log</h2>

        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {rows.length.toLocaleString('en-US')} shown
          {page.total === null ? '' : ` of ${page.total.toLocaleString('en-US')}`}
        </span>
      </div>

      <nav aria-label="Audit log filter" className="flex flex-wrap gap-2 px-4 pb-5">
        {VIEWS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={view === option.id}
            disabled={pending}
            className={clsx('option', view === option.id && 'is-active')}
            onClick={() => show(option.id)}
          >
            {option.label}
          </button>
        ))}
      </nav>

      <div className="rows">
        <div className="row-head cols-audit">
          <span>Type</span>
          <span>What happened</span>
          <span>Who</span>
          <span>When</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="row cols-audit">
            <span className="text-ui text-primary-400 truncate">{row.type}</span>

            <span className="text-ui min-w-0 break-words">{row.message}</span>

            <span className="min-w-0">
              <Who row={row} />
            </span>

            <span className="text-ui text-primary-300 tabular">
              {formatDateTime(row.createdAt)}
            </span>
          </div>
        ))}

        {rows.length === 0 ? (
          <div className="row">
            <span className="text-ui text-primary-300">
              Nothing recorded under this filter yet.
            </span>
          </div>
        ) : null}
      </div>

      {page.hasMore ? (
        <div className="px-4 py-4">
          <button type="button" className="button" onClick={() => void more()} disabled={busy}>
            {busy ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </div>
  );
};
