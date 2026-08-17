'use client';

import { FC, useRef } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react';
import { signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Session } from 'next-auth';
import { DiscordIcon, MenuIcon, TwitchIcon } from '@/components/Icons';
import { config } from '@/config';
import { permissions } from '@/utils/permissions';
import { signInOptions } from '@/utils/signIn';

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

interface NavMenuProps {
  session: Session | null;
}

export const NavMenu: FC<NavMenuProps> = ({ session }) => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // heroui caches the menu, so a handler must read the theme through a ref
  const isDark = useRef(false);
  isDark.current = resolvedTheme === 'dark';

  const login = session?.user?.login ?? 'account';

  const here = (href: string) =>
    pathname === href
      ? { className: 'text-primary-100 font-semibold', 'aria-current': 'page' as const }
      : {};

  const account = session?.user
    ? [
        <DropdownItem key="profile" textValue="my profile" href={`/user/${login}`}>
          my profile
        </DropdownItem>,
        <DropdownItem key="settings" textValue="settings" href="/settings" {...here('/settings')}>
          settings
        </DropdownItem>,
        ...((session.user.perms ?? 0) >= permissions.team
          ? [
              <DropdownItem key="dashboard" textValue="dashboard" href="/dashboard">
                dashboard
              </DropdownItem>
            ]
          : []),
        <DropdownItem
          key="signout"
          className="text-red-500"
          color="danger"
          textValue="sign out"
          onPress={() => signOut()}
        >
          logout
        </DropdownItem>
      ]
    : [
        <DropdownItem
          key="signin"
          textValue="sign in with twitch"
          startContent={<TwitchIcon size={16} />}
          onPress={() => signIn('twitch', signInOptions(pathname))}
        >
          sign in with twitch
        </DropdownItem>
      ];

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
          aria-label="Menu"
          className="btn btn-ghost w-10 px-0 shrink-0 lg:hidden"
        >
          <MenuIcon size={20} />
        </button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Menu" variant="flat">
        <DropdownSection showDivider>{account}</DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem
            key="channels"
            textValue="browse channels"
            href="/channel"
            {...here('/channel')}
          >
            browse channels
          </DropdownItem>

          <DropdownItem key="accounts" textValue="browse accounts" href="/user" {...here('/user')}>
            browse accounts
          </DropdownItem>
        </DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem key="donate" textValue="donate" href="/donate" {...here('/donate')}>
            donate
          </DropdownItem>

          <DropdownItem
            key="discord"
            textValue="discord"
            href={config.brand.discordUrl}
            startContent={<DiscordIcon size={16} />}
            {...external}
          >
            discord
          </DropdownItem>
        </DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem
            key="theme"
            textValue="switch theme"
            closeOnSelect={false}
            onPress={() => setTheme(isDark.current ? 'light' : 'dark')}
          >
            switch theme
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem key="about" textValue="about" href="/about" {...here('/about')}>
            about
          </DropdownItem>

          <DropdownItem key="docs" textValue="api docs" href={config.brand.docsUrl} {...external}>
            api docs
          </DropdownItem>

          <DropdownItem key="status" textValue="status" href={config.brand.statusUrl} {...external}>
            status
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
