import { BannedUser, InvalidUsername, NotFoundUser, OptedOut } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { regex } from '@/utils/regex';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/UI/Container';
import { CSSProperties } from 'react';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const username = decodeURI(params.username);

  return {
    title: username,
    description: `Everyone holding mod, vip or founder in ${username}'s channel, and the date each role was granted.`
  };
};

export default async function ChannelUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);

  if (!regex.username.test(username)) {
    return <InvalidUsername username={username} />;
  }

  const { user, banReason } = await getUser(username);

  // the reason is passed through rather than translated here: the component
  // knows which reasons reverse and therefore which one gets a retry.
  if (banReason) {
    return <BannedUser username={username} reason={banReason} />;
  }

  if (!user) {
    return <NotFoundUser username={username} />;
  }

  if (user.ignored) {
    return <OptedOut username={username} />;
  }

  if (user.login !== username) {
    // no write here: moddex-api upserts login and name on every lookup, so
    // `user` above is already current and this only has to redirect.
    return redirect(`/channel/${user.login}`);
  }

  return (
    <main id="main" className="flex-grow">
      <Container>
        <UserProfile user={user} />

        {/* mods get a full column to themselves because they are almost always
            the longest list by an order of magnitude; vips and founders share
            the other one. a three-across grid gave the mod list a third of the
            width and made it scroll for every channel. */}
        {/* items-start, because grid columns stretch by default and the mod
            list caps its own height: a channel with 39 mods and 3 vips gave the
            mods panel 200px of empty raised surface below its last row, which
            read as a list that had failed to finish loading. */}
        <section
          className="enter grid items-start gap-6 lg:grid-cols-2 pb-6"
          style={{ '--i': 1 } as CSSProperties}
        >
          <UserList type="channel" role="mods" user={user} />

          <div className="flex flex-col gap-6">
            <UserList type="channel" role="vips" user={user} />
            <UserList type="channel" role="founders" user={user} />
          </div>
        </section>
      </Container>
    </main>
  );
}
