import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'user',
  description: 'search for tracked channels where a twitch user has mod/vip privileges in'
}

export default function UserPage() {
  return (
    <>
      <Title mb="lg" className="text-center">
        modchecker
      </Title>
      <SearchUser type="user" />
    </>
  );
}
