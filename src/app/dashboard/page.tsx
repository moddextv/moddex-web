import { Metadata } from 'next';

import { auth } from '@/auth';
import { Overview } from '@/components/Dashboard/Overview';
import { QuickCheck } from '@/components/Dashboard/QuickCheck';
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

  // team can use the lookup; the panels below it are admin only
  if (!isAdmin) {
    return (
      <section className="enter pb-6">
        <QuickCheck />
      </section>
    );
  }

  const [healthResult, countsResult] = await Promise.all([fetchJobHealth(), listBadgeCounts()]);

  return (
    <>
      <Overview
        health={healthResult.ok ? healthResult.data : null}
        counts={countsResult.ok ? countsResult.data : null}
      />

      <section className="enter pb-6">
        <QuickCheck />
      </section>
    </>
  );
}
