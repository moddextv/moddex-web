import { asLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { Metadata } from 'next';

import { Donations } from '@/components/Dashboard/Donations';
import { listDonations } from '@/actions/dashboard';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard/donations', locale),
    robots: { index: false, follow: false },
    title: 'Donations · Dashboard'
  };
};

export default async function DonationsPage({ params }: MetaProps) {
  const t = getTranslator(asLocale((await params).locale));
  const result = await listDonations();

  if (!result.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('dash.ledgerUnreadable')}</p>
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
