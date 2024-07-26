import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'channel',
  description: 'search for twitch channels to lookup their mods/vips'
}

export default function ChannelPage() {
  return (
    <>
      <Title mb="lg" className="text-center">
        modchecker
      </Title>
      <SearchUser type="channel" />
    </>
  );
}
