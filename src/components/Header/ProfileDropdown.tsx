'use client';

import { ItemElement } from '@react-types/shared';
import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Checkbox
} from '@nextui-org/react';
import { signIn, signOut } from 'next-auth/react';
import { getUserIgnoreState, setIgnoredUser } from '@/actions/userIgnoreState';
import { AvatarIcon, TwitchIcon } from '@/components/Icons';
import { constants } from '@/utils/constants';
import { Session } from 'next-auth';

interface ProfileDropdownProps {
  session: Session | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  session
}) => {
  const userId = session?.user?.id;
  const [isSelected, setIsSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialState = async () => {
      if (userId) {
        const ignoreState = await getUserIgnoreState(userId);
        setIsSelected(ignoreState);
        setLoading(false);
      }
    };

    fetchInitialState();
  }, [userId]);

  const handleIgnoreToggle = async () => {
    if (!userId) return;

    setLoading(true);
    await setIgnoredUser(userId, !isSelected);
    setIsSelected(!isSelected);
    setLoading(false);
  };

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
          name={session.user.name ?? 'Profile'}
          size="md"
          src={session.user.image ?? ''}
          fallback={<AvatarIcon size={40} />}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">

        <DropdownSection showDivider>
          <DropdownItem
            textValue="opt-out"
            onClick={handleIgnoreToggle}
            closeOnSelect={false}
            onAction={() => {
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-medium">opt-out</p>
                <p className="text-primary-500">from being tracked</p>
              </div>
              <Checkbox
                size="lg"
                isSelected={isSelected}
                isDisabled={loading}
                onChange={handleIgnoreToggle}
              />
            </div>
          </DropdownItem>
        </DropdownSection>

        {(session?.user?.perms ?? 0) >= constants.permissions.team ? (
          <DropdownSection showDivider>
            <DropdownItem textValue="dashboard" href={'/dashboard'}>
              dashboard
            </DropdownItem>
          </DropdownSection>
        ) : (
          (null as unknown as ItemElement<object>)
        )}

        <DropdownSection>
          <DropdownItem textValue="your channel" href={`/channel/${session.user.name}`}>
            your channel
          </DropdownItem>
          <DropdownItem textValue="your user" href={`/user/${session.user.name}`}>
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
