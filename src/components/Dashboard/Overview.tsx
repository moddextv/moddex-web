import { Locale, localePath } from '@/i18n/locales';
import { Translator } from '@/i18n/translate';
import { getTranslator } from '@/i18n/dictionary';
import { FC } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { backupLate, nightlyRuns, size } from '@/utils/jobHealth';
import type { JobHealth } from '@/utils/api/moddex/admin';

const Tile: FC<{
  label: string;
  value: string;
  note: string;
  href: string;
  locale: Locale;
  alert?: boolean;
}> = ({ label, value, note, href, locale, alert }) => (
  <Link
    href={localePath(locale, href)}
    className="panel px-4 py-4 hover:border-primary-600 transition-colors"
  >
    <span className="text-micro text-primary-400 block">{label}</span>
    <span className={clsx('text-h2 block pt-1 tabular', alert && 'text-vip')}>{value}</span>
    <span className={clsx('text-micro block pt-1', alert ? 'text-vip' : 'text-primary-400')}>
      {note}
    </span>
  </Link>
);

const number = (value: number | null | undefined, t: Translator) =>
  value === null || value === undefined ? '·' : t.number(value);

export const Overview: FC<{ health: JobHealth | null; locale: Locale }> = ({ health, locale }) => {
  const t = getTranslator(locale);
  if (!health) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('dash.jobHealthUnreadable')}</p>
        </div>
      </section>
    );
  }

  const { snapshot, sweepHead, backup, runs } = health;
  const nightly = nightlyRuns(runs);
  const missed = nightly.total - nightly.ran;
  const lateBackup = backup ? backupLate(backup.at, backup.expectedEverySeconds) : false;

  return (
    <section className="enter pb-6">
      {/* every tile here has to be able to go wrong. the sweep rates and the
          refresh queue are on /dashboard/jobs, which is where they belong */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label={t('dash.accountsIndexed')}
          value={number(snapshot.users, t)}
          note={
            snapshot.lastAt
              ? t('dash.readAgo', { ago: t.ago(snapshot.lastAt) })
              : t('dash.noSnapshotYet')
          }
          href="/dashboard/jobs"
          locale={locale}
          alert={snapshot.overdue}
        />

        <Tile
          label={t('dash.sweepHead')}
          value={sweepHead ? t.ago(sweepHead) : t('dash.never')}
          note={t('dash.oldestNotRevisited')}
          href="/dashboard/jobs"
          locale={locale}
        />

        <Tile
          label={t('dash.lastBackup')}
          value={backup ? t.ago(backup.at) : t('dash.never')}
          note={backup ? size(backup.bytes) : t('dash.nothingWritten')}
          href="/dashboard/jobs"
          locale={locale}
          alert={!backup || lateBackup}
        />

        <Tile
          label={t('dash.nightlyJobs')}
          value={t('dash.ranOf', { ran: nightly.ran, total: nightly.total })}
          note={missed === 0 ? t('dash.allRan') : t('dash.missedSlot', { count: missed })}
          href="/dashboard/jobs"
          locale={locale}
          alert={missed > 0}
        />
      </div>
    </section>
  );
};
