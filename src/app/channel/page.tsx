import { BrowseList } from '@/components/Browse/BrowseList';
import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { fetchChannels } from '@/actions/browse';
import { getStats } from '@/utils/stats';
import { Metadata } from 'next';
import { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Channels',
  description: `The twitch channels ${config.brand.name} has indexed. Look one up to see who holds mod, vip and founder in it.`
};

/**
 * with the search in the nav, this route stops being a page whose only content
 * is a search box and becomes a browse surface. the search it used to hold is
 * reachable from here and from everywhere else, so nothing was lost by moving
 * it and a real page was gained.
 *
 * the first page is rendered on the server so the list is in the html; sorting
 * and paging past it are the client's job, through the same endpoint.
 */
export default async function ChannelPage() {
  const [stats, initial] = await Promise.all([
    getStats(),
    fetchChannels('read', 25, 0)
  ]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            <h1 className="text-h1">Channels</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">
            Who holds mod, vip and founder in a channel, and since when. Type a
            name in the bar above to look one up. Searching a channel for the
            first time is what adds it to the index.
          </p>
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <BrowseList
            kind="channel"
            title="Indexed channels"
            total={stats.channels.raw}
            initial={initial}
          />
        </section>
      </Container>
    </main>
  );
}
