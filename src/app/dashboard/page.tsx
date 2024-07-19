import { NotFound } from '@/components/Errors';
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return <NotFound message="This page doesn't exists yet/anymore." />;
  }

  return <h1>Willkommen im Dashboard, {session.user.name}</h1>;
}
