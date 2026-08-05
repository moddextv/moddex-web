'use client';

import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/Interfaces';
import { formatDate, formatNumber } from '@/utils/utils';
import { Snippet } from '@heroui/react';
import { Image } from '@/components/UI/Image';
import { FC, useEffect, useState } from 'react';
import { DiscordIcon, ReloadIcon, TwitchIcon } from '@/components/Icons';
import { Tooltip } from '@/components/UI/Tooltip';
import { UserProfileLoading } from '@/components/User/UserProfileLoading';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/config';
import clsx from 'clsx';

/**
 * the direction toggle replaces the old "view user" / "view channel" button
 * that sat below the profile. the product answers the same question in two
 * directions, so making that a persistent two-state control — rather than a
 * button that navigates away — is what makes the pairing legible.
 */
const DirectionToggle: FC<{ login: string; isUser: boolean }> = ({ login, isUser }) => (
  // the mark is one relationship read from two ends; this control is the
  // literal version of that, so it gets the mark's own colour split
  <div className="inline-flex bg-primary-800 border border-primary-700 text-sm mono">
    {[
      { label: 'as channel', href: `/channel/${login}`, active: !isUser, tone: 'mod' },
      { label: 'as person', href: `/user/${login}`, active: isUser, tone: 'vip' }
    ].map((option) => (
      <Link
        key={option.href}
        href={option.href}
        aria-current={option.active ? 'page' : undefined}
        className={clsx(
          'px-3 h-8 flex items-center gap-2 transition-colors duration-150',
          option.active ? 'bg-primary-700 text-primary-100' : 'text-primary-500 hover:text-primary-300'
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'w-2 h-2 border-2',
            option.tone === 'mod' ? 'border-b-0 border-r-0' : 'border-t-0 border-l-0',
            option.active
              ? option.tone === 'mod'
                ? 'border-mod'
                : 'border-vip'
              : 'border-primary-600'
          )}
        />
        {option.label}
      </Link>
    ))}
  </div>
);

export const UserProfile: FC<{ user: User; isUser?: boolean }> = ({ user, isUser }) => {
  const { currentUser, loading, banReason, reloadUserProfile } = useUserProfileData(user);
  const [initialLogin] = useState(user.login);

  useEffect(() => {
    if (banReason) {
      window.location.reload();
    } else if (currentUser?.login && currentUser.login !== initialLogin) {
      redirect(currentUser.login);
    }
  }, [currentUser, initialLogin, banReason]);

  if (loading) return <UserProfileLoading />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <Image
          className="w-16 h-16 shrink-0 bg-primary-800"
          src={currentUser?.avatar ?? ''}
          alt=""
          width={64}
          height={64}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-cairo text-3xl tracking-tight leading-none">
              {currentUser?.name}
            </h1>
            <a
              href={`https://twitch.tv/${currentUser?.login}`}
              title={`view ${currentUser?.login} on twitch`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-twitch transition-colors duration-150"
            >
              <TwitchIcon size={20} />
            </a>
            {currentUser?.discord && (
              <a
                href={`https://discord.com/users/${currentUser.discord}`}
                title={`view ${currentUser.login} on discord`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-discord transition-colors duration-150"
              >
                <DiscordIcon size={20} />
              </a>
            )}
          </div>

          <p className="text-primary-400 mb-2">@{currentUser?.login}</p>

          <Badges badges={currentUser?.badges || []} size={22} />

          {currentUser?.bio && (
            <p className="mt-3 max-w-xl text-primary-300 break-words">{currentUser.bio}</p>
          )}

          <p className="mt-2 text-sm text-primary-500 tabular">
            {currentUser?.follower !== null && (
              <span>{formatNumber(currentUser?.follower || 0)} follower</span>
            )}
            {currentUser?.created && <span> · joined {formatDate(currentUser.created)}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <DirectionToggle login={currentUser?.login || ''} isUser={!!isUser} />

        <Snippet
          size="sm"
          variant="flat"
          hideSymbol
          className="p-0 gap-0 w-8 h-8 min-w-8 bg-primary-800 border border-primary-700 rounded-none"
          tooltipProps={{
            delay: 200,
            offset: 8,
            content: 'copy short url',
            color: 'foreground',
            className: 'font-medium'
          }}
          codeString={`${config.brand.url}/${isUser ? 'u' : 'c'}/${currentUser?.login}`}
        />

        <Tooltip content="reload profile details">
          <button
            type="button"
            aria-label="reload profile details"
            className="flex items-center justify-center w-8 h-8 bg-primary-800 border border-primary-700 text-primary-300 hover:text-primary-100 transition-colors duration-150 pressable"
            onClick={() => reloadUserProfile(currentUser?.login || '', true)}
          >
            <ReloadIcon size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
