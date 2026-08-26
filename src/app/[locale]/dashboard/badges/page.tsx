import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { Metadata } from 'next';

import { BadgeManager } from '@/components/Dashboard/BadgeManager';
import { MemberBadges } from '@/components/Dashboard/MemberBadges';
import { listBadgeCatalogue, listBadgeCounts, listBadgeHolders } from '@/actions/badges';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard/badges', locale),
    robots: { index: false, follow: false },
    title: 'Badges · Dashboard'
  };
};

export default async function BadgesPage({ params }: MetaProps) {
  const t = getTranslator(asLocale((await params).locale));
  const [catalogueResult, countsResult, adminsResult] = await Promise.all([
    listBadgeCatalogue(),
    listBadgeCounts(),
    // the only place the owner flag is published
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
          <p className="text-read text-primary-300">{t('dash.catalogueUnreadable')}</p>
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
