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

// picking a role here is the same act as picking one on a profile, so it wears
// the same chip rather than a second tab pattern
const SCALES: {
  key: LeaderScale;
  tab: string;
  label: string;
  corner: string | null;
  tone: string;
}[] = [
  { key: 'mod', tab: 'Mod', label: 'Mod roles', corner: 'corner-tl', tone: 'text-mod' },
  { key: 'vip', tab: 'VIPs', label: 'VIP roles', corner: 'corner-br', tone: 'text-vip' },
  {
    key: 'founder',
    tab: 'Founder',
    label: 'Founder roles',
    corner: 'corner-bl',
    tone: 'text-founder'
  },
  { key: 'roles', tab: 'All roles', label: 'Roles held', corner: null, tone: '' }
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

        <nav
          className="role-tabs enter"
          aria-label="Which roles to rank"
          style={{ '--i': 1 } as CSSProperties}
        >
          {SCALES.map((entry) => {
            const here = entry.key === scale;

            return (
              <Link
                key={entry.key}
                href={href({ scale: entry.key })}
                aria-current={here ? 'page' : undefined}
                className={clsx('role-tab', here && 'is-active')}
              >
                {entry.corner && (
                  <span
                    aria-hidden="true"
                    className={clsx('corner', entry.corner, here ? entry.tone : 'text-primary-600')}
                  />
                )}
                {entry.tab}
              </Link>
            );
          })}
        </nav>

        <section className="enter pt-2 pb-10" style={{ '--i': 2 } as CSSProperties}>
          <div className="panel-flush">
            <div className="flex items-center gap-3 flex-wrap px-4 pb-5">
              <h2 className="text-h2">{active.label}</h2>
              <span className="text-lead text-primary-400 tabular">
                {board.items.length} <span className="text-ui">ranked</span>
              </span>

              <span className="ml-auto flex items-center gap-2 flex-wrap">
                <Link
                  href={href({ bots: bots === 'exclude' ? 'include' : 'exclude' })}
                  className="chip"
                  aria-pressed={bots === 'exclude'}
                >
                  Bots: {bots === 'exclude' ? 'hidden' : 'shown'}
                </Link>
              </span>
            </div>

            {board.items.length ? (
              <LeaderRows scale={scale} label={active.label} items={board.items} />
            ) : (
              <p className="px-4 pb-6 text-ui text-primary-400">
                Nothing here yet. The daily count has not run since this list was added.
              </p>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
