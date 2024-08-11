'use client';

import { ItemElement } from '@react-types/shared';
import { FC } from 'react';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@nextui-org/react';
import { signIn, signOut } from 'next-auth/react';
import { AvatarIcon, TwitchIcon } from '@/components/Icons';
import { constants } from '@/utils/constants';
import { Session } from 'next-auth';

interface ProfileDropdownProps {
  session: Session | null;
}

export const ProfileDropdown: FC<ProfileDropdownProps> = ({
  session
}) => {
  if (!session?.user) {
    return (
      <Button
        onClick={() => signIn('twitch')}
        startContent={<TwitchIcon size={20} color="text-primary-300" />}
        className="font-cairo text-medium bg-twitch"
      >
        login
      </Button>
    );
  }

  return (
    <Dropdown
      showArrow
      className="py-1 px-1 border border-default-200"
      placement="bottom-end"
      backdrop="opaque"
    >
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          name={session.user.login ?? 'Profile'}
          size="md"
          src={session.user.image ?? ''}
          fallback={<AvatarIcon size={40} />}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Links" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem textValue="settings" href={'/settings'}>
            settings
          </DropdownItem>

        {(session?.user?.perms ?? 0) >= constants.permissions.team ? (
            <DropdownItem textValue="dashboard" href={'/dashboard'}>
              dashboard
          </DropdownItem>
          ) : null as unknown as ItemElement<object>}
      </DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem textValue="your channel" href={`/channel/${session.user.login}`}>
            your channel
          </DropdownItem>
          <DropdownItem textValue="your user" href={`/user/${session.user.login}`}>
            your user
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
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
