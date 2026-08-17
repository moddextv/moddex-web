import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { DiscordIcon, ExternalLinkIcon, GitHubIcon } from '@/components/Icons';
import { config } from '@/config';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

const FooterLink: FC<{
  href: string;
  newTab?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}> = ({ href, newTab, icon, children }) => (
  <Link
    href={href}
    target={newTab ? '_blank' : undefined}
    rel={newTab ? 'noopener noreferrer' : undefined}
    className={`inline-flex items-center ${icon ? 'gap-2 ' : ''}text-ui text-primary-300 hover:text-primary-100 transition-colors`}
  >
    {icon}
    {children}
    {!icon && newTab && <ExternalLinkIcon size={14} />}
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
            <span className="text-h3 font-extrabold tracking-tight">{config.brand.name}</span>
          </div>
          <p className="text-ui text-primary-400 leading-relaxed">
            Every channel a Twitch account holds mod or vip in, and the day they got it. Not
            affiliated with, endorsed by, or sponsored by Twitch Interactive.
          </p>
          <div className="mt-5 flex flex-col items-start gap-2.5">
            <FooterLink
              href={config.brand.discordUrl}
              newTab
              icon={<DiscordIcon size={18} color="" />}
            >
              Join the Discord
            </FooterLink>
            <FooterLink href={config.brand.githubUrl} newTab icon={<GitHubIcon size={18} />}>
              {config.brand.name} on GitHub
            </FooterLink>
            <FooterLink href="/about" icon={<span className="w-[18px]" aria-hidden="true" />}>
              About {config.brand.name}
            </FooterLink>
            <FooterLink href="/donate" icon={<span className="w-[18px]" aria-hidden="true" />}>
              Donate
            </FooterLink>
          </div>
          <p className="mt-5 text-micro text-primary-400">
            &copy; {year} {config.brand.name}
          </p>
        </div>

        <div className="flex gap-14">
          <nav className="flex flex-col gap-2.5" aria-label="Look up">
            <p className="text-meta text-primary-400 mb-0.5">Look up</p>
            <FooterLink href="/channel">By channel</FooterLink>
            <FooterLink href="/user">By account</FooterLink>
            <FooterLink href={config.brand.docsUrl} newTab>
              API docs
            </FooterLink>
            <FooterLink href={config.brand.statusUrl} newTab>
              Status
            </FooterLink>
          </nav>

          <nav className="flex flex-col gap-2.5" aria-label="Your data">
            <p className="text-meta text-primary-400 mb-0.5">Your data</p>
            <FooterLink href="/settings">Opt out</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/tos">Terms</FooterLink>
          </nav>
        </div>
      </Container>
    </footer>
  );
};
