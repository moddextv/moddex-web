import { NotFound } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { Metadata } from 'next';
import { getUserId } from '@/utils/api/twitch/helix';
import { db } from '@/misc/Database';
import { redirect } from 'next/navigation';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  return {
    title: `user ${params.username}`
  };
};

export default async function UserUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);
  const userId = await getUserId(username);

  const user = await getUser(userId);
  if (!user || user.ignored) {
    return (
      <NotFound
        error={`user «${username}» not found`}
        message={`this could also mean, that the user has opted-out from being tracked.`}
      />
    );
  }

  if (user.login !== username) {
    await db.query('UPDATE user SET login=?, name=? WHERE id=?', [user.login, user.name, user.id]);
    redirect(`/user/${user.login}`);
  }

  return (
    <>
      <UserProfile user={user} isUser={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList type="user" role="modding" user={user} />
        <UserList type="user" role="viping" user={user} />
      </div>

      <p className="mt-4 text-lg">can&apos;t find a mod/vip in the list? You can index a channel by looking one up <a
        className="underline" href={'/channel'}>here</a>.</p>
    </>
  );
}
