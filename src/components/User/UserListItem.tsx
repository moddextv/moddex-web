import { FC } from 'react';
import { Badges } from '@/components/User/Badges';
import { RoleUser } from '@/misc/account';
import { UserType } from '@/misc/roles';
import { formatDayMonthYear, formatNumber } from '@/utils/format';
import { Image } from '@/components/UI/Image';
import Link from 'next/link';

interface UserListItemProps {
  user: RoleUser;
  type: UserType;
}

export const UserListItem: FC<UserListItemProps> = ({ user, type }) => {
  const granted = formatDayMonthYear(user.granted);

  return (
    <Link
      href={`/${type === 'channel' ? 'user' : 'channel'}/${user.login}`}
      className="row cols-people h-full"
    >
      <span className="flex items-center gap-3.5 min-w-0">
        <Image
          src={user.avatar ?? ''}
          alt={user.name || user.login}
          width={36}
          height={36}
          radius="full"
          className="w-9 h-9 shrink-0 bg-primary-700"
        />

        <span className="flex items-center gap-2 min-w-0">
          <span className="row-name text-base font-bold truncate">{user.name || user.login}</span>
          <Badges badges={user.badges} size={18} className="shrink-0 flex-nowrap" />
        </span>
      </span>

      {granted ? (
        <span className="text-ui text-primary-300 tabular text-right">{granted}</span>
      ) : (
        <span
          className="text-ui text-primary-400 text-right"
          title="Twitch returned no grant date for this role"
        >
          no date
        </span>
      )}

      <span className="text-ui text-primary-400 tabular text-right">
        {formatNumber(user.follower || 0)}
      </span>
    </Link>
  );
};
