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
} from '@heroui/react';
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
      // this used to be bg-primary-800 on a primary-900 header -- #111113 on
      // #0B0B0C, six RGB values apart -- on the reasoning that a purple button
      // competes with mod green and vip pink. it did not compete with anything,
      // because it was invisible: no button shape, just a faint word in the
      // corner. signing in is the one action the header exists to offer, so it
      // gets the brand colour. 6.2:1 for the label, 3.1:1 against the header.
      <Button
        onClick={() => signIn('twitch')}
        size="sm"
        radius="sm"
        startContent={<TwitchIcon size={16} />}
        className="pressable bg-twitch text-white font-medium data-[hover=true]:bg-twitch data-[hover=true]:brightness-110"
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
          className="transition-transform bg-primary-700 text-primary-200"
          name={session.user.login ?? 'Profile'}
          size="md"
          src={session.user.image ?? ''}
          // the icon draws with fill="currentColor" and no class of its own, so
          // without an explicit colour it inherited whatever was ambient and
          // vanished against the header.
          fallback={<AvatarIcon size={28} color="text-primary-200" />}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Links" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem
            key="profile"
            textValue="my profile"
            href={`/user/${session.user.login}`}
          >
            my profile
          </DropdownItem>

          <DropdownItem key="settings" textValue="settings" href={'/settings'}>
            settings
          </DropdownItem>

        {(session?.user?.perms ?? 0) >= constants.permissions.team ? (
            <DropdownItem key="dashboard" textValue="dashboard" href={'/dashboard'}>
              dashboard
          </DropdownItem>
          ) : null as unknown as ItemElement<object>}
      </DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem key="channel" textValue="your channel" href={`/channel/${session.user.login}`}>
            your channel
          </DropdownItem>
          <DropdownItem key="user" textValue="your user" href={`/user/${session.user.login}`}>
            your user
          </DropdownItem>
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
