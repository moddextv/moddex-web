import { Metadata } from 'next';

import { JobHealth } from '@/components/Dashboard/JobHealth';
import { Runs } from '@/components/Dashboard/Runs';
import { Sweeps } from '@/components/Dashboard/Sweeps';
import { fetchEventsubHealth, fetchJobHealth } from '@/actions/dashboard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard/jobs' },
  title: 'Jobs — Dashboard'
};

export default async function JobsPage() {
  // its own route, so the backlog counts are affordable here
  const [healthResult, eventsubResult] = await Promise.all([
    fetchJobHealth(true),
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

  return (
    <>
      <section className="enter pb-6">
        <JobHealth health={health} />
      </section>

      <section className="enter pb-6">
        <Sweeps sweeps={health.sweeps} eventsub={eventsubResult.ok ? eventsubResult.data : null} />
      </section>

      <section className="enter pb-6">
        <Runs runs={health.runs} />
      </section>
    </>
  );
}
