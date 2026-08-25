import { Metadata } from 'next';
import { FC, Suspense } from 'react';

import { JobHealth } from '@/components/Dashboard/JobHealth';
import { Runs } from '@/components/Dashboard/Runs';
import { Sweeps } from '@/components/Dashboard/Sweeps';
import { fetchEventsubHealth, fetchJobHealth } from '@/actions/dashboard';
import type { EventsubHealth } from '@/utils/api/moddex/public';
import type { SweepHealth } from '@/utils/api/moddex/admin';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard/jobs' },
  title: 'Jobs · Dashboard'
};

// measured against production: 0.16 s without the backlogs, 5.6 s with them,
// because counting them is two scans of a 10.4M row table
const Backlogs: FC<{ fallback: SweepHealth; eventsub: EventsubHealth | null }> = async ({
  fallback,
  eventsub
}) => {
  const counted = await fetchJobHealth(true);

  return <Sweeps sweeps={counted.ok ? counted.data.sweeps : fallback} eventsub={eventsub} />;
};

export default async function JobsPage() {
  const [healthResult, eventsubResult] = await Promise.all([
    fetchJobHealth(),
    fetchEventsubHealth()
  ]);

  if (!healthResult.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">Could not read job health.</p>
        </div>
      </section>
    );
  }

  const health = healthResult.data;
  const eventsub = eventsubResult.ok ? eventsubResult.data : null;

  return (
    <>
      <section className="enter pb-6">
        <JobHealth health={health} />
      </section>

      <section className="enter pb-6">
        <Suspense fallback={<Sweeps sweeps={health.sweeps} eventsub={eventsub} />}>
          <Backlogs fallback={health.sweeps} eventsub={eventsub} />
        </Suspense>
      </section>

      <section className="enter pb-6">
        <Runs runs={health.runs} />
      </section>
    </>
  );
}
