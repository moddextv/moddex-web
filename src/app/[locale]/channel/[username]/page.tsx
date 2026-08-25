import { alternatesFor } from '@/misc/metadata';
import { asLocale, ogLocale } from '@/i18n/locales';
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
import { CSSProperties } from 'react';

const ROLES = ['mods', 'vips', 'founders'] as const;

const CHANNEL_TABS = [
  { key: 'mod', label: 'Moderators', role: 'mods' },
  { key: 'vip', label: 'VIPs', role: 'vips' },
  { key: 'founder', label: 'Founders', role: 'founders' }
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

  if (isEmpty(await seedRoleLists(user.id, 'channel', ROLES))) {
    return { title, robots: { index: false, follow: false } };
  }

  return {
    title,
    description: `Everyone holding mod, vip or founder in ${title}'s Twitch channel, and the date each role was granted.`,
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
  const username = decodeURI((await params).username);

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
    return redirect(`/channel/${user.login}`);
  }

  const seeded = await seedRoleLists(user.id, 'channel', ROLES);

  return (
    <main id="main" className="flex-grow">
      <JsonLd data={profileGraph('channel', user.login, user.name || user.login)} />
      <Container>
        <UserProfile user={user} />

        <section className="enter pb-6" style={{ '--i': 1 } as CSSProperties}>
          <RoleTabs tabs={roleTabs(seeded, CHANNEL_TABS)}>
            <UserList type="channel" role="mods" user={user} initial={seeded.mods} tabbed />
            <UserList type="channel" role="vips" user={user} initial={seeded.vips} tabbed />
            <UserList type="channel" role="founders" user={user} initial={seeded.founders} tabbed />
          </RoleTabs>
        </section>
      </Container>
    </main>
  );
}
