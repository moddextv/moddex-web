import { Container } from '@/components/UI/Container';
import { SearchUser } from '@/components/User/SearchUser';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'user',
  description: 'search for tracked channels where a twitch user has mod/vip privileges in'
};

export default function UserPage() {
  return (
    <main className="flex-grow">
      <Container className="py-20">
        <h1 className="font-cairo text-3xl tracking-tight mb-2">
          Look up a person
        </h1>
        <p className="text-primary-400 mb-8 max-w-md">
          Every indexed channel where they hold mod or vip — the direction twitch
          itself will not show you.
        </p>
        <div className="max-w-md">
          <SearchUser type="user" />
        </div>
      </Container>
    </main>
  );
}
