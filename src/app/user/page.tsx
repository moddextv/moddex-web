import { BrowseList } from '@/components/Browse/BrowseList';
import { Container } from '@/components/UI/Container';
import { config } from '@/config';
import { fetchAccounts } from '@/actions/browse';
import { getStats } from '@/utils/stats';
import { Metadata } from 'next';
import { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'People',
  description: `The twitch accounts ${config.brand.name} holds role records for. Look one up to see every channel they hold mod or vip in.`
};

/**
 * the mirror of /channel. the nav search scope flips to Person on this route,
 * so the bar above looks up accounts without the reader having to notice that
 * a heading changed.
 *
 * bots are included by default here, unlike in a channel's mod list. a bot
 * holding 1,204 mod roles is the most interesting row on this page, so hiding
 * it would be hiding the answer.
 */
export default async function UserPage() {
  const [stats, initial] = await Promise.all([getStats(), fetchAccounts('roles', 25, 0, true)]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-br text-vip" aria-hidden="true" />
            <h1 className="text-h1">People</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">
            Every indexed channel where an account holds mod or vip, and the day each role was
            granted. This is the direction twitch itself will not show you.
          </p>
        </header>

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <BrowseList
            kind="account"
            title="Accounts holding roles"
            total={stats.users.raw}
            initial={initial}
          />
        </section>
      </Container>
    </main>
  );
}
