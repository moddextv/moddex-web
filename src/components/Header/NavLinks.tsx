'use client';

import { useI18n } from '@/i18n/context';
import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { HeartIcon } from '@/components/Icons';

// the corners are the two axes, not decoration — donate is neither
const LINKS = [
  { href: '/channel', key: 'pages.channels', corner: 'corner-tl', tone: 'text-mod' },
  { href: '/user', key: 'pages.accounts', corner: 'corner-br', tone: 'text-vip' }
] as const;

export const NavLinks: FC = () => {
  const pathname = usePathname();
  const { t, path } = useI18n();

  const at = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const donate = path('/donate');

  return (
    <nav className="flex items-center gap-1 min-w-0" aria-label={t('nav.main')}>
      {LINKS.map((link) => {
        const href = path(link.href);

        return (
          <Link
            key={link.href}
            href={href}
            aria-current={at(href) ? 'page' : undefined}
            className={clsx('nav-link', at(href) && 'is-active')}
          >
            <span aria-hidden="true" className={clsx('corner', link.corner, link.tone)} />
            {t(link.key)}
          </Link>
        );
      })}

      {/* a heart on a phone, where three words and the menu do not fit beside the mark */}
      <Link
        href={donate}
        aria-current={at(donate) ? 'page' : undefined}
        aria-label={t('pages.donate')}
        className={clsx('nav-link', at(donate) && 'is-active')}
      >
        <HeartIcon size={16} color="sm:hidden text-vip" />
        <span className="hidden sm:inline">{t('pages.donate')}</span>
      </Link>
    </nav>
  );
};
