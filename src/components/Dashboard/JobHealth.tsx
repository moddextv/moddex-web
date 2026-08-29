import { Locale } from '@/i18n/locales';
import { Translator } from '@/i18n/translate';
import { getTranslator } from '@/i18n/dictionary';
import { FC } from 'react';
import { backupLate, clock, size, slot } from '@/utils/jobHealth';
import type { JobHealth as Health } from '@/utils/api/moddex/admin';

const Row: FC<{ label: string; children: React.ReactNode; note?: string }> = ({
  label,
  children,
  note
}) => (
  <div className="row cols-jobs">
    <span className="text-base font-bold">{label}</span>
    <span className="text-ui text-primary-300">{children}</span>
    <span className="text-micro text-primary-400 truncate" title={note}>
      {note}
    </span>
  </div>
);

const Ran: FC<{
  lastAt: string | null;
  dueSince: string;
  overdue: boolean;
  t: Translator;
}> = ({ lastAt, dueSince, overdue, t }) => (
  <>
    <span className={overdue ? 'text-vip font-bold' : undefined}>{t.ago(lastAt)}</span>
    {lastAt && <span className="text-primary-400"> · {clock(lastAt)}</span>}
    {overdue && (
      <span className="text-primary-400">
        {' '}
        · {t('dash.nothingRanIn', { slot: clock(dueSince) })}
      </span>
    )}
  </>
);

export const JobHealth: FC<{ health: Health; locale: Locale }> = ({ health, locale }) => {
  const t = getTranslator(locale);
  const { snapshot, roleCounts, sweepHead, backup } = health;

  return (
    <div className="panel-flush">
      <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">{t('dash.scheduledWork')}</h2>
        <span className="w-full sm:w-auto sm:ml-auto text-ui text-primary-400">
          {t('dash.asOf', { date: t.dateLong(new Date().toISOString()) })}
        </span>
      </div>

      <div className="rows">
        <div className="row-head cols-jobs">
          <span>{t('dash.job')}</span>
          <span>{t('dash.lastRun')}</span>
          <span />
        </div>

        <Row
          label={t('dash.snapshot')}
          note={t('dash.jh.snapshotNote', { slot: slot(snapshot.dueSince) })}
        >
          <Ran {...snapshot} t={t} />
        </Row>

        <Row
          label={t('dash.roleCounts')}
          note={t('dash.jh.roleCountsNote', { slot: slot(roleCounts.dueSince) })}
        >
          <Ran {...roleCounts} t={t} />
        </Row>

        {backup && (
          <Row label={t('dash.backup')} note={t('dash.jh.backupNote')}>
            <span
              className={
                backupLate(backup.at, backup.expectedEverySeconds)
                  ? 'text-vip font-bold'
                  : undefined
              }
            >
              {t.ago(backup.at)}
            </span>
            <span className="text-primary-400"> · {size(backup.bytes)}</span>
          </Row>
        )}

        {sweepHead && (
          <Row label={t('dash.sweepHead')} note={t('dash.oldestNotRevisited')}>
            <span title={t.dateLong(sweepHead)}>{t.ago(sweepHead)}</span>
          </Row>
        )}
      </div>
    </div>
  );
};
