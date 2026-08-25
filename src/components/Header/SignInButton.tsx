'use client';

import { FC } from 'react';
import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import { TwitchIcon } from '@/components/Icons';
import { signInOptions } from '@/utils/signIn';
import { useT } from '@/i18n/context';

export const SignInButton: FC = () => {
  const pathname = usePathname();
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => signIn('twitch', signInOptions(pathname))}
      className="btn btn-twitch shrink-0 w-10 px-0 sm:w-auto sm:px-[18px]"
    >
      <TwitchIcon size={18} color="text-white" />
      <span className="hidden sm:inline">{t('nav.signInShort')}</span>
    </button>
  );
};
