import { auth } from '@/auth';
import { Metadata } from 'next';
import { Container } from '@/components/UI/Container';
import { Login } from '@/components/Login';
import { permissions } from '@/utils/permissions';
import { TeamOnly } from '@/components/Notices';
import { AccountManager } from '@/components/Dashboard/AccountManager';
import { JobHealth } from '@/components/Dashboard/JobHealth';
import { Connections } from '@/components/Dashboard/Connections';
import { listBots } from '@/actions/bots';
import { listAdmins } from '@/actions/admins';
import { fetchJobHealth } from '@/actions/dashboard';
import { listConnections } from '@/actions/dashboard';

export const metadata: Metadata = {
  alternates: { canonical: '/dashboard' },
  title: 'Dashboard',
  robots: { index: false, follow: false }
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <Login
        heading="The dashboard needs a Twitch sign-in"
        blurb="It's team only, so moddex has to know which Twitch account is yours before it can check."
        redirectTo="/dashboard"
      />
    );
  }

  if (session.user.perms < permissions.team) {
    return <TeamOnly login={session.user.login} />;
  }

  const isAdmin = session.user.perms >= permissions.admin;

  const [botsResult, healthResult, adminsResult, connectionsResult] = isAdmin
    ? await Promise.all([listBots(), fetchJobHealth(), listAdmins(), listConnections()])
    : [null, null, null, null];

  const bots = botsResult?.ok ? botsResult.data : [];
  const admins = adminsResult?.ok ? adminsResult.data : [];
  const health = healthResult?.ok ? healthResult.data : null;
  const connections = connectionsResult?.ok ? connectionsResult.data : null;

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1">Dashboard</h1>
        </header>

        {health && (
          <section className="enter pb-6">
            <JobHealth health={health} />
          </section>
        )}

        {connections && (
          <section className="enter pb-6">
            <Connections connections={connections} />
          </section>
        )}

        <section className="enter pb-6">
          {isAdmin ? (
            <AccountManager bots={bots} admins={admins} />
          ) : (
            <div className="panel">
              <p className="text-read text-primary-300 max-w-prose">
                Nothing here needs you yet. The bot list is admin only.
              </p>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
