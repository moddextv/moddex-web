import { asLocale, localePath, ogLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { config } from '@/config';
import { BannedUser, InvalidUsername, NotFoundUser } from '@/components/Errors';
import { OptedOut } from '@/components/Notices';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';
import { roleTabIndex } from '@/misc/roles';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/UI/Container';
import { JsonLd, profileGraph } from '@/components/JsonLd';
import { RoleTabs } from '@/components/User/RoleTabs';
import { isEmpty, roleTabs, seedRoleLists } from '@/utils/roleSeed';
import { CSSProperties } from 'react';

const ROLES = ['mods', 'vips', 'founders'] as const;

const CHANNEL_TABS = [
  { key: 'mod', label: 'roles.title.channel.mod', role: 'mods' },
  { key: 'vip', label: 'roles.title.channel.vip', role: 'vips' },
  { key: 'founder', label: 'roles.title.channel.founder', role: 'founders' }
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
  const label = tab !== null && role ? CHANNEL_TABS[tab]?.label : undefined;
  const title = label ? `${name} · ${getTranslator(locale)(label)}` : name;

  if (!user) return { title, robots: { index: false, follow: false } };

  if (isEmpty(await seedRoleLists(user.id, 'channel', ROLES))) {
    return { title, robots: { index: false, follow: false } };
  }

  return {
    title,
    description: `Everyone holding mod, vip or founder in ${name}'s Twitch channel, and the date each role was granted.`,
    alternates: alternatesFor(`/channel/${user.login}`, locale),
    openGraph: {
      type: 'profile',
      siteName: config.brand.name,
      locale: ogLocale(locale),
      url: `/channel/${user.login}`
    }
  };
};

export default async function ChannelUsernamePage({ params }: PageProps) {
  const { username: rawName, locale: rawLocale, role } = await params;
  const username = decodeURI(rawName);
  const locale = asLocale(rawLocale);

  if (!isUsername(username)) {
    return <InvalidUsername username={username} />;
  }

  const tab = roleTabIndex(role);

  if (tab === null) {
    return redirect(localePath(locale, `/channel/${username}`));
  }

  const segment = role ? `/${role}` : '';
  const t = getTranslator(locale);

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
    return redirect(localePath(locale, `/channel/${user.login}${segment}`));
  }

  const seeded = await seedRoleLists(user.id, 'channel', ROLES);
  const path = localePath(locale, `/channel/${user.login}`);

  return (
    <main id="main" className="flex-grow">
      <JsonLd data={profileGraph('channel', user.login, user.name || user.login)} />
      <Container>
        <UserProfile user={user} />

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <RoleTabs tabs={roleTabs(seeded, CHANNEL_TABS, t, path)} initial={tab}>
            <UserList type="channel" role="mods" user={user} initial={seeded.mods} tabbed />
            <UserList type="channel" role="vips" user={user} initial={seeded.vips} tabbed />
            <UserList type="channel" role="founders" user={user} initial={seeded.founders} tabbed />
          </RoleTabs>
        </section>
      </Container>
    </main>
  );
}
