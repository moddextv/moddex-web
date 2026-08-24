'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// the corners are the two axes, not decoration — a leaderboard is neither
const LINKS = [
  { href: '/channel', label: 'Channels', corner: 'corner-tl', tone: 'text-mod', wide: false },
  { href: '/user', label: 'Accounts', corner: 'corner-br', tone: 'text-vip', wide: false },
  { href: '/leaderboard', label: 'Leaderboard', corner: null, tone: null, wide: true }
] as const;

export const NavLinks: FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 min-w-0" aria-label="Main">
      {LINKS.map((link) => {
        const here = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={here ? 'page' : undefined}
            className={clsx('nav-link', here && 'is-active', link.wide && 'hidden sm:inline-flex')}
          >
            {link.corner && (
              <span aria-hidden="true" className={clsx('corner', link.corner, link.tone)} />
            )}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
