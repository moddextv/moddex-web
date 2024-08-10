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

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col gap-8">
      <h1>Willkommen im Dashboard, {session.user.name}</h1>
    </main>
  )
}
