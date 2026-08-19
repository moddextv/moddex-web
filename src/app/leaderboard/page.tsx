import { CSSProperties } from 'react';
import { Container } from '@/components/UI/Container';
import { LeaderRows } from '@/components/Leaderboard/LeaderRows';
import { LeaderScale, getLeaderboard } from '@/utils/api/moddex';
import { Metadata } from 'next';
import { config } from '@/config';
import { openGraphFor } from '@/misc/metadata';
import Link from 'next/link';
import clsx from 'clsx';

export const dynamic = 'force-dynamic';

const SCALES: { key: LeaderScale; tab: string; label: string; tone: string }[] = [
  { key: 'mod', tab: 'Mod', label: 'Mod roles', tone: 'tab-mod' },
  { key: 'vip', tab: 'Vip', label: 'Vip roles', tone: 'tab-vip' },
  { key: 'founder', tab: 'Founder', label: 'Founder roles', tone: 'tab-founder' },
  { key: 'roles', tab: 'All roles', label: 'Roles held', tone: '' }
];

const isScale = (value: string): value is LeaderScale =>
  SCALES.some((scale) => scale.key === value);

export const metadata: Metadata = {
  alternates: { canonical: '/leaderboard' },
  openGraph: openGraphFor('/leaderboard'),
  title: 'Leaderboard',
  description: `Who holds the most mod, vip and founder roles on Twitch, counted by ${config.brand.name}.`
};

interface PageProps {
  searchParams: Promise<{ scale?: string; bots?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const scale = params.scale && isScale(params.scale) ? params.scale : 'mod';
  const bots = params.bots === 'exclude' ? 'exclude' : 'include';
  const active = SCALES.find((entry) => entry.key === scale)!;

  const board = await getLeaderboard(scale, { limit: 50, bots });
  const href = (next: Partial<{ scale: string; bots: string }>) => {
    const query = new URLSearchParams({ scale, ...(bots === 'exclude' ? { bots } : {}), ...next });

    return `/leaderboard?${query.toString()}`;
  };

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="corner corner-tl text-mod" aria-hidden="true" />
            <h1 className="text-h1">Leaderboard</h1>
          </div>
          <p className="text-lead text-primary-300 max-w-prose">
            Who holds the most roles across every channel {config.brand.name} has read. Updates once
            a day.
          </p>
        </header>

        <nav className="tabs enter" style={{ '--i': 1 } as CSSProperties}>
          {SCALES.map((entry) => (
            <Link
              key={entry.key}
              href={href({ scale: entry.key })}
              aria-current={entry.key === scale ? 'page' : undefined}
              className={clsx('tab', entry.tone)}
            >
              {entry.tab}
            </Link>
          ))}
        </nav>

        <section className="enter pt-6 pb-10" style={{ '--i': 2 } as CSSProperties}>
          <div className="flex justify-end mb-4">
            <Link
              href={href({ bots: bots === 'exclude' ? 'include' : 'exclude' })}
              className="text-ui text-primary-300 underline underline-offset-4"
            >
              {bots === 'exclude' ? 'Show bots' : 'Hide bots'}
            </Link>
          </div>

          {board.items.length ? (
            <LeaderRows scale={scale} label={active.label} items={board.items} />
          ) : (
            <p className="text-ui text-primary-400">
              Nothing here yet — the daily count has not run since this list was added.
            </p>
          )}
        </section>
      </Container>
    </main>
  );
}
