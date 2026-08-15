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
import { isEmpty, seedRoleLists } from '@/utils/roleSeed';
import { CSSProperties } from 'react';

const ROLES = ['mods', 'vips', 'founders'] as const;

interface PageProps {
  params: Promise<{ username: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const username = decodeURI((await params).username);

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
    alternates: { canonical: `/channel/${user.login}` },
    openGraph: {
      type: 'profile',
      siteName: config.brand.name,
      locale: 'en_US',
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

        <section
          className="enter grid items-start gap-6 lg:grid-cols-2 pb-6"
          style={{ '--i': 1 } as CSSProperties}
        >
          <UserList type="channel" role="mods" user={user} initial={seeded.mods} />

          <div className="flex flex-col gap-6">
            <UserList type="channel" role="vips" user={user} initial={seeded.vips} />
            <UserList type="channel" role="founders" user={user} initial={seeded.founders} />
          </div>
        </section>
      </Container>
    </main>
  );
}
