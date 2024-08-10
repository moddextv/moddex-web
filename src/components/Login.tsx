import { Title } from '@/components/UI/Title';
import { signIn } from '@/auth';
import { Button } from '@nextui-org/react';
import { TwitchIcon } from '@/components/Icons';

export const Login = () => {

  return (
    <div className="flex flex-col text-center">
      <Title size="lg" mb="md">You need to login to access this page</Title>
      <form
        action={async () => {
          'use server';
          await signIn('twitch');
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