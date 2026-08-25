import { asLocale, getRich, getTranslator } from '@/i18n';
import { pageMetadata } from '@/misc/metadata';
import { LocaleLink } from '@/components/UI/LocaleLink';
import { BrowseList } from '@/components/Browse/BrowseList';
import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { fetchAccounts } from '@/actions/browse';
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
    ...pageMetadata('/user', locale),
    title: t('pages.accounts'),
    description: t('browse.accounts.metaDescription', { brandName: config.brand.name })
  };
};

export default async function UserPage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const rich = getRich(locale);

  const [stats, initial] = await Promise.all([
    getIndexStats(),
    fetchAccounts('roles', 25, 0, true)
  ]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter search-host pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-br text-vip" aria-hidden="true" />
            <h1 className="text-h1">{t('pages.accounts')}</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">{t('browse.accounts.lead')}</p>

          <PageSearch scope="user" />
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <BrowseList
            kind="account"
            title={t('browse.accounts.listTitle')}
            total={stats.users}
            totalLabel={t('browse.accounts.totalLabel')}
            initial={initial}
          />

          <p className="pt-6 text-read text-primary-300">
            {rich('browse.accounts.walk', {
              link: (chunk) => (
                <LocaleLink
                  href="/user/page/1"
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
