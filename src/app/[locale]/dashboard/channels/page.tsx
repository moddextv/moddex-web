import { asLocale, getTranslator } from '@/i18n';
import { alternatesFor } from '@/misc/metadata';
import { Metadata } from 'next';

import { Connections } from '@/components/Dashboard/Connections';
import { fetchEventsubHealth, listConnections } from '@/actions/dashboard';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);

  return {
    alternates: alternatesFor('/dashboard/channels', locale),
    robots: { index: false, follow: false },
    title: 'Channels · Dashboard'
  };
};

export default async function ChannelsPage({ params }: MetaProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const [connectionsResult, eventsubResult] = await Promise.all([
    listConnections(),
    fetchEventsubHealth()
  ]);

  if (!connectionsResult.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">{t('dash.connectionsUnreadable')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="enter pb-6">
      <Connections
        connections={connectionsResult.data}
        eventsub={eventsubResult.ok ? eventsubResult.data : null}
        locale={locale}
      />
    </section>
  );
}
