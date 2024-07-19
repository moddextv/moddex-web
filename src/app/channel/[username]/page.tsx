import { NotFound } from '@/components/Errors';
import { UserProfile } from '@/components/User/UserProfile';
import { getUser } from '@/utils/user';
import { UserLists } from '@/components/User/UserLists';

interface PageProps {
  params: { username: string };
}

export default async function ChannelUsernamePage({ params }: PageProps) {
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
      <UserProfile user={user} />
      <UserLists user={user} />
    </>
  );
}
