import { Badges } from '@/components/User/Badges';
import { Avatar } from '@/components/UI/Avatar';
import { BrowseEntry } from '@/misc/browse';
import { formatNumber, formatRelative } from '@/utils/format';
import Link from 'next/link';
import { FC } from 'react';
import clsx from 'clsx';

export type BrowseKind = 'channel' | 'account';

const HEADS: Record<BrowseKind, [string, string, string, string?]> = {
  channel: ['Channel', 'Mods', 'Vips', 'Read'],
  account: ['Account', 'Modding', 'Viping']
};

const Count: FC<{ value: number; tone: string }> = ({ value, tone }) => (
  <span className={clsx('text-ui tabular text-right', value > 0 ? tone : 'text-primary-400')}>
    {formatNumber(value)}
  </span>
);

export const BrowseRows: FC<{ kind: BrowseKind; items: BrowseEntry[] }> = ({ kind, items }) => {
  const cols = kind === 'channel' ? 'cols-channels' : 'cols-people';
  const [first, second, third, fourth] = HEADS[kind];

  return (
    <div className="rows">
      <div className={`row-head ${cols}`}>
        <span>{first}</span>
        <span className="text-right">{second}</span>
        <span className="text-right">{third}</span>
        {fourth && <span className="text-right">{fourth}</span>}
      </div>

      {items.map((entry) => (
        <Link
          key={entry.id}
          href={`/${kind === 'channel' ? 'channel' : 'user'}/${entry.login}`}
          className={`row ${cols}`}
        >
          <span className="flex items-center gap-3.5 min-w-0">
            <Avatar
              src={entry.avatar}
              name={entry.name || entry.login}
              size={36}
              className="w-9 h-9"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 min-w-0">
                <span className="row-name text-base font-bold truncate">
                  {entry.name || entry.login}
                </span>
                <Badges badges={entry.badges} size={18} />
              </span>
              <span className="block text-micro text-primary-400">
                {formatNumber(entry.follower || 0)} followers
              </span>
            </span>
          </span>

          <Count value={entry.counts.mod} tone="text-mod" />
          <Count value={entry.counts.vip} tone="text-vip" />

          {kind === 'channel' && (
            <time
              dateTime={entry.updated ? new Date(entry.updated).toISOString() : undefined}
              suppressHydrationWarning
              className="text-ui text-primary-400 text-right"
            >
              {formatRelative(entry.updated) ?? 'not yet'}
            </time>
          )}
        </Link>
      ))}
    </div>
  );
};
