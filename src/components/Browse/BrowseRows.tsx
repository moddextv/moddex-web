import { Badges } from '@/components/User/Badges';
import { Image } from '@/components/UI/Image';
import { BrowseEntry } from '@/misc/Interfaces';
import { formatNumber, formatRelative } from '@/utils/utils';
import Link from 'next/link';
import { FC } from 'react';
import clsx from 'clsx';

export type BrowseKind = 'channel' | 'account';

/**
 * The two browse row shapes, which differ only in what the numbers on the right
 * mean. A channel row counts the roles that channel has handed out; an account
 * row counts the roles that account holds. Same template, opposite direction,
 * which is the product in one component.
 */
const HEADS: Record<BrowseKind, [string, string, string, string?]> = {
  channel: ['Channel', 'Mods', 'Vips', 'Read'],
  account: ['Account', 'Modding', 'Viping']
};

const Count: FC<{ value: number; tone: string }> = ({ value, tone }) => (
  // a zero drops the role colour. colour here means "there are some", so
  // painting a zero green says the opposite of what the number says.
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
            <Image
              src={entry.avatar ?? ''}
              alt=""
              width={36}
              height={36}
              radius="full"
              className="w-9 h-9 shrink-0 bg-primary-700"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 min-w-0">
                <span className="row-name text-base font-bold truncate">
                  {entry.name || entry.login}
                </span>
                <Badges badges={entry.badges} size={14} />
                {entry.bot && (
                  <span className="shrink-0 px-2 py-0.5 rounded-sm bg-primary-700 text-micro font-semibold text-primary-400">
                    bot
                  </span>
                )}
              </span>
              <span className="block text-micro text-primary-400">
                {formatNumber(entry.follower || 0)} followers
              </span>
            </span>
          </span>

          <Count value={entry.counts.mod} tone="text-mod" />
          <Count value={entry.counts.vip} tone="text-vip" />

          {kind === 'channel' && (
            // suppressHydrationWarning because this is a clock reading: the
            // server renders "4 minutes ago" and the client, hydrating a moment
            // later, may legitimately compute "5 minutes ago". the dateTime
            // attribute carries the value that does not drift.
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
