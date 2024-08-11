import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'channel',
  description: 'search for twitch channels to lookup their mods/vips'
}

export default function ChannelPage() {
  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col justify-center text-center">
      <Title mb="lg">modchecker</Title>
      <SearchUser type="channel" />
    </main>
  );
}
