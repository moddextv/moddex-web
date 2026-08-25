import { getTranslator, Locale } from '@/i18n';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { DiscordIcon, ExternalLinkIcon, GitHubIcon } from '@/components/Icons';
import { config } from '@/config';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { FC, ReactNode } from 'react';

const FooterLink: FC<{
  href: string;
  newTab?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}> = ({ href, newTab, icon, children }) => (
  <LocaleLink
    href={href}
    target={newTab ? '_blank' : undefined}
    rel={newTab ? 'noopener noreferrer' : undefined}
    className={`inline-flex items-center ${icon ? 'gap-2 ' : ''}text-ui text-primary-300 hover:text-primary-100 transition-colors`}
  >
    {icon}
    {children}
    {!icon && newTab && <ExternalLinkIcon size={14} />}
  </LocaleLink>
);

export const Footer: FC<{ locale: Locale }> = ({ locale }) => {
  const t = getTranslator(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-primary-700/70">
      <Container className="pt-10 pb-8 flex flex-col gap-8 lg:flex-row lg:justify-between">
        <div className="max-w-[42ch]">
          <div className="flex items-center gap-3 mb-3 text-primary-200">
            <Mark size={20} split />
            <span className="text-h3 font-extrabold tracking-tight">{config.brand.name}</span>
          </div>
          <p className="text-ui text-primary-400 leading-relaxed">{t('footer.blurb')}</p>
          <div className="mt-5 flex flex-col items-start gap-2.5">
            <FooterLink href="/about" icon={<span className="w-[18px]" aria-hidden="true" />}>
              {t('footer.about', { brandName: config.brand.name })}
            </FooterLink>
            <FooterLink href="/donate" icon={<span className="w-[18px]" aria-hidden="true" />}>
              {t('footer.donate')}
            </FooterLink>
            <FooterLink
              href={config.brand.discordUrl}
              newTab
              icon={<DiscordIcon size={18} color="" />}
            >
              {t('footer.joinDiscord')}
            </FooterLink>
            <FooterLink href={config.brand.githubUrl} newTab icon={<GitHubIcon size={18} />}>
              {t('footer.onGitHub', { brandName: config.brand.name })}
            </FooterLink>
          </div>
        </div>

        <div className="flex gap-14">
          <nav className="flex flex-col gap-2.5" aria-label={t('footer.lookUp')}>
            <p className="text-meta text-primary-400 mb-0.5">{t('footer.lookUp')}</p>
            <FooterLink href="/channel">{t('footer.byChannel')}</FooterLink>
            <FooterLink href="/user">{t('footer.byAccount')}</FooterLink>
            <FooterLink href="/leaderboard">{t('footer.leaderboard')}</FooterLink>
            <FooterLink href={config.brand.docsUrl} newTab>
              {t('footer.apiDocs')}
            </FooterLink>
            <FooterLink href={config.brand.statusUrl} newTab>
              {t('footer.status')}
            </FooterLink>
          </nav>

          <nav className="flex flex-col gap-2.5" aria-label={t('footer.yourData')}>
            <p className="text-meta text-primary-400 mb-0.5">{t('footer.yourData')}</p>
            <FooterLink href="/settings">{t('footer.optOut')}</FooterLink>
            <FooterLink href="/privacy">{t('footer.privacy')}</FooterLink>
            <FooterLink href="/tos">{t('footer.terms')}</FooterLink>
          </nav>
        </div>
      </Container>

      <Container className="pb-10">
        <p className="text-micro text-primary-400">
          &copy; {year} {config.brand.name}
        </p>
      </Container>
    </footer>
  );
};
