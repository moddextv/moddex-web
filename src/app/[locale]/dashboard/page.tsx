import { asLocale, getTranslator } from '@/i18n';
import { alternatesFor } from '@/misc/metadata';
import { Metadata } from 'next';

import { auth } from '@/auth';
import { Overview } from '@/components/Dashboard/Overview';
import { Trends } from '@/components/Dashboard/Trends';
import { fetchJobHealth } from '@/actions/dashboard';
import { permissions } from '@/utils/permissions';

const TREND_DAYS = 30;

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard', locale),
    robots: { index: false, follow: false },
    title: 'Dashboard'
  };
};

export default async function DashboardPage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const session = await auth();
  const isAdmin = (session?.user.perms ?? 0) >= permissions.admin;

  if (!isAdmin) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('misc.adminOnly')}</p>
        </div>
      </section>
    );
  }

  const healthResult = await fetchJobHealth(false, TREND_DAYS);
  const health = healthResult.ok ? healthResult.data : null;

  return (
    <>
      <Overview health={health} locale={locale} />

      <section className="enter pb-6">
        <Trends series={health?.series ?? null} days={TREND_DAYS} locale={locale} />
      </section>
    </>
  );
}
