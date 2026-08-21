import { FC } from 'react';

import { ago } from './ago';
import { duration } from '@/utils/jobHealth';
import type { JobRun } from '@/utils/api/moddex';

const Trend: FC<{ run: JobRun }> = ({ run }) => {
  const average = run.averageSecondsLast7;

  if (average === null || average <= 0) return <span className="text-primary-400">·</span>;

  const change = Math.round(((run.seconds - average) / average) * 100);

  if (Math.abs(change) < 10) {
    return <span className="text-primary-400">steady · {duration(Math.round(average))} avg</span>;
  }

  return (
    <span className={change > 0 ? 'text-vip font-bold' : 'text-primary-300'}>
      {change > 0 ? '+' : ''}
      {change}% <span className="text-primary-400">· {duration(Math.round(average))} avg</span>
    </span>
  );
};

export const Runs: FC<{ runs: Record<string, JobRun> }> = ({ runs }) => {
  const entries = Object.entries(runs);

  if (!entries.length) {
    return (
      <div className="panel">
        <p className="text-read text-primary-300">
          Nothing recorded yet. The first row lands at 03:00 UTC.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-flush">
      <div className="px-4 pb-5">
        <h2 className="text-h2">How long the nightly work takes</h2>
        <p className="text-read text-primary-300 max-w-prose pt-1">
          Against its own seven-day average. The trend is the part worth reading, because a single
          duration cannot show a job outgrowing its window.
        </p>
      </div>

      <div className="rows">
        <div className="row-head cols-jobs">
          <span>Job</span>
          <span>Last run</span>
          <span>vs. 7d avg</span>
        </div>

        {entries.map(([job, run]) => (
          <div key={job} className="row cols-jobs">
            <span className="text-base font-bold">{job.replace(/_/g, ' ')}</span>
            <span className="text-ui text-primary-300">
              {duration(run.seconds)}
              <span className="text-primary-400"> · {ago(run.at)}</span>
              {run.rows !== null && (
                <span className="text-primary-400"> · {run.rows.toLocaleString('en-US')} rows</span>
              )}
            </span>
            <span className="text-micro">
              <Trend run={run} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
