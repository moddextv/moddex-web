import { NotFound } from '@/components/Errors';
import { UserList } from '@/components/User/UserList';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { Metadata } from 'next';

interface PageProps {
  params: { username: string };
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  return {
    title: `channel ${params.username}`
  }
}

export default async function ChannelUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);

  const user = await getUser(username);
  if (!user || user.ignored) {
    return (
      <NotFound
        error={`user «${username}» not found`}
        message={`this could also mean, that the user has opted-out from being tracked.`}
      />
    );
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
