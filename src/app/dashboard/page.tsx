import { auth } from '@/auth';
import { Metadata } from 'next';
import { Login } from '@/components/Login';
import { constants } from '@/utils/constants';
import { Forbidden } from '@/components/Errors';

export const metadata: Metadata = {
  title: 'dashboard'
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    return <Login />
  }

  if (session.user.perms < constants.permissions.team) {
    return <Forbidden message="You do not have the permission to access this page." />
  }

  return <h1>Willkommen im Dashboard, {session.user.name}</h1>;
}
