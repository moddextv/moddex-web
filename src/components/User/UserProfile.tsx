'use client';

import { Title } from '@/components/UI/Title';
import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/Interfaces';
import { formatDate } from '@/utils/utils';
import { Image, Snippet } from '@nextui-org/react';
import { FC } from 'react';
import { DiscordIcon, ReloadIcon, TwitchIcon } from '@/components/Icons';
import { Tooltip } from '@/components/UI/Tooltip';

export const UserProfile: FC<{ user: User; isUser?: boolean }> = ({
  user,
  isUser
}) => {
  return (
    <div className="mb-12 flex flex-col gap-4 md:gap-8 md:flex-row justify-between overflow-hidden">
      <div className="flex flex-row md:flex-col items-center gap-4">
        <Image
          className="w-16 h-16"
          radius="full"
          src={user.avatar}
          alt={`${user.login}'s avatar`}
          width={64}
          height={64}
        />
        <Snippet
          size="md"
          variant="bordered"
          hideSymbol={true}
          className="p-0 gap-0"
          tooltipProps={{
            offset: 10,
            delay: 200,
            showArrow: true,
            content: 'copy short-url to clipboard',
            color: 'foreground',
            className: 'font-medium'
          }}
          codeString={`https://mdc.lol/${isUser ? 'u' : 'c'}/${user.login}`}
        />
        <Tooltip content="reload profile details">
          <span className="cursor-pointer">
            <ReloadIcon size={20} />
          </span>
        </Tooltip>
      </div>

      <div className="flex-1 min-w-0">
        <Title className="flex flex-row items-center overflow-hidden">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {user.name}
          </span>
          <div className="flex-shrink-0 ml-2 flex items-center">
            <a
              href={`https://twitch.tv/${user.login}`}
              title={`view ${user.login} on twitch`}
              target="_blank"
              className="ml-2"
            >
              <TwitchIcon size={24} />
            </a>
            {user.discord && (
              <a
                href={`https://discord.com/users/${user.discord}`}
                title={`view ${user.login} on discord`}
                target="_blank"
                className="ml-2"
              >
                <DiscordIcon size={24} />
              </a>
            )}
          </div>
        </Title>
        <Title
          level={3}
          className="overflow-hidden text-ellipsis whitespace-nowrap text-large mb-2"
        >
          @{user.login}
        </Title>
        <Badges badges={user.badges} />
        <div className="overflow-hidden text-ellipsis mt-2 break-all hyphens-auto">
          {user.bio}
        </div>
        <p className="text-sm text-primary-500">
          created on {formatDate(user.created)}
        </p>
      </div>
    </div>
  );
};
