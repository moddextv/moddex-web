'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface NavLink {
    name: string;
    href: string;
    newTab?: boolean;
}

export function Header() {
    const currentPath = usePathname() || '';
    const [isOpen, setIsOpen] = useState(false);

    const splits = currentPath.split('/');
    const username = splits && splits[2] ? splits[2] : '';

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const navLinks: NavLink[] = [
        { name: 'channel', href: `/channel/${username}` },
        { name: 'user', href: `/user/${username}` },
        { name: 'donate', href: '/donate' },
        { name: 'discord', href: 'https://discord.gg/modchecker', newTab: true }
    ];

    const isActive = (link: NavLink) => currentPath.includes(link.name);
    const logoLink = splits && splits[1] ? `/${splits[1]}` : '/';

    return (
        <header>
            <div className="wrapper">
                <div className="logo">
                    <Link href={logoLink}>
                        <Image src="/img/logo.png" alt="Logo modchecker" width={175} height={42}/>
                    </Link>
                </div>
                <div className={`navigation ${isOpen ? 'open' : ''}`}>
                    <nav>
                        <ul>
                            {navLinks.map((link) => {
                                const target: string = link.newTab ? '_blank' : '_self'

                                return (
                                    <li key={link.name} className={isActive(link) ? 'active' : ''}>
                                        <Link href={link.href} target={target}>{link.name}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
                <label htmlFor="menu-toggle" className="menu-toggle" aria-label="Menu öffnen">
                    <input type="checkbox" id="menu-toggle" onClick={toggleMenu} onChange={() => {
                    }} checked={isOpen}/>
                    <span></span><span></span><span></span>
                </label>
            </div>
        </header>
    );
}