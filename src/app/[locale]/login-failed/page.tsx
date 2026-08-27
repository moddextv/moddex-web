import { asLocale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { SignInFailed } from '@/components/SignInFailed';

// auth() reads a cookie, so nothing here may be baked at build
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    alternates: alternatesFor('/login-failed', locale),
    robots: { index: false, follow: false },
    title: t('errors.signIn.heading')
  };
};

export default async function LoginFailedPage({ params, searchParams }: PageProps) {
  const locale = asLocale((await params).locale);
  const { error } = await searchParams;
  const session = await auth();

  // a session means the sign-in worked, whatever the error parameter says: a
  // replayed callback finds the one-time check already spent and reports a
  // failure that has already succeeded
  if (session?.user?.id) {
    redirect(localePath(locale, '/settings'));
  }

  return <SignInFailed locale={locale} error={error} redirectTo="/settings" />;
}
