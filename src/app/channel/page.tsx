import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';

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
