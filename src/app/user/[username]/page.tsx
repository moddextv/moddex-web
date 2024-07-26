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

export default async function UserUsernamePage({ params }: PageProps) {
  const username = decodeURI(params.username);

  const user = await getUser(username);
  if (!user) {
    return (
      <NotFound
        error={`user «${username}» not found`}
        message={`this could also mean, that the user has opted-out from being tracked.`}
      />
    );
  }

  return (
    <>
      <UserProfile user={user} isUser={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList type="user" role="modding" user={user} />
        <UserList type="user" role="viping" user={user} />
      </div>
    </>
  );
}
