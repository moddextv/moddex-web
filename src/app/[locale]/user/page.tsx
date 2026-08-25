import { openGraphFor } from '@/misc/metadata';
import { BrowseList } from '@/components/Browse/BrowseList';
import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { fetchAccounts } from '@/actions/browse';
import { getFormattedStats } from '@/utils/stats';
import { PageSearch } from '@/components/Search/PageSearch';
import { Metadata } from 'next';
import Link from 'next/link';
import { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/user' },
  openGraph: openGraphFor('/user'),
  title: 'Accounts',
  description: `The Twitch accounts ${config.brand.name} holds role records for. Look one up to see every channel it holds mod or vip in.`
};

export default async function UserPage() {
  const [stats, initial] = await Promise.all([
    getFormattedStats(),
    fetchAccounts('roles', 25, 0, true)
  ]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter search-host pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-br text-vip" aria-hidden="true" />
            <h1 className="text-h1">Accounts</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">
            Every indexed channel where an account holds mod or vip, and the day each role was
            granted. That&apos;s the direction Twitch won&apos;t show you.
          </p>

          <PageSearch scope="user" />
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <BrowseList
            kind="account"
            title="Accounts holding roles"
            total={stats.users.raw}
            totalLabel="accounts known"
            initial={initial}
          />

          <p className="pt-6 text-read text-primary-300">
            Or walk the whole index:{' '}
            <Link href="/user/page/1" className="text-primary-200 font-semibold hover:underline">
              accounts by role count
            </Link>
            .
          </p>
        </section>
      </Container>
    </main>
  );
}
