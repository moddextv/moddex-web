import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'channel',
  description: 'search for twitch channels to lookup their mods/vips'
}

export default function ChannelPage() {
  return (
    <div className="flex-grow text-center">
      <Title mb="lg">modchecker</Title>
      <SearchUser type="channel" />
    </div>
  );
}
