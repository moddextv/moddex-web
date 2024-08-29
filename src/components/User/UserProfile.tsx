'use client';

import { Title } from '@/components/UI/Title';
import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/Interfaces';
import { formatDate, formatNumber } from '@/utils/utils';
import { Button, Snippet } from '@nextui-org/react';
import { Image } from '@/components/UI/Image';
import { FC, useEffect, useState } from 'react';
import { DiscordIcon, ReloadIcon, TwitchIcon } from '@/components/Icons';
import { Tooltip } from '@/components/UI/Tooltip';
import { UserProfileLoading } from '@/components/User/UserProfileLoading';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { redirect } from 'next/navigation';
import { ItemElement } from '@react-types/shared';

export const UserProfile: FC<{ user: User; isUser?: boolean }> = ({
  user,
  isUser
}) => {
  const { currentUser, loading, banReason, reloadUserProfile } = useUserProfileData(user);
  const [initialLogin, setInitialLogin] = useState(user.login);

  useEffect(() => {
    if (banReason) {
      window.location.reload();
    } else if (currentUser?.login && currentUser.login !== initialLogin) {
      redirect(currentUser.login);
    }
  }, [currentUser, initialLogin, banReason]);

  return (
    <>
      {loading ? (
        <UserProfileLoading />
      ) : (
        <div className="flex flex-col gap-4 md:gap-8 md:flex-row justify-between overflow-hidden">
          <div className="flex flex-row md:flex-col items-center gap-4">
            <Image
              className="w-16 h-16"
              radius="full"
              src={currentUser?.avatar ?? ''}
              alt={`${currentUser?.login}'s avatar`}
              width={64}
              height={64}
            />
            <div className="flex flex-row gap-2">
              <Snippet
                size="md"
                variant="bordered"
                hideSymbol={true}
                className="p-0 gap-0 w-8 h-8"
                tooltipProps={{
                  delay: 200,
                  offset: 8,
                  content: 'copy short-url to clipboard',
                  color: 'foreground',
                  className: 'font-medium'
                }}
                codeString={`https://mdc.lol/${isUser ? 'u' : 'c'}/${currentUser?.login}`}
              />
              <Tooltip content="reload profile details">
                <Button
                  className="cursor-pointer text-primary-50"
                  variant="bordered"
                  size="sm"
                  radius="md"
                  isIconOnly={true}
                  startContent={<ReloadIcon size={18} />}
                  onClick={() => reloadUserProfile(currentUser?.login || '', true)}
                />
              </Tooltip>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Title className="flex flex-row items-center overflow-hidden">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {currentUser?.name}
              </span>
              <div className="flex-shrink-0 ml-2 flex items-center">
                <a
                  href={`https://twitch.tv/${currentUser?.login}`}
                  title={`view ${currentUser?.login} on twitch`}
                  target="_blank"
                  className="ml-2"
                >
                  <TwitchIcon size={24} />
                </a>
                {currentUser?.discord ? (
                  <a
                    href={`https://discord.com/users/${currentUser.discord}`}
                    title={`view ${currentUser.login} on discord`}
                    target="_blank"
                    className="ml-2"
                  >
                    <DiscordIcon size={24} />
                  </a>
                ) : null as unknown as ItemElement<object>}
              </div>
            </Title>
            <Title
              level={3}
              className="overflow-hidden text-ellipsis whitespace-nowrap text-large mb-2"
            >
              @{currentUser?.login}
            </Title>
            <Badges badges={currentUser?.badges || []} size={28} />
            <div className="overflow-hidden text-ellipsis mt-2 break-all hyphens-auto">
              {currentUser?.bio}
            </div>
            {currentUser?.follower !== null ? (
              <p className="text-primary-500">
                {formatNumber(currentUser?.follower || 0)} follower
              </p>
            ) : null as unknown as ItemElement<object>}
            {currentUser?.created ? (
              <p className="text-sm text-primary-500">
                created on {formatDate(currentUser?.created)}
              </p>
            ) : null as unknown as ItemElement<object>}
          </div>
        </div>
      )}
    </>
  );
};
