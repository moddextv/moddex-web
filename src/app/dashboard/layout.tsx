import { ReactNode } from 'react';
import { Metadata } from 'next';

import { auth } from '@/auth';
import { Container } from '@/components/UI/Container';
import { DashboardNav } from '@/components/Dashboard/DashboardNav';
import { Login } from '@/components/Login';
import { TeamOnly } from '@/components/Notices';
import { permissions } from '@/utils/permissions';

// every segment reads the session and the api; none of it may be baked at build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false }
};

// the permission check lives here once rather than in every segment
export default async function DashboardLayout({ children }: { children: ReactNode }) {
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

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-6">
          <h1 className="text-h1">Dashboard</h1>
        </header>

        <DashboardNav isAdmin={session.user.perms >= permissions.admin} />

        {children}
      </Container>
    </main>
  );
}
