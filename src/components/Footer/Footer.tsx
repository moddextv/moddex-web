import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

/**
 * the footer is where the nav list went. with the search occupying the header
 * on every page, a row of four links up there was competing for the same space
 * and losing; down here the same links read as a directory, and there is room
 * to say in one sentence what the site actually holds.
 */
const FooterLink: FC<{ href: string; newTab?: boolean; children: ReactNode }> = ({
  href,
  newTab,
  children
}) => (
  <Link
    href={href}
    target={newTab ? '_blank' : undefined}
    rel={newTab ? 'noopener noreferrer' : undefined}
    className="text-ui text-primary-300 hover:text-primary-100 transition-colors"
  >
    {children}
  </Link>
);

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-primary-700/70">
      <Container className="py-10 flex flex-col gap-8 lg:flex-row lg:justify-between">
        <div className="max-w-[42ch]">
          <div className="flex items-center gap-3 mb-3 text-primary-200">
            <Mark size={20} split />
            <span className="text-h3 font-extrabold tracking-tight">
              {config.brand.name}
            </span>
          </div>
          <p className="text-ui text-primary-400 leading-relaxed">
            Every channel a twitch account holds mod or vip in, and the day it was
            granted. Not affiliated with, endorsed by, or sponsored by Twitch
            Interactive.
          </p>
          <p className="mt-3 text-micro text-primary-400">
            &copy; {year} {config.brand.name}
          </p>
        </div>

        <div className="flex gap-14">
          <nav className="flex flex-col gap-2.5" aria-label="Look up">
            <p className="text-meta text-primary-400 mb-0.5">Look up</p>
            <FooterLink href="/channel">By channel</FooterLink>
            <FooterLink href="/user">By person</FooterLink>
            {/* the internal path, not api.moddex.tv/docs directly: /api/docs
                permanently redirects, so the redirect stays the single place
                that knows where the docs live. it leaves the site, so it opens
                in a new tab. */}
            <FooterLink href="/api/docs" newTab>
              API docs
            </FooterLink>
          </nav>

          <nav className="flex flex-col gap-2.5" aria-label="Your data">
            <p className="text-meta text-primary-400 mb-0.5">Your data</p>
            <FooterLink href="/settings">Opt out</FooterLink>
            <FooterLink href="/tos">Terms</FooterLink>
            <FooterLink href={config.brand.statusUrl} newTab>
              Status
            </FooterLink>
          </nav>
        </div>
      </Container>
    </footer>
  );
};
