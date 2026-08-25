'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useI18n } from '@/i18n/context';

const TABS = [
  { href: '/dashboard', key: 'dash.overview', adminOnly: false },
  { href: '/dashboard/badges', key: 'dash.badges', adminOnly: true },
  { href: '/dashboard/channels', key: 'dash.channels', adminOnly: true },
  { href: '/dashboard/donations', key: 'dash.donations', adminOnly: true },
  { href: '/dashboard/jobs', key: 'dash.jobs', adminOnly: true },
  { href: '/dashboard/audit', key: 'dash.audit', adminOnly: true }
];

export const DashboardNav: FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const pathname = usePathname();
  const { t, path } = useI18n();
  const tabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);

  return (
    <nav aria-label={t('dash.sections')} className="enter flex flex-wrap gap-2 pb-4 sm:pb-6">
      {tabs.map((tab) => {
        const href = path(tab.href);
        const active = pathname === href;

        return (
          <Link
            key={tab.href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={clsx('option', active && 'is-active')}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
};
