'use client';

import { localeFlag, localeName, LOCALES, swapLocale } from '@/i18n/locales';
import { useI18n } from '@/i18n/context';
import { FC, useRef, useState } from 'react';
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
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  MenuIcon,
  MoonIcon,
  SunIcon
} from '@/components/Icons';
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
  const { t, locale, path } = useI18n();
  const [view, setView] = useState<'main' | 'language'>('main');

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
        <DropdownItem key="profile" textValue={t('pages.profile')} href={path(`/user/${login}`)}>
          {t('pages.profile')}
        </DropdownItem>,
        <DropdownItem
          key="settings"
          textValue={t('pages.settings')}
          href={path('/settings')}
          {...here(path('/settings'))}
        >
          {t('pages.settings')}
        </DropdownItem>,
        ...((user.perms ?? 0) >= permissions.team
          ? [
              <DropdownItem
                key="dashboard"
                textValue={t('pages.dashboard')}
                href={path('/dashboard')}
              >
                {t('pages.dashboard')}
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
      onClose={() => setView('main')}
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
                alt={user.name ?? t('nav.yourAvatar')}
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
        {view === 'language'
          ? [
              <DropdownSection key="back" showDivider>
                <DropdownItem
                  key="back"
                  isReadOnly
                  closeOnSelect={false}
                  textValue={t('nav.backToMenu')}
                  className="cursor-default p-0 data-[hover=true]:bg-transparent"
                >
                  <button type="button" className="menu-back" onClick={() => setView('main')}>
                    <ChevronLeftIcon size={13} color="text-primary-400 shrink-0" />
                    {t('nav.backToMenu')}
                  </button>
                </DropdownItem>
              </DropdownSection>,

              <DropdownSection key="locales" title={t('nav.language')}>
                {LOCALES.map((entry) => (
                  <DropdownItem
                    key={`locale-${entry}`}
                    href={swapLocale(pathname, entry)}
                    hrefLang={entry}
                    lang={entry}
                    textValue={localeName(entry)}
                    startContent={
                      <Image
                        src={localeFlag(entry)}
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={14}
                        radius="sm"
                        className="locale-flag"
                      />
                    }
                    endContent={
                      entry === locale ? <CheckIcon size={14} color="text-mod" /> : undefined
                    }
                    {...(entry === locale
                      ? {
                          className: 'text-primary-100 font-semibold',
                          'aria-current': 'true' as const
                        }
                      : {})}
                  >
                    {localeName(entry)}
                  </DropdownItem>
                ))}
              </DropdownSection>
            ]
          : [
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
                  textValue={t('pages.channels')}
                  href={path('/channel')}
                  {...here(path('/channel'))}
                >
                  {t('pages.channels')}
                </DropdownItem>

                <DropdownItem
                  key="accounts"
                  textValue={t('pages.accounts')}
                  href={path('/user')}
                  {...here(path('/user'))}
                >
                  {t('pages.accounts')}
                </DropdownItem>

                <DropdownItem
                  key="leaderboard"
                  textValue={t('pages.leaderboard')}
                  href={path('/leaderboard')}
                  {...here(path('/leaderboard'))}
                >
                  {t('pages.leaderboard')}
                </DropdownItem>
              </DropdownSection>,

              <DropdownSection key="site" showDivider>
                <DropdownItem
                  key="about"
                  textValue={t('pages.about', { brandName: config.brand.name })}
                  href={path('/about')}
                  {...here(path('/about'))}
                >
                  {t('pages.about', { brandName: config.brand.name })}
                </DropdownItem>

                <DropdownItem
                  key="donate"
                  textValue={t('pages.donate')}
                  href={path('/donate')}
                  {...here(path('/donate'))}
                >
                  {t('pages.donate')}
                </DropdownItem>

                <DropdownItem
                  key="discord"
                  textValue={t('pages.discord')}
                  href={config.brand.discordUrl}
                  endContent={<ExternalLinkIcon size={14} />}
                  {...external}
                >
                  {t('pages.discord')}
                </DropdownItem>
              </DropdownSection>,

              <DropdownSection key="controls" showDivider={Boolean(close.length)}>
                {[
                  <DropdownItem
                    key="preferences"
                    isReadOnly
                    closeOnSelect={false}
                    textValue={t('nav.language')}
                    className="cursor-default data-[hover=true]:bg-transparent"
                  >
                    <div className="menu-controls">
                      <button
                        type="button"
                        className="locale-trigger"
                        aria-label={t('nav.language')}
                        onClick={() => setView('language')}
                      >
                        <Image
                          src={localeFlag(locale)}
                          alt=""
                          aria-hidden="true"
                          width={20}
                          height={14}
                          radius="sm"
                          className="locale-flag"
                        />
                        <span className="truncate">{localeName(locale)}</span>
                        <ChevronRightIcon size={13} color="text-primary-400 shrink-0" />
                      </button>

                      <button
                        type="button"
                        className="theme-toggle"
                        aria-label={t('nav.themeToggle')}
                        onClick={() => setTheme(isDark.current ? 'light' : 'dark')}
                      >
                        <span className="theme-to-light">
                          <SunIcon size={17} />
                        </span>
                        <span className="theme-to-dark">
                          <MoonIcon size={17} />
                        </span>
                      </button>
                    </div>
                  </DropdownItem>,
                  ...close
                ]}
              </DropdownSection>
            ]}
      </DropdownMenu>
    </Dropdown>
  );
};
