import { pageMetadata } from '@/misc/metadata';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { Ext, Inline } from '@/components/Legal';
import { config } from '@/config';
import { Metadata } from 'next';
import { CSSProperties, FC, ReactNode } from 'react';
import { asLocale } from '@/i18n/locales';
import { getRich, getTranslator } from '@/i18n/dictionary';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    ...pageMetadata('/about', locale),
    title: t('about.metaTitle'),
    description: t('about.metaDescription', { domain: config.brand.domain })
  };
};

const Para: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-read text-primary-300 max-w-prose">{children}</p>
);

const Panel: FC<{ title: string; icon?: ReactNode; children: ReactNode }> = ({
  title,
  icon,
  children
}) => (
  <div className="panel">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-h2">{title}</h2>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default async function AboutPage({ params }: PageProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const rich = getRich(locale);
  const { name, domain, discordUrl, githubUrl, authorUrl, docsUrl } = config.brand;

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-3 max-w-[24ch]">{t('about.heading', { name })}</h1>
          <p className="text-lead text-primary-300 max-w-prose">{t('about.lead', { name })}</p>
        </header>

        <section
          className="enter grid gap-6 lg:grid-cols-2 pb-4"
          style={{ '--i': 1 } as CSSProperties}
        >
          <Panel title={t('about.who.title')}>
            <Para>{t('about.who.one', { name })}</Para>
            <Para>
              {rich('about.who.two', {
                author: (chunk) => <Ext href={authorUrl}>{chunk}</Ext>,
                github: (chunk) => <Ext href={githubUrl}>{chunk}</Ext>
              })}
            </Para>
          </Panel>

          <Panel title={t('about.history.title')}>
            <Para>{t('about.history.one', { name, domain })}</Para>
            <Para>{t('about.history.two')}</Para>
            <Para>{t('about.history.three')}</Para>
          </Panel>

          <Panel
            title={t('about.donated.title')}
            icon={
              <Image
                src="/badges/donator.svg"
                alt={t('about.donated.badgeAlt')}
                width={28}
                height={28}
                radius="sm"
                className="shrink-0"
              />
            }
          >
            <Para>{t('about.donated.one')}</Para>
            <Para>
              {rich('about.donated.two', {
                discord: (chunk) => <Ext href={discordUrl}>{chunk}</Ext>
              })}
            </Para>
          </Panel>

          <Panel title={t('about.cost.title')}>
            <Para>
              {rich('about.cost.one', {
                docs: (chunk) => <Ext href={docsUrl}>{chunk}</Ext>,
                donate: (chunk) => <Inline href="/donate">{chunk}</Inline>
              })}
            </Para>
            <Para>
              {rich('about.cost.two', {
                privacy: (chunk) => <Inline href="/privacy">{chunk}</Inline>,
                tos: (chunk) => <Inline href="/tos">{chunk}</Inline>
              })}
            </Para>
          </Panel>
        </section>
      </Container>
    </main>
  );
}
