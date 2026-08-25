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
import { ChevronDownIcon, ExternalLinkIcon, MenuIcon } from '@/components/Icons';
import { Image } from '@/components/UI/Image';
import { config } from '@/config';
import { permissions } from '@/utils/permissions';
import { useI18n } from '@/i18n/context';
import { LOCALES, LOCALE_NAME, swapLocale } from '@/i18n/locales';

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

interface NavMenuProps {
  session: Session | null;
}

export const NavMenu: FC<NavMenuProps> = ({ session }) => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { t, locale, path } = useI18n();

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
        <DropdownItem key="profile" textValue={t('nav.profile')} href={path(`/user/${login}`)}>
          {t('nav.profile')}
        </DropdownItem>,
        <DropdownItem
          key="settings"
          textValue={t('nav.settings')}
          href={path('/settings')}
          {...here(path('/settings'))}
        >
          {t('nav.settings')}
        </DropdownItem>,
        ...((user.perms ?? 0) >= permissions.team
          ? [
              <DropdownItem
                key="dashboard"
                textValue={t('nav.dashboard')}
                href={path('/dashboard')}
              >
                {t('nav.dashboard')}
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
          textValue={t('nav.signOut')}
          onPress={() => signOut()}
        >
          {t('nav.signOut')}
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
            aria-label={t('nav.menu')}
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
            <ChevronDownIcon size={14} color="text-primary-400 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={t('nav.menu')}
            className="btn btn-ghost w-10 px-0 shrink-0"
          >
            <MenuIcon size={20} />
          </button>
        )}
      </DropdownTrigger>

      <DropdownMenu aria-label={t('nav.menu')} variant="flat">
        {[
          ...(account.length
            ? [
                <DropdownSection key="you" showDivider>
                  {account}
                </DropdownSection>
              ]
            : []),

          <DropdownSection key="browse" showDivider>
            <DropdownItem
              key="channels"
              textValue={t('nav.channels')}
              href={path('/channel')}
              {...here(path('/channel'))}
            >
              {t('nav.channels')}
            </DropdownItem>

            <DropdownItem
              key="accounts"
              textValue={t('nav.accounts')}
              href={path('/user')}
              {...here(path('/user'))}
            >
              {t('nav.accounts')}
            </DropdownItem>

            <DropdownItem
              key="leaderboard"
              textValue={t('nav.leaderboard')}
              href={path('/leaderboard')}
              {...here(path('/leaderboard'))}
            >
              {t('nav.leaderboard')}
            </DropdownItem>
          </DropdownSection>,

          <DropdownSection key="site" showDivider>
            <DropdownItem
              key="about"
              textValue={t('nav.about')}
              href={path('/about')}
              {...here(path('/about'))}
            >
              {t('nav.about')}
            </DropdownItem>

            <DropdownItem
              key="donate"
              textValue={t('nav.donate')}
              href={path('/donate')}
              {...here(path('/donate'))}
            >
              {t('nav.donate')}
            </DropdownItem>

            <DropdownItem
              key="discord"
              textValue={t('nav.discord')}
              href={config.brand.discordUrl}
              endContent={<ExternalLinkIcon size={14} />}
              {...external}
            >
              {t('nav.discord')}
            </DropdownItem>
          </DropdownSection>,

          <DropdownSection key="language" showDivider title={t('nav.language')}>
            {LOCALES.map((entry) => (
              <DropdownItem
                key={`locale-${entry}`}
                textValue={LOCALE_NAME[entry]}
                href={swapLocale(pathname, entry)}
                {...(entry === locale
                  ? { className: 'text-primary-100 font-semibold', 'aria-current': 'true' as const }
                  : {})}
              >
                {LOCALE_NAME[entry]}
              </DropdownItem>
            ))}
          </DropdownSection>,

          <DropdownSection key="controls">
            {[
              <DropdownItem
                key="theme"
                textValue="switch theme"
                closeOnSelect={false}
                onPress={() => setTheme(isDark.current ? 'light' : 'dark')}
              >
                <span className="theme-to-light">{t('nav.themeToLight')}</span>
                <span className="theme-to-dark">{t('nav.themeToDark')}</span>
              </DropdownItem>,
              ...close
            ]}
          </DropdownSection>
        ]}
      </DropdownMenu>
    </Dropdown>
  );
};
