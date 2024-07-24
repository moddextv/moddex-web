import { Tooltip } from '@/components/UI/Tooltip';
import { FC } from 'react';
import { ClockIcon } from '@/components/Icons';
import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/Interfaces';
import { formatDate } from '@/utils/utils';
import { Image, Link } from '@nextui-org/react';

interface UserListItemProps {
  user: User;
}

export const UserListItem: FC<UserListItemProps> = ({ user }) => {
  return (
    <div className="flex gap-4 pr-4 pl-2 items-center">
      <Link href={`./${user.login}`}>
        <Image
          src={user.avatar}
          alt={`${user.login}'s avatar`}
          width={48}
          height={48}
          radius="full"
          className="w-12 h-12"
        />
      </Link>
      <div className="flex flex-row items-center flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden text-ellipsis hyphens-none">
          <Link
            href={`./${user.login}`}
            className="font-medium text-lg text-primary-300"
          >
            {user.name}
          </Link>
          <Badges badges={user.badges} size={25} />
        </div>
        <Tooltip content={`since ${formatDate(user.granted)}`}>
          <span className="cursor-pointer">
            <ClockIcon size={20} />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};
