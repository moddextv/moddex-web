import { useT } from '@/i18n/context';
import { FC } from 'react';
import { Badges } from '@/components/User/Badges';
import { RoleUser } from '@/misc/account';
import { UserType } from '@/misc/roles';
import { Avatar } from '@/components/UI/Avatar';
import { LocaleLink } from '@/components/UI/LocaleLink';

interface UserListItemProps {
  user: RoleUser;
  type: UserType;
}

export const UserListItem: FC<UserListItemProps> = ({ user, type }) => {
  const t = useT();
  const granted = t.date(user.grantedAt);

  return (
    <LocaleLink
      href={`/${type === 'channel' ? 'user' : 'channel'}/${user.login}`}
      className="row cols-people h-full"
    >
      <span className="flex items-center gap-3.5 min-w-0">
        <Avatar src={user.avatar} name={user.name || user.login} size={36} className="w-9 h-9" />

        <span className="flex items-center gap-2 min-w-0">
          <span className="row-name text-base font-bold truncate">{user.name || user.login}</span>
          <Badges badges={user.badges} size={18} className="shrink-0 flex-nowrap" />
        </span>
      </span>

      {granted ? (
        <span className="text-ui text-primary-300 tabular text-right">{granted}</span>
      ) : (
        <span className="text-ui text-primary-400 text-right" title={t('profile.noGrantDate')}>
          {t('roleCheck.noDate')}
        </span>
      )}

      <span className="text-ui text-primary-400 tabular text-right">
        {t.number(user.followers || 0)}
      </span>
    </LocaleLink>
  );
};
