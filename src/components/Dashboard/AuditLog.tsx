'use client';

import { useT } from '@/i18n';
import { FC, useState, useTransition } from 'react';
import { LocaleLink } from '@/components/UI/LocaleLink';
import clsx from 'clsx';

import { listAudit, type AuditView } from '@/actions/dashboard';
import type { AuditEntry, AuditPage, AuditParty } from '@/utils/api/moddex/admin';

const VIEWS: { id: AuditView; key: string }[] = [
  { id: 'actions', key: 'dash.auditActions' },
  { id: 'logins', key: 'dash.auditLogins' },
  { id: 'everything', key: 'dash.auditEverything' }
];

const Who: FC<{ row: AuditEntry }> = ({ row }) => {
  const t = useT();
  const party: AuditParty | null = row.actor ?? row.subject;

  if (!party) return <span className="text-ui text-primary-400">{t('dash.auditSystem')}</span>;

  const about = !row.actor;

  if (!party.login) {
    return (
      <span className="text-ui text-primary-300 tabular truncate" title={party.id}>
        {party.id}
      </span>
    );
  }

  return (
    <LocaleLink
      href={`/user/${party.login}`}
      title={about ? t('dash.auditAbout') : t('dash.auditDidIt')}
      className={clsx('row-name text-ui truncate', !about && 'font-bold')}
    >
      {about ? '→ ' : ''}
      {party.name || party.login}
    </LocaleLink>
  );
};

export const AuditLog: FC<{ initial: AuditPage }> = ({ initial }) => {
  const t = useT();
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
        <h2 className="text-h2">{t('dash.auditLog')}</h2>

        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {page.total === null
            ? t('dash.auditShown', { shown: t.number(rows.length) })
            : t('dash.auditShownOf', {
                shown: t.number(rows.length),
                total: t.number(page.total)
              })}
        </span>
      </div>

      <nav aria-label={t('dash.auditFilter')} className="flex flex-wrap gap-2 px-4 pb-5">
        {VIEWS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={view === option.id}
            disabled={pending}
            className={clsx('option', view === option.id && 'is-active')}
            onClick={() => show(option.id)}
          >
            {t(option.key)}
          </button>
        ))}
      </nav>

      <div className="rows">
        <div className="row-head cols-audit">
          <span>{t('dash.auditType')}</span>
          <span>{t('dash.auditWhat')}</span>
          <span>{t('dash.auditWho')}</span>
          <span>{t('dash.when')}</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="row cols-audit">
            <span className="text-ui text-primary-400 truncate">{row.type}</span>

            <span className="text-ui min-w-0 break-words">{row.message}</span>

            <span className="min-w-0">
              <Who row={row} />
            </span>

            <span className="text-ui text-primary-300 tabular">{t.dateTime(row.createdAt)}</span>
          </div>
        ))}

        {rows.length === 0 ? (
          <div className="row">
            <span className="text-ui text-primary-300">{t('dash.auditEmpty')}</span>
          </div>
        ) : null}
      </div>

      {page.hasMore ? (
        <div className="px-4 py-4">
          <button type="button" className="button" onClick={() => void more()} disabled={busy}>
            {busy ? t('dash.loading') : t('dash.loadMore')}
          </button>
        </div>
      ) : null}
    </div>
  );
};
