import { FC } from 'react';
import { Locale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import Link from 'next/link';
import clsx from 'clsx';

import { ago } from './ago';
import { backupLate, nightlyRuns, size } from '@/utils/jobHealth';
import type { JobHealth } from '@/utils/api/moddex/admin';

const Tile: FC<{
  label: string;
  value: string;
  note: string;
  href: string;
  alert?: boolean;
}> = ({ label, value, note, href, alert }) => (
  <Link href={href} className="panel px-4 py-4 hover:border-primary-600 transition-colors">
    <span className="text-micro text-primary-400 block">{label}</span>
    <span className={clsx('text-h2 block pt-1 tabular', alert && 'text-vip')}>{value}</span>
    <span className={clsx('text-micro block pt-1', alert ? 'text-vip' : 'text-primary-400')}>
      {note}
    </span>
  </Link>
);

const number = (value: number | null | undefined) =>
  value === null || value === undefined ? '·' : value.toLocaleString('en-US');

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
          value={number(snapshot.users)}
          note={snapshot.lastAt ? `read ${ago(snapshot.lastAt)}` : 'no snapshot yet'}
          href="/dashboard/jobs"
          alert={snapshot.overdue}
        />

        <Tile
          label={t('dash.sweepHead')}
          value={sweepHead ? ago(sweepHead) : 'never'}
          note="oldest channel not yet revisited"
          href="/dashboard/jobs"
        />

        <Tile
          label={t('dash.lastBackup')}
          value={backup ? ago(backup.at) : 'never'}
          note={backup ? size(backup.bytes) : 'nothing has been written'}
          href="/dashboard/jobs"
          alert={!backup || lateBackup}
        />

        <Tile
          label={t('dash.nightlyJobs')}
          value={`${nightly.ran} of ${nightly.total}`}
          note={missed === 0 ? 'all ran' : `${missed} missed the last slot`}
          href="/dashboard/jobs"
          alert={missed > 0}
        />
      </div>
    </section>
  );
};
