import { asLocale, localePath, ogLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { config } from '@/config';
import { BannedUser, InvalidUsername, NotFoundUser } from '@/components/Errors';
import { OptedOut } from '@/components/Notices';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { ClaimPanel } from '@/components/User/ClaimPanel';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';
import { roleTabIndex } from '@/misc/roles';
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
  { key: 'mod', label: 'roles.title.user.mod', role: 'modding' },
  { key: 'vip', label: 'roles.title.user.vip', role: 'viping' },
  { key: 'founder', label: 'roles.title.user.founder', role: 'founding' }
] as const;

interface PageProps {
  params: Promise<{ username: string; locale: string; role?: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { username: rawName, locale: rawLocale, role } = await params;
  const locale = asLocale(rawLocale);
  const username = decodeURI(rawName);

  if (!isUsername(username)) return { title: username, robots: { index: false, follow: false } };

  const { user } = await getUser(username);
  const name = user?.name || username;
  const tab = roleTabIndex(role);
  const label = tab !== null && role ? USER_TABS[tab]?.label : undefined;
  const title = label ? `${name} · ${getTranslator(locale)(label)}` : name;

  if (!user) return { title, robots: { index: false, follow: false } };

  if (isEmpty(await seedRoleLists(user.id, 'user', ROLES))) {
    return { title, robots: { index: false, follow: false } };
  }

  return {
    title,
    description: `Every indexed Twitch channel where ${name} holds mod, vip or founder, and the date each role was granted.`,
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
  const { username: rawName, locale: rawLocale, role } = await params;
  const username = decodeURI(rawName);
  const locale = asLocale(rawLocale);
  const t = getTranslator(locale);

  if (!isUsername(username)) {
    return <InvalidUsername username={username} />;
  }

  const tab = roleTabIndex(role);

  if (tab === null) {
    return redirect(localePath(locale, `/user/${username}`));
  }

  const segment = role ? `/${role}` : '';

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
    return redirect(localePath(locale, `/user/${user.login}${segment}`));
  }

  const seeded = await seedRoleLists(user.id, 'user', ROLES);
  const path = localePath(locale, `/user/${user.login}`);

  return (
    <main id="main" className="flex-grow">
      <JsonLd data={profileGraph('user', user.login, user.name || user.login)} />
      <Container>
        <UserProfile user={user} isUser={true} />
        <ClaimPanel
          locale={locale}
          type="user"
          userId={user.id}
          login={user.login}
          connected={!!user.connected}
        />

        <section className="enter pb-6" style={{ '--i': 2 } as CSSProperties}>
          <RoleTabs tabs={roleTabs(seeded, USER_TABS, t, path)} initial={tab}>
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
