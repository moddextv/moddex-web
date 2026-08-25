'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useI18n } from '@/i18n/context';

// the corners are the two axes, not decoration — a leaderboard is neither
const LINKS = [
  { href: '/channel', key: 'nav.channelsLink', corner: 'corner-tl', tone: 'text-mod', wide: false },
  { href: '/user', key: 'nav.accountsLink', corner: 'corner-br', tone: 'text-vip', wide: false },
  { href: '/leaderboard', key: 'nav.leaderboardLink', corner: null, tone: null, wide: true }
] as const;

export const NavLinks: FC = () => {
  const pathname = usePathname();
  const { t, path } = useI18n();

  return (
    <nav className="flex items-center gap-1 min-w-0" aria-label={t('nav.main')}>
      {LINKS.map((link) => {
        const href = path(link.href);
        const here = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={link.href}
            href={href}
            aria-current={here ? 'page' : undefined}
            className={clsx('nav-link', here && 'is-active', link.wide && 'hidden sm:inline-flex')}
          >
            {link.corner && (
              <span aria-hidden="true" className={clsx('corner', link.corner, link.tone)} />
            )}
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
};
