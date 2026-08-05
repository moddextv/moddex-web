import { Container } from '@/components/UI/Container';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'channel',
  description: 'search for twitch channels to lookup their mods/vips'
};

export default function ChannelPage() {
  return (
    <main className="flex-grow">
      <Container className="py-20">
        <h1 className="font-cairo text-3xl tracking-tight mb-2">
          Look up a channel
        </h1>
        <p className="text-primary-400 mb-8 max-w-md">
          Who holds mod and vip in a channel, and since when. Searching a channel
          for the first time is what adds it to the index.
        </p>
        <div className="max-w-md">
          <SearchUser type="channel" />
        </div>
      </Container>
    </main>
  );
}
