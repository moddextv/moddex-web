import { NotFound } from '@/components/Errors';
import { auth } from '@/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'dashboard'
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return <NotFound message="This page doesn't exists yet/anymore." />;
  }

  return <h1>Willkommen im Dashboard, {session.user.name}</h1>;
}
