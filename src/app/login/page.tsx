import { auth, signIn } from '@/auth';
import { TwitchIcon } from '@/components/Icons';
import { Title } from '@/components/UI/Title';
import { Button } from '@nextui-org/react';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="flex flex-col text-center">
      <Title size="lg">You need to login to see this page</Title>
      <form
        action={async () => {
          'use server';
          await signIn('twitch', { redirectTo: '/' });
        }}
      >
        <Button
          type="submit"
          startContent={<TwitchIcon size={20} color="text-primary-300" />}
          className="font-cairo text-medium bg-twitch"
        >
          login
        </Button>
      </form>
    </div>
  );
}
