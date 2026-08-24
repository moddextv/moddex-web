import { BrowsePager } from '@/components/Browse/BrowsePager';
import { BrowseRows } from '@/components/Browse/BrowseRows';
import { Container } from '@/components/UI/Container';
import { fetchAccounts, fetchChannels } from '@/actions/browse';
import { BROWSE_PAGE_SIZE, BrowseAxis, browsePageCount } from '@/misc/browsePages';
import { formatNumber } from '@/utils/format';
import { getFormattedStats } from '@/utils/stats';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CSSProperties, FC } from 'react';

const COPY: Record<BrowseAxis, { heading: string; corner: string; lead: string; label: string }> = {
  channel: {
    heading: 'Channels',
    corner: 'corner-tl text-mod',
    lead: 'Every indexed channel, ordered by how many mod and vip roles it hands out.',
    label: 'channels indexed'
  },
  user: {
    heading: 'Accounts',
    corner: 'corner-br text-vip',
    lead: 'Every account holding a role, ordered by how many channels it holds one in.',
    label: 'accounts known'
  }
};

const browseTotal = async (axis: BrowseAxis): Promise<number> => {
  const stats = await getFormattedStats();

  return axis === 'channel' ? stats.channels.raw : stats.users.raw;
};

export const BrowsePageView: FC<{ axis: BrowseAxis; page: number }> = async ({ axis, page }) => {
  const offset = (page - 1) * BROWSE_PAGE_SIZE;

  const [total, data] = await Promise.all([
    browseTotal(axis),
    axis === 'channel'
      ? fetchChannels('roles', BROWSE_PAGE_SIZE, offset)
      : fetchAccounts('roles', BROWSE_PAGE_SIZE, offset, true)
  ]);

  if (data.items.length === 0) notFound();

  const copy = COPY[axis];
  const last = browsePageCount(total);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`corner ${copy.corner}`} aria-hidden="true" />
            <h1 className="text-h1">
              {copy.heading} <span className="text-primary-400">· page {page}</span>
            </h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">{copy.lead}</p>
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <div className="panel-flush">
            <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
              <h2 className="text-h2">Most roles</h2>
              <span className="text-lead text-primary-400 tabular">
                {formatNumber(total)} <span className="text-ui">{copy.label}</span>
              </span>
              <Link href={`/${axis}`} className="btn btn-soft ml-auto">
                Search instead
              </Link>
            </div>

            <BrowseRows kind={axis === 'channel' ? 'channel' : 'account'} items={data.items} />
          </div>

          <BrowsePager axis={axis} page={page} last={last} />
        </section>
      </Container>
    </main>
  );
};
