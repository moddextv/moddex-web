import { useT } from '@/i18n/context';
import { FC } from 'react';
import { Badges } from '@/components/User/Badges';
import { RoleUser } from '@/misc/account';
import { UserType } from '@/misc/roles';
import { Avatar } from '@/components/UI/Avatar';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { EyeOffIcon } from '@/components/Icons';
import clsx from 'clsx';

interface UserListItemProps {
  user: RoleUser;
  type: UserType;
  onHide?: (id: string) => void;
}

export const UserListItem: FC<UserListItemProps> = ({ user, type, onHide }) => {
  const t = useT();
  const granted = t.date(user.grantedAt);

  return (
    <span className="relative block h-full">
      <LocaleLink
        href={`/${type === 'channel' ? 'user' : 'channel'}/${user.login}`}
        className={clsx('row cols-people h-full', onHide && 'pr-14')}
      >
        <span className="flex items-center gap-3.5 min-w-0">
          <Avatar src={user.avatar} name={user.name || user.login} size={36} className="w-9 h-9" />

          <span className="flex items-center gap-2 min-w-0">
            <span className="row-name text-base font-bold truncate">{user.name || user.login}</span>
            <Badges badges={user.badges} size={18} className="shrink-0 flex-nowrap" />
            {user.banned && (
              <span
                className="text-micro font-semibold uppercase tracking-wide text-vip shrink-0"
                title={user.banned.reason || undefined}
              >
                {t('misc.banned')}
              </span>
            )}
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

      {/* centred by the wrapper, never by a transform: .btn:active sets its own */}
      {onHide && (
        <span className="absolute inset-y-0 right-3 flex items-center">
          <button
            type="button"
            className="btn btn-soft w-8 h-8 p-0"
            title={t('profile.hide')}
            aria-label={t('profile.hideOf', { login: user.login })}
            onClick={() => onHide(user.id)}
          >
            <EyeOffIcon size={14} />
          </button>
        </span>
      )}
    </span>
  );
};
