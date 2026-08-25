import { openGraphFor } from '@/misc/metadata';
import { BrowseList } from '@/components/Browse/BrowseList';
import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { fetchChannels } from '@/actions/browse';
import { getFormattedStats } from '@/utils/stats';
import { PageSearch } from '@/components/Search/PageSearch';
import { Metadata } from 'next';
import Link from 'next/link';
import { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/channel' },
  openGraph: openGraphFor('/channel'),
  title: 'Channels',
  description: `The Twitch channels ${config.brand.name} has indexed. Look one up to see who holds mod, vip and founder in it.`
};

export default async function ChannelPage() {
  const [stats, initial] = await Promise.all([getFormattedStats(), fetchChannels('read', 25, 0)]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter search-host pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            <h1 className="text-h1">Channels</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">
            Who holds mod, vip and founder in a channel, and since when. Search a channel for the
            first time and you add it to the index.
          </p>

          <PageSearch scope="channel" />
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <BrowseList
            kind="channel"
            title="Indexed channels"
            total={stats.channels.raw}
            totalLabel="channels indexed"
            initial={initial}
          />

          <p className="pt-6 text-read text-primary-300">
            Or walk the whole index:{' '}
            <Link href="/channel/page/1" className="text-primary-200 font-semibold hover:underline">
              channels by role count
            </Link>
            .
          </p>
        </section>
      </Container>
    </main>
  );
}
