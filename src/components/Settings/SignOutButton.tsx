'use client';

import { useT } from '@/i18n';
import { signOut } from 'next-auth/react';

export const SignOutButton = () => {
  const t = useT();

  return (
    <button type="button" className="btn btn-danger" onClick={() => signOut()}>
      {t('nav.signOut')}
    </button>
  );
};
