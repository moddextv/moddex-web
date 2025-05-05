'use client';

import { usePathname } from 'next/navigation';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link } from '@heroui/react';
import { useState } from 'react';
import { ExternalLinkIcon, MenuIcon } from '@/components/Icons';

interface MenuItemProps {
  label: string;
  href: string;
  newTab?: boolean;
}

const getMenuItems = (): MenuItemProps[] => {
  return [
    { label: 'channel', href: '/channel' },
    { label: 'user', href: '/user' },
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

  const menuItems = getMenuItems();

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
                    <DropdownItem
                      key={index}
                      textValue={item.label}
                      href={item.href}
                      target={item.newTab ? '_blank' : '_self'}
                      endContent={item.newTab ? <ExternalLinkIcon /> : ''}
                    >
                      <span className={`text-xl font-cairo ${isActivePage ? 'text-primary-200' : 'text-primary-500'}`}>
                        {item.label}
                      </span>
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
