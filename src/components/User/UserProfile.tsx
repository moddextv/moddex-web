'use client';

import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/account';
import { formatMonthYearLong, formatNumber, formatRelative } from '@/utils/format';
import { displayBio } from '@/utils/text';
import { Avatar } from '@/components/UI/Avatar';
import { FC, useEffect, useState } from 'react';
import { useI18n } from '@/i18n/context';
import { DiscordIcon, ReloadIcon, TwitchIcon } from '@/components/Icons';
import { CopyButton } from '@/components/UI/CopyButton';
import { UserProfileLoading } from '@/components/User/UserProfileLoading';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/config';
import clsx from 'clsx';

const DirectionTabs: FC<{ login: string; isUser: boolean }> = ({ login, isUser }) => {
  const { t, path } = useI18n();

  return (
    <nav className="tabs mt-8" aria-label={t('profile.directionLabel')}>
      <Link
        href={path(`/channel/${login}`)}
        className="tab tab-mod"
        aria-current={isUser ? undefined : 'page'}
      >
        <span
          aria-hidden="true"
          className={clsx('corner corner-tl', isUser ? 'text-primary-600' : 'text-mod')}
        />
        <span className="sm:hidden">{t('profile.inChannelShort')}</span>
        <span className="hidden sm:inline">{t('profile.inChannel')}</span>
      </Link>

      <Link
        href={path(`/user/${login}`)}
        className="tab tab-vip"
        aria-current={isUser ? 'page' : undefined}
      >
        <span
          aria-hidden="true"
          className={clsx('corner corner-br', isUser ? 'text-vip' : 'text-primary-600')}
        />
        <span className="sm:hidden">{t('profile.elsewhereShort')}</span>
        <span className="hidden sm:inline">{t('profile.elsewhere')}</span>
      </Link>
    </nav>
  );
};

export const UserProfile: FC<{ user: User; isUser?: boolean }> = ({ user, isUser }) => {
  const { t } = useI18n();
  const { currentUser, loading, banReason, reloadUserProfile } = useUserProfileData(user);
  const router = useRouter();

  useEffect(() => {
    const current = currentUser?.login;

    if (!current || current === user.login) return;

    router.replace(`/${isUser ? 'user' : 'channel'}/${current}`);
  }, [currentUser?.login, user.login, isUser, router]);

  const [lastRead, setLastRead] = useState<string | null>(null);

  useEffect(() => {
    setLastRead(formatRelative(currentUser?.updatedAt));
  }, [currentUser?.updatedAt]);

  useEffect(() => {
    if (banReason) window.location.reload();
  }, [banReason]);

  const login = currentUser?.login ?? user.login;
  const name = currentUser?.name ?? login;
  const id = currentUser?.id ?? user.id;
  const bio = displayBio(currentUser?.bio);

  if (loading) {
    return (
      <section className="pt-10" aria-busy="true">
        <UserProfileLoading />
        <DirectionTabs login={user.login} isUser={!!isUser} />
      </section>
    );
  }

  return (
    <section className="enter pt-10">
      <div className={clsx('profile-head', bio && 'has-bio')}>
        <Avatar
          src={currentUser?.avatar}
          name={currentUser?.name || currentUser?.login || ''}
          size={88}
          className="profile-avatar w-16 h-16 sm:w-[88px] sm:h-[88px]"
        />

        <div className="profile-identity min-w-0">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h1 className="text-h1 min-w-0 break-words">{name}</h1>
            <Badges badges={currentUser?.badges || []} />
          </div>
          <p className="mt-0.5 flex items-baseline gap-2 flex-wrap min-w-0">
            <span className="text-base font-mono text-primary-300 min-w-0 break-all">@{login}</span>
            <span className="text-base text-primary-400 tabular">#{id}</span>
          </p>
        </div>

        {bio && (
          <p className="profile-bio text-read text-primary-300 max-w-prose break-words">{bio}</p>
        )}

        <div className="profile-facts flex flex-wrap items-center gap-x-7 gap-y-2 text-ui text-primary-400">
          {currentUser?.followers !== null && (
            <span>
              <span className="tabular text-primary-100 font-bold">
                {formatNumber(currentUser?.followers || 0)}
              </span>{' '}
              {t('profile.followers', { count: currentUser?.followers || 0 })}
            </span>
          )}

          {currentUser?.createdAt && (
            <span>
              {t('profile.joined')}{' '}
              <span className="tabular text-primary-200">
                {formatMonthYearLong(currentUser.createdAt)}
              </span>
            </span>
          )}

          {lastRead && (
            <span>
              {t('profile.rolesRead')} <span className="text-primary-200">{lastRead}</span>
            </span>
          )}
        </div>

        <div className="profile-actions flex items-center gap-2 flex-wrap">
          <a
            href={`https://twitch.tv/${login}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('profile.openTwitch')}
            className="btn btn-twitch-quiet w-10 p-0 sm:w-auto sm:px-[18px]"
          >
            <TwitchIcon size={18} />
            <span className="hidden sm:inline">{t('profile.openTwitch')}</span>
          </a>

          {currentUser?.discord && (
            <a
              href={`https://discord.com/users/${currentUser.discord}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${login} on discord`}
              aria-label={t('profile.openDiscord')}
              className="btn btn-soft w-10 p-0"
            >
              <DiscordIcon size={18} />
            </a>
          )}

          <CopyButton
            label={t('profile.copyShortUrl')}
            value={`${config.brand.url}/${isUser ? 'u' : 'c'}/${login}`}
          />

          <button
            type="button"
            title={isUser ? t('profile.refreshProfile') : t('profile.refreshChannel')}
            aria-label={t('profile.refresh')}
            className="btn btn-soft w-10 p-0"
            onClick={() => reloadUserProfile(login, true, true)}
          >
            <ReloadIcon size={16} />
          </button>
        </div>
      </div>

      <DirectionTabs login={login} isUser={!!isUser} />
    </section>
  );
};
