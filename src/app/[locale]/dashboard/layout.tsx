import { asLocale, getTranslator } from '@/i18n';
import { ReactNode } from 'react';
import { Metadata } from 'next';

import { auth } from '@/auth';
import { Container } from '@/components/UI/Container';
import { DashboardNav } from '@/components/Dashboard/DashboardNav';
import { Login } from '@/components/Login';
import { TeamOnly } from '@/components/Notices';
import { permissions } from '@/utils/permissions';

// none of this may be baked at build
export const dynamic = 'force-dynamic';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: LayoutProps): Promise<Metadata> => ({
  title: getTranslator(asLocale((await params).locale))('pages.dashboard'),
  robots: { index: false, follow: false }
});

export default async function DashboardLayout({ children, params }: LayoutProps) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const session = await auth();

  if (!session) {
    return (
      <Login
        locale={locale}
        heading={t('dashboard.signInHeading')}
        blurb={t('dashboard.signInBlurb')}
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
        <header className="enter pt-8 pb-4 sm:pt-12 sm:pb-6">
          <h1 className="text-h1">{t('pages.dashboard')}</h1>
        </header>

        <DashboardNav isAdmin={session.user.perms >= permissions.admin} />

        {children}
      </Container>
    </main>
  );
}
