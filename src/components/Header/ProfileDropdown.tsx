'use client';

import { FC } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react';
import { signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { TwitchIcon } from '@/components/Icons';
import { Image } from '@/components/UI/Image';
import { permissions } from '@/utils/permissions';
import { signInOptions } from '@/utils/signIn';
import { Session } from 'next-auth';

interface ProfileDropdownProps {
  session: Session | null;
}

export const ProfileDropdown: FC<ProfileDropdownProps> = ({ session }) => {
  const pathname = usePathname();

  if (!session?.user) {
    const options = signInOptions(pathname);

    return (
      <button
        type="button"
        onClick={() => signIn('twitch', options)}
        className="btn btn-twitch shrink-0"
      >
        <TwitchIcon size={18} color="text-white" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const login = session.user.login ?? 'account';

  const label = session.user.name?.trim() || login;

  return (
    <Dropdown
      showArrow
      placement="bottom-end"
      shouldBlockScroll={false}
      className="border border-primary-700"
    >
      <DropdownTrigger>
        <button
          type="button"
          aria-label="Account menu"
          className="btn btn-ghost shrink-0 gap-2.5 pl-1 pr-3"
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'Your Twitch avatar'}
              width={32}
              height={32}
              radius="full"
              className="w-8 h-8 bg-primary-700"
            />
          ) : (
            <span className="avatar w-8 h-8 text-meta" aria-hidden="true">
              {label.slice(0, 1)}
            </span>
          )}
          <span className="hidden sm:inline max-w-[14ch] truncate" title={label}>
            {label}
          </span>
        </button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Account" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem key="profile" textValue="my profile" href={`/user/${login}`}>
            my profile
          </DropdownItem>

          <DropdownItem key="settings" textValue="settings" href="/settings">
            settings
          </DropdownItem>

          {(session?.user?.perms ?? 0) >= permissions.team ? (
            <DropdownItem key="dashboard" textValue="dashboard" href="/dashboard">
              dashboard
            </DropdownItem>
          ) : null}
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
            key="signout"
            className="text-red-500"
            color="danger"
            textValue="sign out"
            onClick={() => signOut()}
          >
            logout
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
