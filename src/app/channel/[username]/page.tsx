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
    title: `channel ${params.username}`
  };
};

export default async function ChannelUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);
  const userId = await getUserId(username);

  const user = await getUser(userId);
  if (!user || user.ignored) {
    return (
      <NotFound
        error={`channel «${username}» not found`}
        message={`this could also mean, that the channel owner has opted-out from being tracked.`}
      />
    );
  }

  if (user.login !== username) {
    await db.query('UPDATE user SET login=?, name=? WHERE id=?', [user.login, user.name, user.id]);
    redirect(`/channel/${user.login}`);
  }

  return (
    <>
      <UserProfile user={user} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList type="channel" role="mods" user={user} />
        <UserList type="channel" role="vips" user={user} />
      </div>
    </>
  );
}
