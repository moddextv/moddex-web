import { Metadata } from 'next';

import { auth } from '@/auth';
import { Overview } from '@/components/Dashboard/Overview';
import { fetchJobHealth } from '@/actions/dashboard';
import { listBadgeCounts } from '@/actions/badges';
import { permissions } from '@/utils/permissions';

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

  const [healthResult, countsResult] = await Promise.all([fetchJobHealth(), listBadgeCounts()]);

  return (
    <Overview
      health={healthResult.ok ? healthResult.data : null}
      counts={countsResult.ok ? countsResult.data : null}
    />
  );
}
