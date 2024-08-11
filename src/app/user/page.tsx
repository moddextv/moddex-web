import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'user',
  description: 'search for tracked channels where a twitch user has mod/vip privileges in'
};

export default function UserPage() {
  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col justify-center text-center">
      <Title mb="lg">modchecker</Title>
      <SearchUser type="user" />
    </main>
  );
}
