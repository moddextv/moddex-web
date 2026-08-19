import { Avatar } from '@/components/UI/Avatar';
import { Badges } from '@/components/User/Badges';
import { LeaderRow } from '@/utils/api/moddex';
import { formatNumber } from '@/utils/format';
import Link from 'next/link';
import { FC } from 'react';
import clsx from 'clsx';

const TONE: Record<string, string> = {
  mod: 'text-mod',
  vip: 'text-vip',
  founder: 'text-founder',
  roles: 'text-primary-100'
};

export const LeaderRows: FC<{ scale: string; label: string; items: LeaderRow[] }> = ({
  scale,
  label,
  items
}) => (
  <div className="rows">
    <div className="row-head cols-leaders">
      <span>#</span>
      <span>Account</span>
      <span className="text-right">{label}</span>
    </div>

    {items.map((row) => (
      <Link key={row.id} href={`/user/${row.login}`} className="row cols-leaders">
        <span className="text-ui tabular text-primary-400">{row.position}</span>

        <span className="flex items-center gap-3.5 min-w-0">
          <Avatar src={row.avatar} name={row.name || row.login} size={36} className="w-9 h-9" />
          <span className="flex items-center gap-2 min-w-0">
            <span className="row-name text-base font-bold truncate">{row.name || row.login}</span>
            <Badges badges={row.badges} size={18} className="shrink-0 flex-nowrap" />
          </span>
        </span>

        <span className={clsx('text-ui tabular text-right', TONE[scale] ?? 'text-primary-100')}>
          {formatNumber(row.count)}
        </span>
      </Link>
    ))}
  </div>
);
