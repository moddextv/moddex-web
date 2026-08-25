import { alternatesFor } from '@/misc/metadata';
import { asLocale, localePath, ogLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { config } from '@/config';
import { BannedUser, InvalidUsername, NotFoundUser } from '@/components/Errors';
import { OptedOut } from '@/components/Notices';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/UI/Container';
import { JsonLd, profileGraph } from '@/components/JsonLd';
import { RoleTabs } from '@/components/User/RoleTabs';
import { isEmpty, roleTabs, seedRoleLists } from '@/utils/roleSeed';
import Link from 'next/link';
import { CSSProperties } from 'react';

const ROLES = ['modding', 'viping', 'founding'] as const;

const USER_TABS = [
  { key: 'mod', label: 'Moderating', role: 'modding' },
  { key: 'vip', label: 'Holding VIP', role: 'viping' },
  { key: 'founder', label: 'Founding', role: 'founding' }
] as const;

interface PageProps {
  params: Promise<{ username: string; locale: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { username: rawName, locale: rawLocale } = await params;
  const locale = asLocale(rawLocale);
  const username = decodeURI(rawName);

  if (!isUsername(username)) return { title: username, robots: { index: false, follow: false } };

  const { user } = await getUser(username);
  const title = user?.name || username;

  if (!user) return { title, robots: { index: false, follow: false } };

  if (isEmpty(await seedRoleLists(user.id, 'user', ROLES))) {
    return { title, robots: { index: false, follow: false } };
  }

  return {
    title,
    description: `Every indexed Twitch channel where ${title} holds mod, vip or founder, and the date each role was granted.`,
    alternates: alternatesFor(`/user/${user.login}`, locale),
    openGraph: {
      type: 'profile',
      siteName: config.brand.name,
      locale: ogLocale(locale),
      url: `/user/${user.login}`
    }
  };
};

export default async function UserUsernamePage({ params }: PageProps) {
  const { username: rawName, locale: rawLocale } = await params;
  const username = decodeURI(rawName);
  const locale = asLocale(rawLocale);
  const t = getTranslator(locale);

  if (!isUsername(username)) {
    return <InvalidUsername username={username} />;
  }

  const { user, banReason, optedOut } = await getUser(username);

  if (banReason) {
    return <BannedUser username={username} reason={banReason} />;
  }

  if (optedOut) {
    return <OptedOut username={username} />;
  }

  if (!user) {
    return <NotFoundUser username={username} />;
  }

  if (user.login !== username) {
    return redirect(localePath(locale, `/user/${user.login}`));
  }

  const seeded = await seedRoleLists(user.id, 'user', ROLES);

  return (
    <main id="main" className="flex-grow">
      <JsonLd data={profileGraph('user', user.login, user.name || user.login)} />
      <Container>
        <UserProfile user={user} isUser={true} />

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <RoleTabs tabs={roleTabs(seeded, USER_TABS)}>
            <UserList type="user" role="modding" user={user} initial={seeded.modding} tabbed />
            <UserList type="user" role="viping" user={user} initial={seeded.viping} tabbed />
            <UserList type="user" role="founding" user={user} initial={seeded.founding} tabbed />
          </RoleTabs>

          <div className="panel mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <p className="text-read text-primary-300 max-w-[46ch]">{t('profile.missingChannel')}</p>
            <Link href={localePath(locale, '/channel')} className="btn btn-soft shrink-0">
              {t('profile.indexChannel')}
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
