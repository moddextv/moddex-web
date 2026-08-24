'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const TABS = [
  { href: '/dashboard', label: 'Overview', adminOnly: false },
  { href: '/dashboard/badges', label: 'Badges', adminOnly: true },
  { href: '/dashboard/channels', label: 'Channels', adminOnly: true },
  { href: '/dashboard/donations', label: 'Donations', adminOnly: true },
  { href: '/dashboard/jobs', label: 'Jobs', adminOnly: true }
];

export const DashboardNav: FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const path = usePathname();
  const tabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);

  return (
    <nav aria-label="Dashboard sections" className="enter flex flex-wrap gap-2 pb-4 sm:pb-6">
      {tabs.map((tab) => {
        const active = path === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={clsx('option', active && 'is-active')}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};
