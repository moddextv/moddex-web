import { openGraphFor } from '@/misc/metadata';
import { OptOutEffect, OptOutReversible } from '@/components/OptOutPromise';
import { ArrowRightIcon } from '@/components/Icons';
import { BrowseRows } from '@/components/Browse/BrowseRows';
import { Container } from '@/components/UI/Container';
import { Mark } from '@/components/UI/Mark';
import { config } from '@/config';
import { fetchAccounts, fetchChannels } from '@/actions/browse';
import { getFormattedStats } from '@/utils/stats';
import { getStatsHistory } from '@/utils/api/moddex';
import { RoleHistory } from '@/components/Home/RoleHistory';
import { formatNumber } from '@/utils/format';
import { JsonLd, siteGraph } from '@/components/JsonLd';
import Link from 'next/link';
import { Metadata } from 'next';
import { CSSProperties, FC, ReactNode } from 'react';

export const dynamic = 'force-dynamic';

const Direction: FC<{
  href: string;
  corner: string;
  tone: string;
  hover: string;
  title: string;
  example: string;
  children: string;
}> = ({ href, corner, tone, hover, title, example, children }) => (
  <Link
    href={href}
    className="panel group hover:bg-primary-700/25 transition-colors flex flex-col h-full"
  >
    <div className="flex items-center gap-3 mb-3">
      <span aria-hidden="true" className={`corner ${corner} ${tone}`} />
      <h2 className="text-h2">{title}</h2>
    </div>
    <p className="text-read text-primary-300 max-w-[42ch] mb-5">{children}</p>
    <span
      className={`mt-auto inline-flex items-center gap-2 text-ui font-semibold text-primary-200 transition-colors ${hover}`}
    >
      {example}
      <ArrowRightIcon size={14} />
    </span>
  </Link>
);

const Count: FC<{ label: string; corner: string; tone: string; value: number }> = ({
  label,
  corner,
  tone,
  value
}) => (
  <div>
    <p className="flex items-center gap-2.5 text-ui text-primary-400 mb-2">
      <span className={`corner ${corner} ${tone}`} aria-hidden="true" />
      {label}
    </p>
    <p className={`text-[clamp(2rem,3.4vw,3rem)] font-extrabold leading-none tabular ${tone}`}>
      {formatNumber(value)}
    </p>
  </div>
);

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

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: openGraphFor('/')
};

export default async function Home() {
  const [stats, recent, holders, history] = await Promise.all([
    getFormattedStats(),
    fetchChannels('read', 5, 0),
    fetchAccounts('roles', 5, 0, true),
    getStatsHistory(30).catch(() => [])
  ]);

  return (
    <main id="main" className="flex-grow">
      <JsonLd data={siteGraph()} />
      <Container>
        <section className="enter pt-14 pb-10">
          <p className="flex items-center gap-3 text-ui text-primary-400 mb-5">
            <Mark size={18} split />
            <span>
              <span className="text-mod font-semibold">mods</span> and{' '}
              <span className="text-vip font-semibold">vips</span>, indexed from both ends
            </span>
          </p>

          <h1 className="text-display max-w-[18ch] mb-5">
            Every mod list on Twitch, read backwards.
          </h1>

          <p className="text-lead text-primary-300 max-w-prose">
            Twitch shows a broadcaster who their own mods are. It won&apos;t tell you the reverse.{' '}
            {config.brand.name} does: every channel an account has a role in, and the day they got
            it. Type a name in the bar above.
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
            Who holds mod, vip and founder in a channel, and since when. Search one for the first
            time and you add it to the index.
          </Direction>

          <Direction
            href="/user"
            corner="corner-br"
            tone="text-vip"
            hover="group-hover:text-vip"
            title="Look up an account"
            example={`${config.brand.domain}/u/nymn`}
          >
            Every indexed channel where one account holds a role. That&apos;s the direction Twitch
            won&apos;t show you.
          </Direction>
        </section>
        <section
          className="enter pb-14"
          style={{ '--i': 2 } as CSSProperties}
          aria-label="What the index holds"
        >
          <div className="flex flex-wrap items-end gap-x-12 gap-y-7">
            <Count
              label="moderator records"
              corner="corner-tl"
              tone="text-mod"
              value={stats.mods.raw}
            />
            <Count label="vip records" corner="corner-br" tone="text-vip" value={stats.vips.raw} />

            {stats.founders && (
              <Count
                label="founder records"
                corner="corner-bl"
                tone="text-founder"
                value={stats.founders.raw}
              />
            )}

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
        <section className="enter pb-12" style={{ '--i': 3 } as CSSProperties}>
          <RoleHistory points={history} />
        </section>

        {(recent.items.length > 0 || holders.items.length > 0) && (
          <section
            className="enter grid items-start gap-6 lg:grid-cols-2 pb-12"
            style={{ '--i': 4 } as CSSProperties}
          >
            {recent.items.length > 0 && (
              <Live title="Recently indexed" href="/channel" link="All channels">
                <BrowseRows kind="channel" items={recent.items} />
              </Live>
            )}

            {holders.items.length > 0 && (
              <Live title="Holding the most roles" href="/user" link="All accounts">
                <BrowseRows kind="account" items={holders.items} />
              </Live>
            )}
          </section>
        )}

        <section
          className="enter grid gap-6 md:grid-cols-2 pb-4"
          style={{ '--i': 5 } as CSSProperties}
        >
          <div className="panel">
            <h2 className="text-h2 mb-3">The index fills up by being used</h2>
            <p className="text-read text-primary-300 max-w-[46ch] mb-5">
              A channel gets added the first time somebody searches for it. That one lookup pulls in
              its mod and vip lists and keeps them, for everybody. You don&apos;t need an account.
            </p>
            <Link href="/channel" className="btn btn-soft">
              Index a channel
            </Link>
          </div>

          <div className="panel">
            <h2 className="text-h2 mb-3">Listed here and would rather not be?</h2>
            <p className="text-read text-primary-300 max-w-[46ch] mb-5">
              Sign in with Twitch and switch the opt-out on. <OptOutEffect /> <OptOutReversible />
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
