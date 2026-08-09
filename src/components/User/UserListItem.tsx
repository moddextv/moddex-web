import { FC } from 'react';
import { Badges } from '@/components/User/Badges';
import { User, UserType } from '@/misc/Interfaces';
import { formatDayMonthYear, formatNumber } from '@/utils/utils';
import { Image } from '@/components/UI/Image';
import Link from 'next/link';

interface UserListItemProps {
  user: User;
  type: UserType;
}

/**
 * one row of a list. a grid cell on the shared `.cols-people` template, not a
 * table row: no borders, no zebra, nothing between it and the next row but air.
 * hover paints the whole row and underlines the name, so it reads as a link
 * rather than as a selection.
 *
 * the link crosses to the other axis on purpose. a moderator listed on a
 * channel page is interesting for where *else* they moderate, so the row goes
 * to /user/<login>; a channel listed on a person's page goes to /channel/.
 */
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
          alt=""
          width={36}
          height={36}
          radius="full"
          className="w-9 h-9 shrink-0 bg-primary-700"
        />

        <span className="flex items-center gap-2 min-w-0">
          <span className="row-name text-base font-bold truncate">
            {user.name || user.login}
          </span>
          {/* the bot marker is a badge now, not a text chip beside the badges —
              two ways of saying "something is true about this account" sitting
              next to each other read as two unrelated things. */}
          <Badges badges={user.badges} bot={user.bot} size={18} className="shrink-0 flex-nowrap" />
        </span>
      </span>

      {/* twitch returns no grant date for a good share of older roles. the cell
          says so in words rather than printing a dash the reader has to decode. */}
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
