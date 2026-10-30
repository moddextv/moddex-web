import { Locale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Avatar } from '@/components/UI/Avatar';
import { Badges } from '@/components/User/Badges';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { LeaderRow } from '@/utils/api/moddex/public';
import Link from 'next/link';
import { CSSProperties, FC } from 'react';
import clsx from 'clsx';

const TONE: Record<string, string> = {
  mod: 'text-mod',
  vip: 'text-vip',
  founder: 'text-founder',
  roles: 'text-primary-100'
};

// nothing for a place that held: a column of "no change" buries the few that moved
const Moved: FC<{ places: number | null; size: number; index: number }> = ({
  places,
  size,
  index
}) => {
  if (!places) return null;

  const up = places > 0;

  return (
    <span
      className={clsx(
        'rank-move inline-flex items-center gap-0.5 justify-end',
        up ? 'is-up text-mod' : 'is-down text-founder'
      )}
      style={{ '--i': index } as CSSProperties}
    >
      {up ? <ChevronUpIcon size={size} /> : <ChevronDownIcon size={size} />}
      {Math.abs(places)}
    </span>
  );
};

export const LeaderRows: FC<{
  scale: string;
  label: string;
  items: LeaderRow[];
  locale: Locale;
  youId?: string;
}> = ({ scale, label, items, locale, youId }) => {
  const t = getTranslator(locale);

  return (
    <div className="rows">
      <div className="row-head cols-leaders">
        <span>#</span>
        <span>{t('misc.account')}</span>
        <span className="moved-slot text-right">{t('leaderboard.movedHead')}</span>
        <span className="text-right">{label}</span>
      </div>

      {items.map((row, index) => (
        <Link
          key={row.id}
          href={localePath(locale, `/user/${row.login}`)}
          className={clsx('row cols-leaders', row.id === youId && 'is-you')}
        >
          <span className="text-ui tabular text-primary-400">{row.place}</span>

          <span className="flex items-center gap-3.5 min-w-0">
            <Avatar src={row.avatar} name={row.name || row.login} size={36} className="w-9 h-9" />
            <span className="flex items-center gap-2 min-w-0">
              <span className="row-name text-base font-bold truncate">{row.name || row.login}</span>
              <Badges badges={row.badges} size={18} className="shrink-0 flex-nowrap" />
            </span>
          </span>

          <span className="moved-slot text-ui tabular text-right">
            <Moved places={row.moved} size={13} index={index} />
          </span>

          <span className={clsx('text-ui tabular text-right', TONE[scale] ?? 'text-primary-100')}>
            {t.number(row.count)}
          </span>
        </Link>
      ))}
    </div>
  );
};
