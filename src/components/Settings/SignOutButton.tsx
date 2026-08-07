'use client';

import { signOut } from 'next-auth/react';

/** the only place to sign out other than the account menu. */
export const SignOutButton = () => (
  <button type="button" className="btn btn-soft" onClick={() => signOut()}>
    Sign out
  </button>
);
