import { FC } from 'react';
import clsx from 'clsx';

import { buildPath, H, W } from '@/utils/sparkline';
import { duration } from '@/utils/jobHealth';
import type { JobPoint } from '@/utils/api/moddex';

// the same tolerance the Runs trend uses, so the two never disagree on a word
const STEADY = 0.1;

const Trend: FC<{ job: string; points: JobPoint[] }> = ({ job, points }) => {
  const values = points.map((point) => point.seconds);
  const first = values[0] ?? null;
  const last = values.at(-1) ?? null;

  const change = first && last ? (last - first) / first : null;
  const climbing = change !== null && change > STEADY;

  return (
    <div className="row cols-trends">
      <span className="text-base font-bold">{job.replace(/_/g, ' ')}</span>

      <span className="text-ui text-primary-300 tabular">
        {last === null ? '·' : duration(last)}
      </span>

      <span className="flex items-center">
        {buildPath(values) ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            aria-hidden="true"
            className="w-full h-7 overflow-visible"
            preserveAspectRatio="none"
          >
            <path
              d={buildPath(values)}
              fill="none"
              stroke={climbing ? 'var(--vip)' : 'var(--mod)'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <span className="text-micro text-primary-400">one run so far</span>
        )}
      </span>

      <span
        className={clsx(
          'text-ui tabular text-right',
          climbing ? 'text-vip font-bold' : 'text-primary-400'
        )}
      >
        {change === null
          ? '·'
          : `${change >= 0 ? '+' : ''}${Math.round(change * 100)}% over ${points.length}`}
      </span>
    </div>
  );
};

export const Trends: FC<{ series: Record<string, JobPoint[]> | null; days: number }> = ({
  series,
  days
}) => {
  const jobs = Object.entries(series ?? {}).filter(([, points]) => points.length > 0);

  if (!jobs.length) return null;

  return (
    <div className="panel-flush">
      <div className="flex items-baseline gap-3 flex-wrap px-4 pb-5">
        <h2 className="text-h2">How the nightly work is trending</h2>
        <span className="text-ui text-primary-400">last {days} days</span>
      </div>

      <div className="rows">
        <div className="row-head cols-trends">
          <span>Job</span>
          <span>Last</span>
          <span />
          <span className="text-right">Change</span>
        </div>

        {jobs.map(([job, points]) => (
          <Trend key={job} job={job} points={points} />
        ))}
      </div>
    </div>
  );
};
