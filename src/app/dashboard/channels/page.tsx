import { Metadata } from 'next';

import { Connections } from '@/components/Dashboard/Connections';
import { fetchEventsubHealth, listConnections } from '@/actions/dashboard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard/channels' },
  title: 'Channels · Dashboard'
};

export default async function ChannelsPage() {
  const [connectionsResult, eventsubResult] = await Promise.all([
    listConnections(),
    fetchEventsubHealth()
  ]);

  if (!connectionsResult.ok) {
    return (
      <section className="enter pb-6">
        <div className="panel">
          <p className="text-read text-primary-300">Could not read connections.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="enter pb-6">
      <Connections
        connections={connectionsResult.data}
        eventsub={eventsubResult.ok ? eventsubResult.data : null}
      />
    </section>
  );
}
