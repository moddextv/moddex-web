import { Metadata } from 'next';

import { Donations } from '@/components/Dashboard/Donations';
import { listDonations } from '@/actions/dashboard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard/donations' },
  title: 'Donations · Dashboard'
};

export default async function DonationsPage() {
  const result = await listDonations();

  if (!result.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">Could not read the ledger.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="enter pb-6">
      <Donations initial={result.data} />
    </section>
  );
}
