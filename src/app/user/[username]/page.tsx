import {
  BannedUser,
  InvalidUsername,
  NotFoundUser,
  OptedOut
} from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { regex } from '@/utils/regex';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/UI/Container';
import Link from 'next/link';
import { CSSProperties } from 'react';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const username = decodeURI(params.username);

  return {
    title: username,
    description: `Every indexed twitch channel where ${username} holds mod or vip, and the date each role was granted.`
  };
};

export default async function UserUsernamePage({ params }: PageProps) {
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
    return redirect(`/user/${user.login}`);
  }

  return (
    <main id="main" className="flex-grow">
      <Container>
        <UserProfile user={user} isUser={true} />

        {/* two lists, not three. a person's founder entitlements are not
            reachable through the user root of twitch's api, only through the
            channel root, so there is no founders list to render on this side. */}
        <section
          className="enter grid items-start gap-6 lg:grid-cols-2 pb-6"
          style={{ '--i': 1 } as CSSProperties}
        >
          <UserList type="user" role="modding" user={user} />

          <div className="flex flex-col gap-6">
            <UserList type="user" role="viping" user={user} />

            {/* the index is demand driven, so a gap names the action that
                closes it rather than leaving the reader to assume the record
                is wrong. */}
            <div className="panel flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <p className="text-read text-primary-300 max-w-[46ch]">
                Missing a channel? It only appears here once somebody has looked
                that channel up. Search for it once and it stays indexed.
              </p>
              <Link href="/channel" className="btn btn-soft shrink-0">
                Index a channel
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
