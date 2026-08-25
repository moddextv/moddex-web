import { alternatesFor } from '@/misc/metadata';
import { asLocale, Locale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { Metadata } from 'next';
import { FC, Suspense } from 'react';

import { JobHealth } from '@/components/Dashboard/JobHealth';
import { Runs } from '@/components/Dashboard/Runs';
import { Sweeps } from '@/components/Dashboard/Sweeps';
import { fetchEventsubHealth, fetchJobHealth } from '@/actions/dashboard';
import type { EventsubHealth } from '@/utils/api/moddex/public';
import type { SweepHealth } from '@/utils/api/moddex/admin';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard/jobs', locale),
    robots: { index: false, follow: false },
    title: 'Jobs · Dashboard'
  };
};

// measured against production: 0.16 s without the backlogs, 5.6 s with them,
// because counting them is two scans of a 10.4M row table
const Backlogs: FC<{
  fallback: SweepHealth;
  eventsub: EventsubHealth | null;
  locale: Locale;
}> = async ({ fallback, eventsub, locale }) => {
  const counted = await fetchJobHealth(true);

  return (
    <Sweeps
      sweeps={counted.ok ? counted.data.sweeps : fallback}
      eventsub={eventsub}
      locale={locale}
    />
  );
};

export default async function JobsPage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const [healthResult, eventsubResult] = await Promise.all([
    fetchJobHealth(),
    fetchEventsubHealth()
  ]);

  if (!healthResult.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('dash.jobHealthUnreadable')}</p>
        </div>
      </section>
    );
  }

  const health = healthResult.data;
  const eventsub = eventsubResult.ok ? eventsubResult.data : null;

  return (
    <>
      <section className="enter pb-6">
        <JobHealth health={health} locale={locale} />
      </section>

      <section className="enter pb-6">
        <Suspense fallback={<Sweeps sweeps={health.sweeps} eventsub={eventsub} locale={locale} />}>
          <Backlogs fallback={health.sweeps} eventsub={eventsub} locale={locale} />
        </Suspense>
      </section>

      <section className="enter pb-6">
        <Runs runs={health.runs} locale={locale} />
      </section>
    </>
  );
}
