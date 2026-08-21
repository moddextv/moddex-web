import { Metadata } from 'next';

import { auth } from '@/auth';
import { Overview } from '@/components/Dashboard/Overview';
import { Trends } from '@/components/Dashboard/Trends';
import { fetchJobHealth } from '@/actions/dashboard';
import { permissions } from '@/utils/permissions';

const TREND_DAYS = 30;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard' },
  title: 'Dashboard'
};

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = (session?.user.perms ?? 0) >= permissions.admin;

  if (!isAdmin) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">Admin only.</p>
        </div>
      </section>
    );
  }

  const healthResult = await fetchJobHealth(false, TREND_DAYS);
  const health = healthResult.ok ? healthResult.data : null;

  return (
    <>
      <Overview health={health} />

      <section className="enter pb-6">
        <Trends series={health?.series ?? null} days={TREND_DAYS} />
      </section>
    </>
  );
}
