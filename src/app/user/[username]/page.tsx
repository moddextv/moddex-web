import { Forbidden, NotFound, BannedUser } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { Metadata } from 'next';
import { db } from '@/misc/Database';
import { redirect } from 'next/navigation';
import { Button, Link } from '@heroui/react';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  return {
    title: `user ${params.username}`
  };
};

export default async function ChannelUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);

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
    return redirect(`/user/${user.login}`);
  }

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col gap-8">
      <UserProfile user={user} isUser={true} />

      <Button
        as={Link}
        size="md"
        radius="sm"
        className="w-fit"
        href={`/channel/${user.login}`}
      >
        view channel
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList type="user" role="modding" user={user} />
        <UserList type="user" role="viping" user={user} />
      </div>

      <p className="text-lg">can&apos;t find a mod/vip in the list? You can index a channel by looking one up <a
        className="underline" href={'/channel'}>here</a>.</p>
    </main>
  );
}
