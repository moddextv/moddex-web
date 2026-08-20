import { FC } from 'react';
import Link from 'next/link';

import { ago } from './ago';
import type { BadgeCounts, JobHealth } from '@/utils/api/moddex';

const Tile: FC<{ label: string; value: string; note?: string; href?: string }> = ({
  label,
  value,
  note,
  href
}) => {
  const body = (
    <>
      <span className="text-micro text-primary-400 block">{label}</span>
      <span className="text-h2 block pt-1 tabular">{value}</span>
      {note ? <span className="text-micro text-primary-400 block pt-1">{note}</span> : null}
    </>
  );

  return href ? (
    <Link href={href} className="panel px-4 py-4 hover:border-primary-600 transition-colors">
      {body}
    </Link>
  ) : (
    <div className="panel px-4 py-4">{body}</div>
  );
};

const number = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : value.toLocaleString('en-US');

export const Overview: FC<{ health: JobHealth | null; counts: BadgeCounts | null }> = ({
  health,
  counts
}) => {
  const queue = health?.sweeps.queue;

  return (
    <section className="enter pb-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Accounts indexed"
          value={number(health?.snapshot.users)}
          note={health?.snapshot.lastAt ? ago(health.snapshot.lastAt) : 'no snapshot yet'}
          href="/dashboard/jobs"
        />

        <Tile
          label="Refresh queue"
          value={queue ? `${number(queue.waiting)} / ${number(queue.capacity)}` : '—'}
          note={health?.sweeps.yield.engaged ? 'sweeps are standing aside' : 'sweeps are running'}
          href="/dashboard/jobs"
        />

        <Tile
          label="Donators"
          value={number(counts?.counts.donator)}
          note="moddex's own, counted live"
          href="/dashboard/badges"
        />

        <Tile
          label="Oldest unread channel"
          value={health?.sweepHead ? ago(health.sweepHead) : '—'}
          note="how far behind the sweep is"
          href="/dashboard/jobs"
        />
      </div>

      {health?.roleCounts.overdue ? (
        <p className="text-read text-primary-300 pt-4">
          The nightly rollup has not run since its last slot.{' '}
          <Link href="/dashboard/jobs" className="underline">
            Jobs
          </Link>{' '}
          has the detail.
        </p>
      ) : null}
    </section>
  );
};
