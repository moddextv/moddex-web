import { auth } from '@/auth';
import { Metadata } from 'next';
import { Container } from '@/components/UI/Container';
import { Login } from '@/components/Login';
import { constants } from '@/utils/constants';
import { TeamOnly } from '@/components/Errors';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false }
};

/**
 * the two gates and the heading are ported; what sits under the heading is not.
 *
 * the v3 comp for this route is a proposal rather than a spec — it draws panels
 * for figures nobody has agreed to collect — and the page as it stands is a
 * single line of placeholder text. building the comp out would be inventing a
 * product, so the shell is styled and the body is left where it was until the
 * scope is agreed.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <Login
        heading="The dashboard needs a twitch sign-in"
        blurb="It is team only, so moddex has to know which twitch account is yours before it can check."
        redirectTo="/dashboard"
      />
    );
  }

  if (session.user.perms < constants.permissions.team) {
    return <TeamOnly login={session.user.login} />;
  }

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-2">Dashboard</h1>
          <p className="text-ui text-primary-400">
            Signed in as {session.user.login}, with team permission.
          </p>
        </header>

        <section className="enter pb-6">
          <div className="panel">
            <p className="text-read text-primary-300 max-w-prose">
              Willkommen im Dashboard, {session.user.name}
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
