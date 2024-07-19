import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      perms: number;
    } & DefaultSession['user'];
  }

  interface User {
    perms: number;
  }
}
