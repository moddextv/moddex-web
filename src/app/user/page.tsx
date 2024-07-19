import { Title } from '@/components/UI/Title';
import { SearchUser } from '@/components/User/SearchUser';

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
