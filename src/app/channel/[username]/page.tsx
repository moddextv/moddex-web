import { BannedUser, Forbidden, NotFound } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { regex } from '@/utils/regex';
import { Metadata } from 'next';
import { db } from '@/misc/Database';
import { redirect } from 'next/navigation';
import { Container } from '@/components/UI/Container';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  return {
    title: `channel ${params.username}`
  };
};

export default async function ChannelUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);

  if (!regex.username.test(username)) {
    return <NotFound
      error={`invalid username`}
      message={`«${username}» is not a valid twitch username`}
    />;
  }

  const { user, banReason } = await getUser(username);

  if (banReason) {
    let errorMessage;

    switch (banReason?.toLowerCase()) {
      case 'tos_banned':
        errorMessage = `user «${username}» is banned.`;
        break;
      case 'deactivated':
        errorMessage = `user «${username}» has deactivated their account.`;
        break;
      default:
        errorMessage = `user «${username}» is unavailable.`;
        break;
    }

    return (
      <BannedUser
        error={errorMessage}
        message={`reason: ${banReason}`}
        showReloadButton={true}
      />
    );
  }

  if (!user) {
    return <NotFound
      error={`user «${username}» not found`}
      message={`this user does not exist`}
    />;
  }

  if (user.ignored) {
    return <Forbidden
      error={`access forbidden`}
      message={`user «${username}» has opted-out of being tracked`}
    />;
  }

  if (user.login !== username) {
    await db.query('UPDATE users SET login=?, name=? WHERE id=?', [user.login, user.name, user.id]);
    return redirect(`/channel/${user.login}`);
  }

  return (
    <main className="flex-grow">
      <Container className="py-12 flex flex-col gap-10">
        <UserProfile user={user} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          <UserList type="channel" role="mods" user={user} />
          <UserList type="channel" role="vips" user={user} />
        </div>
      </Container>
    </main>
  );
}
