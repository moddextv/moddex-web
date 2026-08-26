import { Locale } from '@/i18n/locales';
import { Translator } from '@/i18n/translate';
import { getTranslator } from '@/i18n/dictionary';
import { FC } from 'react';
import type { HistoryPoint } from '@/utils/api/moddex/public';
import { buildPath, H, W } from '@/utils/sparkline';

interface Series {
  label: string;
  color: string;
  values: (number | null)[];
}

const Spark: FC<{ series: Series; t: Translator }> = ({ series, t }) => {
  const known = series.values.filter((value): value is number => value !== null);
  const latest = known.at(-1) ?? null;
  const first = known.at(0) ?? null;

  const change = known.length >= 2 && latest !== null && first !== null ? latest - first : null;
  const path = buildPath(series.values);

  return (
    <div className="flex flex-col gap-2.5 min-w-0">
      <p className="text-micro uppercase tracking-wider text-primary-400">{series.label}</p>

      <p className="text-h2 font-extrabold tabular leading-none" style={{ color: series.color }}>
        {change === null ? '·' : `${change >= 0 ? '+' : '−'}${t.number(Math.abs(change))}`}
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
          {known.length ? t('home.growth.oneDay') : t('home.growth.notMeasured')}
        </p>
      )}

      {/* founders were measured later, so this number differs per series */}
      <p className="text-micro text-primary-400 tabular">
        {change === null
          ? t('home.growth.nothingToCompare')
          : t('home.growth.overLastDays', { count: known.length })}
      </p>
    </div>
  );
};

export const Growth: FC<{ points: HistoryPoint[]; locale: Locale }> = ({ points, locale }) => {
  const t = getTranslator(locale);
  if (points.length < 2) return null;

  const series: Series[] = [
    {
      label: t('home.stats.mods'),
      color: 'var(--mod)',
      values: points.map((point) => point.mods)
    },
    {
      label: t('home.stats.vips'),
      color: 'var(--vip)',
      values: points.map((point) => point.vips)
    },
    {
      label: t('home.stats.founders'),
      color: 'var(--founder)',
      values: points.map((point) => point.founders)
    }
  ];

  return (
    <div className="panel">
      <h2 className="text-h2 mb-6">{t('misc.overTime')}</h2>

      <div className="grid gap-8 sm:grid-cols-3">
        {series.map((one) => (
          <Spark key={one.label} series={one} t={t} />
        ))}
      </div>
    </div>
  );
};
