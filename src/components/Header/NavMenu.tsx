'use client';

import { FC, useRef } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Session } from 'next-auth';
import { ExternalLinkIcon, MenuIcon } from '@/components/Icons';
import { Image } from '@/components/UI/Image';
import { config } from '@/config';
import { permissions } from '@/utils/permissions';

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

  const user = session?.user;
  const login = user?.login ?? 'account';
  const label = user?.name?.trim() || login;

  const here = (href: string) =>
    pathname === href
      ? { className: 'text-primary-100 font-semibold', 'aria-current': 'page' as const }
      : {};

  const account = user
    ? [
        <DropdownItem key="profile" textValue="my profile" href={`/user/${login}`}>
          my profile
        </DropdownItem>,
        <DropdownItem key="settings" textValue="settings" href="/settings" {...here('/settings')}>
          settings
        </DropdownItem>,
        ...((user.perms ?? 0) >= permissions.team
          ? [
              <DropdownItem key="dashboard" textValue="dashboard" href="/dashboard">
                dashboard
              </DropdownItem>
            ]
          : [])
      ]
    : [];

  const close = user
    ? [
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
    : [];

  return (
    <Dropdown
      showArrow
      placement="bottom-end"
      shouldBlockScroll={false}
      className="border border-primary-700"
    >
      <DropdownTrigger>
        {user ? (
          <button
            type="button"
            aria-label="Menu"
            className="btn btn-ghost shrink-0 gap-2.5 pl-1 pr-1 md:pr-3"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'Your Twitch avatar'}
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
            <span className="hidden md:inline max-w-[14ch] truncate" title={label}>
              {label}
            </span>
          </button>
        ) : (
          <button type="button" aria-label="Menu" className="btn btn-ghost w-10 px-0 shrink-0">
            <MenuIcon size={20} />
          </button>
        )}
      </DropdownTrigger>

      <DropdownMenu aria-label="Menu" variant="flat">
        {[
          ...(account.length
            ? [
                <DropdownSection key="you" showDivider>
                  {account}
                </DropdownSection>
              ]
            : []),

          <DropdownSection key="browse" showDivider>
            <DropdownItem key="channels" textValue="channels" href="/channel" {...here('/channel')}>
              channels
            </DropdownItem>

            <DropdownItem key="accounts" textValue="accounts" href="/user" {...here('/user')}>
              accounts
            </DropdownItem>

            <DropdownItem
              key="leaderboard"
              textValue="leaderboard"
              href="/leaderboard"
              {...here('/leaderboard')}
            >
              leaderboard
            </DropdownItem>
          </DropdownSection>,

          <DropdownSection key="site" showDivider>
            <DropdownItem key="about" textValue="about" href="/about" {...here('/about')}>
              about
            </DropdownItem>

            <DropdownItem key="donate" textValue="donate" href="/donate" {...here('/donate')}>
              donate
            </DropdownItem>

            <DropdownItem
              key="discord"
              textValue="discord"
              href={config.brand.discordUrl}
              endContent={<ExternalLinkIcon size={14} />}
              {...external}
            >
              discord
            </DropdownItem>
          </DropdownSection>,

          <DropdownSection key="controls">
            {[
              <DropdownItem
                key="theme"
                textValue="switch theme"
                closeOnSelect={false}
                onPress={() => setTheme(isDark.current ? 'light' : 'dark')}
              >
                switch theme
              </DropdownItem>,
              ...close
            ]}
          </DropdownSection>
        ]}
      </DropdownMenu>
    </Dropdown>
  );
};
