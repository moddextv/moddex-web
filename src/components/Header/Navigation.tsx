'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@heroui/react';
import { ExternalLinkIcon, MenuIcon } from '@/components/Icons';
import { config } from '@/config';
import clsx from 'clsx';

interface MenuItemProps {
  label: string;
  href: string;
  newTab?: boolean;
}

// `api` sits last and opens in a new tab because it leaves the site: /api/docs
// permanently redirects to api.moddex.tv/docs, where the docs are generated
// from the annotations beside the routes they describe. The internal path is
// kept rather than linking the external one directly, so the redirect stays the
// single place that knows where the docs live.
const menuItems: MenuItemProps[] = [
  { label: 'channel', href: '/channel' },
  { label: 'user', href: '/user' },
  { label: 'donate', href: '/donate' },
  { label: 'api', href: '/api/docs', newTab: true }
];

export const Navigation = () => {
  const currentPath = usePathname() || '';

  // the old version compared only the first path segment, so any route sharing
  // a prefix lit up the wrong item. compare whole segments instead.
  const isActive = (href: string) => {
    if (href.startsWith('http') || currentPath === '/') return false;
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <>
      <nav className="hidden md:flex items-center gap-1" aria-label="Main">
        {menuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                // the active marker is a corner tick — a single bracket from
                // the mark — rather than the usual underline
                'relative flex items-center gap-1 px-3 h-8 text-sm transition-colors duration-150',
                active ? 'tick text-primary-100' : 'text-primary-400 hover:text-primary-200'
              )}
            >
              {item.label}
              {item.newTab && <ExternalLinkIcon size={13} />}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden ml-auto">
        <Dropdown showArrow placement="bottom-end">
          <DropdownTrigger>
            <button
              aria-label="open navigation menu"
              className="flex items-center justify-center w-8 h-8 text-primary-300 pressable"
            >
              <MenuIcon size={20} />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Navigation" variant="flat">
            <DropdownSection>
              {menuItems.map((item) => (
                <DropdownItem
                  key={item.href}
                  textValue={item.label}
                  href={item.href}
                  target={item.newTab ? '_blank' : '_self'}
                  endContent={item.newTab ? <ExternalLinkIcon size={14} /> : null}
                  className={isActive(item.href) ? 'text-primary-100' : 'text-primary-300'}
                >
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
};
