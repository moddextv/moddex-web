import { getTranslator, Locale, Translator } from '@/i18n';
import { FC } from 'react';

import { duration } from '@/utils/jobHealth';
import type { JobRun } from '@/utils/api/moddex/admin';

const Trend: FC<{ run: JobRun; t: Translator }> = ({ run, t }) => {
  const average = run.averageSecondsLast7;

  if (average === null || average <= 0) return <span className="text-primary-400">·</span>;

  const change = Math.round(((run.seconds - average) / average) * 100);

  if (Math.abs(change) < 10) {
    return (
      <span className="text-primary-400">
        {t('dash.runs.steady', { avg: duration(Math.round(average)) })}
      </span>
    );
  }

  return (
    <span className={change > 0 ? 'text-vip font-bold' : 'text-primary-300'}>
      {change > 0 ? '+' : ''}
      {change}%{' '}
      <span className="text-primary-400">
        · {t('dash.runs.avg', { avg: duration(Math.round(average)) })}
      </span>
    </span>
  );
};

export const Runs: FC<{ runs: Record<string, JobRun>; locale: Locale }> = ({ runs, locale }) => {
  const t = getTranslator(locale);
  const entries = Object.entries(runs);

  if (!entries.length) {
    return (
      <div className="panel">
        <p className="text-read text-primary-300">{t('dash.runs.nothingRecorded')}</p>
      </div>
    );
  }

  return (
    <div className="panel-flush">
      <div className="px-4 pb-5">
        <h2 className="text-h2">{t('dash.runsTitle')}</h2>
        <p className="text-read text-primary-300 max-w-prose pt-1">{t('dash.runs.lead')}</p>
      </div>

      <div className="rows">
        <div className="row-head cols-jobs">
          <span>{t('dash.job')}</span>
          <span>{t('dash.lastRun')}</span>
          <span>{t('dash.runs.vsAvg')}</span>
        </div>

        {entries.map(([job, run]) => (
          <div key={job} className="row cols-jobs">
            <span className="text-base font-bold">{job.replace(/_/g, ' ')}</span>
            <span className="text-ui text-primary-300">
              {duration(run.seconds)}
              <span className="text-primary-400"> · {t.ago(run.at)}</span>
              {run.rows !== null && (
                <span className="text-primary-400">
                  {' '}
                  · {t('dash.runs.rows', { count: run.rows, rows: t.number(run.rows) })}
                </span>
              )}
            </span>
            <span className="text-micro">
              <Trend run={run} t={t} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
