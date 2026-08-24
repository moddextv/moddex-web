import { FC } from 'react';
import { formatNumber } from '@/utils/format';
import type { HistoryPoint } from '@/utils/api/moddex/public';
import { buildPath, H, W } from '@/utils/sparkline';

interface Series {
  label: string;
  color: string;
  values: (number | null)[];
}

const Spark: FC<{ series: Series }> = ({ series }) => {
  const known = series.values.filter((value): value is number => value !== null);
  const latest = known.at(-1) ?? null;
  const first = known.at(0) ?? null;

  const change = known.length >= 2 && latest !== null && first !== null ? latest - first : null;
  const path = buildPath(series.values);

  return (
    <div className="flex flex-col gap-2.5 min-w-0">
      <p className="text-micro uppercase tracking-wider text-primary-400">{series.label}</p>

      <p className="text-h2 font-extrabold tabular leading-none" style={{ color: series.color }}>
        {change === null ? '·' : `${change >= 0 ? '+' : '−'}${formatNumber(Math.abs(change))}`}
      </p>

      {path ? (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
          className="w-full h-12 overflow-visible"
          preserveAspectRatio="none"
        >
          <path
            d={path}
            fill="none"
            stroke={series.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <p className="text-micro text-primary-400 h-12">
          {known.length ? 'one day so far' : 'not measured yet'}
        </p>
      )}

      {/* founders were measured later, so this number differs per series */}
      <p className="text-micro text-primary-400 tabular">
        {change === null ? 'nothing to compare yet' : `over the last ${known.length} days`}
      </p>
    </div>
  );
};

export const Growth: FC<{ points: HistoryPoint[] }> = ({ points }) => {
  if (points.length < 2) return null;

  const series: Series[] = [
    {
      label: 'moderator records',
      color: 'var(--mod)',
      values: points.map((point) => point.mods)
    },
    {
      label: 'VIP records',
      color: 'var(--vip)',
      values: points.map((point) => point.vips)
    },
    {
      label: 'founder records',
      color: 'var(--founder)',
      values: points.map((point) => point.founders)
    }
  ];

  return (
    <div className="panel">
      <h2 className="text-h2 mb-6">Over time</h2>

      <div className="grid gap-8 sm:grid-cols-3">
        {series.map((one) => (
          <Spark key={one.label} series={one} />
        ))}
      </div>
    </div>
  );
};
