'use client';

import { usePathname } from 'next/navigation';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link
} from '@nextui-org/react';
import { useState } from 'react';
import { ExternalLinkIcon, MenuIcon } from '@/components/Icons';

interface MenuItemProps {
  label: string;
  href: string;
  newTab?: boolean;
}

const getMenuItems = (pathname: string): MenuItemProps[] => {
  const segments = pathname.split('/');
  const username = segments[2] || '';

  return [
    {
      label: 'channel',
      href: segments[1] === 'user' ? `/channel/${username}` : '/channel'
    },
    {
      label: 'user',
      href: segments[1] === 'channel' ? `/user/${username}` : '/user'
    },
    { label: 'donate', href: '/donate' },
    {
      label: 'discord',
      href: 'https://discord.com/invite/modchecker',
      newTab: true
    }
  ];
};

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPath = usePathname() || '';
  const basePath = currentPath.split('/')[1];

  const menuItems = getMenuItems(currentPath);

  const isActive = (href: string) => {
    if (currentPath === '/') return false;
    const baseHref = href.split('/')[1];
    return baseHref === basePath;
  };

  return (
    <>
      <ul className="hidden md:flex gap-4 items-center">
        {menuItems.map((item, index) => {
          const isActivePage = isActive(item.href);
          return (
            <li key={index} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Link
                className={`text-2xl font-cairo ${isActivePage ? 'text-primary-200' : 'text-primary-400'}`}
                href={item.href}
                isExternal={item.newTab}
                showAnchorIcon={item.newTab}
                anchorIcon={<ExternalLinkIcon size={24} />}
                underline="hover"
                size="lg"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end">
        <div className="md:hidden">
          <Dropdown showArrow={true} placement="bottom-end" backdrop="opaque">
            <DropdownTrigger>
              <Button
                aria-label="open navigation menu"
                className="flex items-center justify-center"
                isIconOnly={true}
                variant="light"
              >
                <MenuIcon size={22} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Navigation" variant="flat">
              <DropdownSection>
                {menuItems.map((item, index) => {
                  const isActivePage = isActive(item.href);
                  return (
                    <DropdownItem key={index} textValue={item.label}>
                      <Link
                        className={`text-xl font-cairo ${isActivePage ? 'text-primary-200' : 'text-primary-500'}`}
                        href={item.href}
                        isExternal={item.newTab}
                        showAnchorIcon={item.newTab}
                        anchorIcon={<ExternalLinkIcon />}
                        size="lg"
                      >
                        {item.label}
                      </Link>
                    </DropdownItem>
                  );
                })}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </>
  );
};
