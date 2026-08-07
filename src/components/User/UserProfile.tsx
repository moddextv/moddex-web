'use client';

import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/Interfaces';
import { formatMonthYearLong, formatNumber, formatRelative } from '@/utils/utils';
import { Image } from '@/components/UI/Image';
import { FC, useEffect, useState } from 'react';
import { DiscordIcon, ReloadIcon, TwitchIcon } from '@/components/Icons';
import { CopyButton } from '@/components/UI/CopyButton';
import { UserProfileLoading } from '@/components/User/UserProfileLoading';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/config';
import clsx from 'clsx';

/**
 * the two lookup directions, as tabs.
 *
 * this replaces the "as channel / as person" segmented control that used to sit
 * below the profile. the underline is the role's own colour — green reading
 * into the channel, pink reading out of the person — which is the identity
 * argument in one detail: the thing telling you which way round you are reading
 * is the mark's colour pair, not a borrowed purple.
 */
const DirectionTabs: FC<{ login: string; name: string; isUser: boolean }> = ({
  login,
  name,
  isUser
}) => (
  // the labels are full sentences because the two directions are genuinely easy
  // to confuse, but they do not fit side by side on a phone. the short forms
  // below `sm` say the same thing with the tab position carrying the rest.
  <nav className="tabs mt-8" aria-label="Which direction to read this account">
    <Link
      href={`/channel/${login}`}
      className="tab tab-mod"
      aria-current={isUser ? undefined : 'page'}
    >
      <span
        aria-hidden="true"
        className={clsx('corner corner-tl', isUser ? 'text-primary-600' : 'text-mod')}
      />
      <span className="sm:hidden">In this channel</span>
      <span className="hidden sm:inline">Holds roles in this channel</span>
    </Link>

    <Link
      href={`/user/${login}`}
      className="tab tab-vip"
      aria-current={isUser ? 'page' : undefined}
    >
      <span
        aria-hidden="true"
        className={clsx('corner corner-br', isUser ? 'text-vip' : 'text-primary-600')}
      />
      <span className="sm:hidden">Elsewhere</span>
      <span className="hidden sm:inline">Roles {name} holds elsewhere</span>
    </Link>
  </nav>
);

export const UserProfile: FC<{ user: User; isUser?: boolean }> = ({ user, isUser }) => {
  const { currentUser, loading, banReason, reloadUserProfile } = useUserProfileData(user);
  const [initialLogin] = useState(user.login);

  // read from the clock, so it cannot be part of the server render without
  // producing a hydration mismatch. it arrives on the first client pass instead.
  const [lastRead, setLastRead] = useState<string | null>(null);

  useEffect(() => {
    setLastRead(formatRelative(currentUser?.updated));
  }, [currentUser?.updated]);

  useEffect(() => {
    if (banReason) {
      window.location.reload();
    } else if (currentUser?.login && currentUser.login !== initialLogin) {
      redirect(currentUser.login);
    }
  }, [currentUser, initialLogin, banReason]);

  const login = currentUser?.login ?? user.login;
  const name = currentUser?.name ?? login;

  // the tabs are already known before the refetch answers, so they keep being
  // drawn around the skeleton rather than disappearing with it.
  if (loading) {
    return (
      <section className="pt-10 pb-8" aria-busy="true">
        <UserProfileLoading />
        <DirectionTabs login={user.login} name={user.name ?? user.login} isUser={!!isUser} />
      </section>
    );
  }

  return (
    <section className="enter pt-10 pb-8">
      <div className="flex flex-wrap items-start gap-6">
        <Image
          src={currentUser?.avatar ?? ''}
          alt=""
          width={88}
          height={88}
          radius="full"
          className="w-[88px] h-[88px] shrink-0 bg-primary-800"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-h1">{name}</h1>
            <Badges badges={currentUser?.badges || []} size={20} />
          </div>

          {currentUser?.bio && (
            <p className="text-read text-primary-300 max-w-prose mb-4 break-words">
              {currentUser.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-ui text-primary-400">
            {currentUser?.follower !== null && (
              <span>
                <span className="tabular text-primary-100 font-bold">
                  {formatNumber(currentUser?.follower || 0)}
                </span>{' '}
                followers
              </span>
            )}

            {currentUser?.created && (
              <span>
                joined{' '}
                <span className="tabular text-primary-200">
                  {formatMonthYearLong(currentUser.created)}
                </span>
              </span>
            )}

            {lastRead && (
              <span>
                last read <span className="text-primary-200">{lastRead}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* the glyph on a neutral button, not a filled purple one. as a solid
              purple button this was the brightest thing on the page and it
              pulled focus off the account name, which is the actual subject. */}
          <a
            href={`https://twitch.tv/${login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-twitch-quiet"
          >
            <TwitchIcon size={15} />
            Open on Twitch
          </a>

          {currentUser?.discord && (
            <a
              href={`https://discord.com/users/${currentUser.discord}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${login} on discord`}
              aria-label="Open on Discord"
              className="btn btn-soft w-10 p-0"
            >
              <DiscordIcon size={16} />
            </a>
          )}

          <CopyButton
            label="Copy short url"
            value={`${config.brand.url}/${isUser ? 'u' : 'c'}/${login}`}
          />

          <button
            type="button"
            title={
              isUser
                ? 'Read this profile again from twitch'
                : 'Read this channel again from twitch'
            }
            aria-label="Refresh"
            className="btn btn-soft w-10 p-0"
            onClick={() => reloadUserProfile(login, true)}
          >
            <ReloadIcon size={16} />
          </button>
        </div>
      </div>

      <DirectionTabs login={login} name={name} isUser={!!isUser} />
    </section>
  );
};
