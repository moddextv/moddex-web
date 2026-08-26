import { asLocale } from '@/i18n/locales';
import { getRich, getTranslator } from '@/i18n/dictionary';
import { pageMetadata } from '@/misc/metadata';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { BrowseList } from '@/components/Browse/BrowseList';
import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { fetchChannels } from '@/actions/browse';
import { getIndexStats } from '@/utils/stats';
import { PageSearch } from '@/components/Search/PageSearch';
import { Metadata } from 'next';
import { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    ...pageMetadata('/channel', locale),
    title: t('pages.channels'),
    description: t('browse.channels.metaDescription', { brandName: config.brand.name })
  };
};

export default async function ChannelPage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const rich = getRich(locale);

  const [stats, initial] = await Promise.all([getIndexStats(), fetchChannels('read', 25, 0)]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter search-host pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            <h1 className="text-h1">{t('pages.channels')}</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">{t('browse.channels.lead')}</p>

          <PageSearch scope="channel" />
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <BrowseList
            kind="channel"
            title={t('browse.channels.listTitle')}
            total={stats.channels}
            totalLabel={t('browse.channels.totalLabel')}
            initial={initial}
          />

          <p className="pt-6 text-read text-primary-300">
            {rich('browse.channels.walk', {
              link: (chunk) => (
                <LocaleLink
                  href="/channel/page/1"
                  className="text-primary-200 font-semibold hover:underline"
                >
                  {chunk}
                </LocaleLink>
              )
            })}
          </p>
        </section>
      </Container>
    </main>
  );
}
