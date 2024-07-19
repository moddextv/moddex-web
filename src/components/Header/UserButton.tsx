'use client';

import { AvatarIcon, TwitchIcon } from '@/components/Icons';
import { IgnoredSwitch } from '@/components/Switches/IgnoredSwitch';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@nextui-org/react';
import { Session } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUserIgnoreState } from '@/actions/userIgnoreState';
import { Link } from '@nextui-org/react';
import { constants } from '@/utils/constants';

export const UserButton = ({ session }: { session: Session | null }) => {
  const { data: sessionData } = useSession();
  const userId = sessionData?.user?.id;

  const [initialIgnoreState, setInitialIgnoreState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialState = async () => {
      if (userId) {
        const ignoreState = await getUserIgnoreState(userId);
        setInitialIgnoreState(ignoreState);
        setLoading(false);
      }
    };

    fetchInitialState();
  }, [userId]);

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
      showArrow={true}
      classNames={{ content: 'py-1 px-1 border border-default-200' }}
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
            isReadOnly
            key="ignored"
            className="cursor-default"
            description="opt-out of being tracked"
            endContent={
              !loading && <IgnoredSwitch initialState={initialIgnoreState} />
            }
          >
            opt-out
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          {(session?.user?.perms ?? 0) >= constants.permissions.staff ? (
            <DropdownItem key="dashboard">
              <Link className="text-primary-200" href={'/dashboard'}>
                dashboard
              </Link>
            </DropdownItem>
          ) : (
            <></>
          )}

          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            onClick={() => signOut()}
          >
            logout
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
