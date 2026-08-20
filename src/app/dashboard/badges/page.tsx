import { Metadata } from 'next';

import { BadgeManager } from '@/components/Dashboard/BadgeManager';
import { MemberBadges } from '@/components/Dashboard/MemberBadges';
import { listBadgeCatalogue, listBadgeCounts, listBadgeHolders } from '@/actions/badges';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard/badges' },
  title: 'Badges — Dashboard'
};

export default async function BadgesPage() {
  const [catalogueResult, countsResult, adminsResult] = await Promise.all([
    listBadgeCatalogue(),
    listBadgeCounts(),
    // four rows, and the only place the owner flag is published
    listBadgeHolders('admin')
  ]);

  const catalogue = catalogueResult.ok ? catalogueResult.data : [];
  const counts = countsResult.ok ? countsResult.data.counts : {};
  const ownerId = adminsResult.ok
    ? (adminsResult.data.find((holder) => holder.owner)?.id ?? undefined)
    : undefined;

  if (!catalogue.length) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">The badge catalogue could not be read.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="enter pb-6">
        <MemberBadges catalogue={catalogue} ownerId={ownerId} />
      </section>

      <section className="enter pb-6">
        <BadgeManager catalogue={catalogue} counts={counts} />
      </section>
    </>
  );
}
