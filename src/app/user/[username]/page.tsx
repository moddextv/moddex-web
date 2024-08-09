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
    title: `user ${params.username}`
  };
};

const handleNotFound = (username: string) => (
  <NotFound
    error={`user «${username}» not found`}
    message={`this could also mean, that the channel owner has opted-out from being tracked.`}
  />
);

export default async function UserUsernamePage({ params }: PageProps) {
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
    return redirect(`/user/${user.login}`);
  }

  return (
    <>
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
    </>
  );
}
