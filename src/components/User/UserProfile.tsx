'use client';

import { Title } from '@/components/UI/Title';
import { Badges } from '@/components/User/Badges';
import { User } from '@/misc/Interfaces';
import { cn, formatDate } from '@/utils/utils';
import { Image, Snippet } from '@nextui-org/react';
import { FC } from 'react';
import { DiscordIcon, TwitchIcon } from '@/components/Icons';

export const UserProfile: FC<{ user: User; isUser?: boolean }> = ({
  user,
  isUser
}) => {
  return (
    <div className="max-w-lg mx-auto mb-12 flex flex-col gap-4 md:gap-8 md:flex-row justify-between">
      <div className="flex flex-row md:flex-col items-center gap-6">
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
      </div>

      <div className="flex-1">
        <Title className="flex flex-row items-center overflow-hidden text-ellipsis">
          <span>{user.name}</span>
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
        </Title>
        <Title
          level={3}
          className="overflow-hidden text-ellipsis text-large mb-2"
        >
          @{user.login}
        </Title>
        <Badges badges={user.badges} />
        <div className="overflow-hidden text-ellipsis mt-2">{user.bio}</div>
        <p className="text-sm text-primary-500">
          created on {formatDate(user.created)}
        </p>
      </div>
    </div>
  );
};
