import { Tooltip } from '@/components/UI/Tooltip';
import { FC } from 'react';
import { Badges } from '@/components/User/Badges';
import { RoleType, User } from '@/misc/Interfaces';
import { formatNumber } from '@/utils/utils';
import { Image } from '@/components/UI/Image';
import Link from 'next/link';
import clsx from 'clsx';

interface UserListItemProps {
  user: User;
  role: RoleType;
}

/**
 * yyyy.mm.dd — a record stamp, not prose. reads correctly in a mono column.
 *
 * `granted` is typed `string | null` on the User interface but the mariadb
 * driver hands back a Date, so this must accept both. the old code hid that
 * by passing everything through `new Date()` inside formatDate.
 */
const stamp = (value?: string | Date | null) => {
  if (!value) return '—';

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toISOString().slice(0, 10).replace(/-/g, '.');
};

/**
 * one row. the hover state grows a corner tick in the role's colour rather
 * than lifting or shadowing the row — same bracket vocabulary as everything
 * else, and it costs one pseudo-element.
 */
export const UserListItem: FC<UserListItemProps> = ({ user, role }) => {
  const isMod = role === 'mods' || role === 'modding';

  return (
    <Link
      href={`./${user.login}`}
      className="group relative row-hover flex items-center gap-4 h-[72px] px-3 border-b border-primary-800 hover:bg-primary-800/60"
    >
      <span
        aria-hidden="true"
        className={clsx(
          'absolute top-2 left-0 w-2 h-2 border-2 border-b-0 border-r-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          isMod ? 'border-mod' : 'border-vip'
        )}
      />

      <Image
        src={user.avatar ?? ''}
        alt=""
        width={40}
        height={40}
        className="w-10 h-10 shrink-0 bg-primary-800"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-primary-100 truncate">{user.name}</span>
          <Badges badges={user.badges} size={16} />
        </div>
        <span className="mono text-xs text-primary-500">{stamp(user.granted)}</span>
      </div>

      {user?.follower !== null && (
        <Tooltip content={`${formatNumber(user.follower || 0)} follower`}>
          <span className="mono text-xs text-primary-500 shrink-0 cursor-help">
            {formatNumber(user.follower || 0)}
          </span>
        </Tooltip>
      )}
    </Link>
  );
};
