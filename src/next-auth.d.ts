import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      perms: number;
      login: string;
    } & DefaultSession['user'];
  }

  interface User {
    perms: number;
  }
}
