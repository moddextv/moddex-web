import { NotFound } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser, getUserId } from '@/utils/user';
import { Metadata } from 'next';
import { db } from '@/misc/Database';
import { redirect } from 'next/navigation';
import { Button, Link } from '@nextui-org/react';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  return {
    title: `channel ${params.username}`
  };
};

const handleNotFound = (username: string) => (
  <NotFound
    error={`user «${username}» not found`}
    message={`this could also mean, that the channel owner has opted-out from being tracked.`}
  />
);

export default async function ChannelUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);
  const userId = await getUserId(username);

  if (!userId) {
    return handleNotFound(username);
  }

  const user = await getUser(userId);
  if (!user || user.ignored) {
    return handleNotFound(username);
  }

  if (user.login !== username) {
    await db.query('UPDATE users SET login=?, name=? WHERE id=?', [user.login, user.name, user.id]);
    return redirect(`/channel/${user.login}`);
  }

  return (
    <>
      <UserProfile user={user} />

      <Button
        as={Link}
        size="md"
        radius="sm"
        className="w-fit"
        href={`/user/${user.login}`}
      >
        view user
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList type="channel" role="mods" user={user} />
        <UserList type="channel" role="vips" user={user} />
      </div>
    </>
  );
}
