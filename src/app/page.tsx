import { ArrowRightIcon } from '@/components/Icons';
import { BrowseRows } from '@/components/Browse/BrowseRows';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import { fetchAccounts, fetchChannels } from '@/actions/browse';
import { getStats } from '@/utils/stats';
import { formatNumber } from '@/utils/utils';
import Link from 'next/link';
import { CSSProperties, FC, ReactNode } from 'react';

export const dynamic = 'force-dynamic';

/**
 * one of the two entry points, as a panel you can click rather than a link in a
 * paragraph. the example url is the affordance: the shape of the address is the
 * quickest way to say what the direction means.
 */
const Direction: FC<{
  href: string;
  corner: string;
  tone: string;
  hover: string;
  title: string;
  example: string;
  children: string;
}> = ({ href, corner, tone, hover, title, example, children }) => (
  <Link href={href} className="panel group hover:bg-primary-700/25 transition-colors">
    <div className="flex items-center gap-3 mb-3">
      <span aria-hidden="true" className={`corner ${corner} ${tone}`} />
      <h2 className="text-h2">{title}</h2>
    </div>
    <p className="text-read text-primary-300 max-w-[42ch] mb-5">{children}</p>
    <span
      className={`inline-flex items-center gap-2 text-ui font-semibold text-primary-200 transition-colors ${hover}`}
    >
      {example}
      <ArrowRightIcon size={14} />
    </span>
  </Link>
);

/** a live list with a way through to the full one. no chips: this is a taste. */
const Live: FC<{ title: string; href: string; link: string; children: ReactNode }> = ({
  title,
  href,
  link,
  children
}) => (
  <div className="panel-flush">
    <div className="flex items-baseline gap-3 px-4 pb-5">
      <h2 className="text-h2">{title}</h2>
      <Link
        href={href}
        className="ml-auto text-ui font-semibold text-primary-300 hover:text-primary-100 transition-colors"
      >
        {link}
      </Link>
    </div>
    {children}
  </div>
);

export default async function Home() {
  // the two lists are what makes this page current rather than a brochure, and
  // "recently indexed" in particular is the one thing on the site that shows it
  // is being used right now. recently-looked-up used to be v2's left rail; it
  // is a destination here instead of 240px of permanent furniture.
  const [stats, recent, holders] = await Promise.all([
    getStats(),
    fetchChannels('read', 5, 0),
    fetchAccounts('roles', 5, 0, true)
  ]);

  return (
    <main id="main" className="flex-grow">
      <Container>
        {/* no hero with a search box in it. the search is in the nav on every
            page, so what this space is worth spending on is a statement of what
            the site holds. */}
        <section className="enter pt-14 pb-10">
          <p className="flex items-center gap-3 text-ui text-primary-400 mb-5">
            <Mark size={18} split />
            <span>
              <span className="text-mod font-semibold">mods</span> and{' '}
              <span className="text-vip font-semibold">vips</span>, indexed from both ends
            </span>
          </p>

          <h1 className="text-display max-w-[18ch] mb-5">
            Every mod list on twitch, read backwards.
          </h1>

          <p className="text-lead text-primary-300 max-w-prose">
            Twitch shows a broadcaster their own moderators. {config.brand.name} keeps the other
            half: every channel a person holds a role in, and the day it was granted. Type a name in
            the bar above.
          </p>
        </section>

        <section
          className="enter grid gap-5 md:grid-cols-2 pb-12"
          style={{ '--i': 1 } as CSSProperties}
        >
          <Direction
            href="/channel"
            corner="corner-tl"
            tone="text-mod"
            hover="group-hover:text-mod"
            title="Look up a channel"
            example={`${config.brand.domain}/c/forsen`}
          >
            Who holds mod, vip and founder in a channel, and since when. Searching one for the first
            time is what adds it to the index.
          </Direction>

          <Direction
            href="/user"
            corner="corner-br"
            tone="text-vip"
            hover="group-hover:text-vip"
            title="Look up a person"
            example={`${config.brand.domain}/u/nymn`}
          >
            Every indexed channel where one account holds a role. This is the direction twitch
            itself will not show you.
          </Direction>
        </section>

        {/* five numbers at one size made all five equally ignorable. the two
            role counts ARE the product, so they lead at 3rem in their own
            colours and the rest supports them in a sentence. */}
        <section
          className="enter pb-14"
          style={{ '--i': 2 } as CSSProperties}
          aria-label="What the index holds"
        >
          <div className="flex flex-wrap items-end gap-x-14 gap-y-7">
            <div>
              <p className="flex items-center gap-2.5 text-ui text-primary-400 mb-2">
                <span className="corner corner-tl text-mod" aria-hidden="true" />
                moderator records
              </p>
              <p className="text-[clamp(2.25rem,4vw,3rem)] font-extrabold leading-none tabular text-mod">
                {formatNumber(stats.mods.raw)}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2.5 text-ui text-primary-400 mb-2">
                <span className="corner corner-br text-vip" aria-hidden="true" />
                vip records
              </p>
              <p className="text-[clamp(2.25rem,4vw,3rem)] font-extrabold leading-none tabular text-vip">
                {formatNumber(stats.vips.raw)}
              </p>
            </div>

            <p className="text-read text-primary-400 max-w-[30ch] leading-relaxed">
              across{' '}
              <span className="text-primary-100 font-bold tabular">
                {formatNumber(stats.channels.raw)}
              </span>{' '}
              channels and{' '}
              <span className="text-primary-100 font-bold tabular">
                {formatNumber(stats.users.raw)}
              </span>{' '}
              accounts.
            </p>
          </div>
        </section>

        {(recent.items.length > 0 || holders.items.length > 0) && (
          <section
            className="enter grid items-start gap-6 lg:grid-cols-2 pb-12"
            style={{ '--i': 3 } as CSSProperties}
          >
            {recent.items.length > 0 && (
              <Live title="Recently indexed" href="/channel" link="All channels">
                <BrowseRows kind="channel" items={recent.items} />
              </Live>
            )}

            {holders.items.length > 0 && (
              <Live title="Holding the most roles" href="/user" link="All people">
                <BrowseRows kind="account" items={holders.items} />
              </Live>
            )}
          </section>
        )}

        <section
          className="enter grid gap-6 md:grid-cols-2 pb-4"
          style={{ '--i': 4 } as CSSProperties}
        >
          <div className="panel">
            <h2 className="text-h2 mb-3">The index fills up by being used</h2>
            <p className="text-read text-primary-300 max-w-[46ch] mb-5">
              A channel enters the index the first time somebody searches for it. That read pulls
              its mod and vip lists in and keeps them, for everyone. No account needed.
            </p>
            <Link href="/channel" className="btn btn-soft">
              Index a channel
            </Link>
          </div>

          <div className="panel">
            <h2 className="text-h2 mb-3">Listed here and would rather not be?</h2>
            <p className="text-read text-primary-300 max-w-[46ch] mb-5">
              Sign in with twitch and switch the opt-out on. Your profile stops being served and you
              come off every list and the public api. It is reversible: switching it back off
              restores your entry.
            </p>
            <Link href="/settings" className="btn btn-soft">
              Opt out
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
