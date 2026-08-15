'use client';

import { signOut } from 'next-auth/react';

export const SignOutButton = () => (
  <button type="button" className="btn btn-danger" onClick={() => signOut()}>
    Sign out
  </button>
);
