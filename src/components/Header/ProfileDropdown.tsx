'use client';

import { ItemElement } from '@react-types/shared';
import { FC } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react';
import { signIn, signOut } from 'next-auth/react';
import { TwitchIcon } from '@/components/Icons';
import { Image } from '@/components/UI/Image';
import { constants } from '@/utils/constants';
import { Session } from 'next-auth';

interface ProfileDropdownProps {
  session: Session | null;
}

export const ProfileDropdown: FC<ProfileDropdownProps> = ({ session }) => {
  if (!session?.user) {
    return (
      // the one filled purple control on the site. signing in is the only thing
      // here that actually talks to twitch, and everything else that used to be
      // purple — "open on twitch", the tab underlines, the section headings —
      // is neutral or a role colour now.
      <button
        type="button"
        onClick={() => signIn('twitch')}
        className="btn btn-twitch shrink-0"
      >
        {/* TwitchIcon defaults to `text-twitch`, which on the filled purple
            button is purple on purple: the control rendered as an empty block
            at small widths, where the label is hidden and the glyph is all
            there is. */}
        <TwitchIcon size={15} color="text-white" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const login = session.user.login ?? 'account';

  return (
    <Dropdown showArrow placement="bottom-end" className="border border-primary-700">
      <DropdownTrigger>
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2.5 shrink-0 h-10 pl-1 pr-3 rounded-md text-primary-200 hover:bg-primary-700 hover:text-primary-100 transition-colors"
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={32}
              height={32}
              radius="full"
              className="w-8 h-8 bg-primary-700"
            />
          ) : (
            <span className="avatar w-8 h-8 text-meta" aria-hidden="true">
              {login.slice(0, 1)}
            </span>
          )}
          <span className="hidden sm:inline text-ui font-semibold">{login}</span>
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

          {(session?.user?.perms ?? 0) >= constants.permissions.team ? (
            <DropdownItem key="dashboard" textValue="dashboard" href="/dashboard">
              dashboard
            </DropdownItem>
          ) : (null as unknown as ItemElement<object>)}
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
