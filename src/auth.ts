import { getUserLogin, getUserPermission } from '@/utils/user';
import Twitch from 'next-auth/providers/twitch';
import NextAuth from 'next-auth';
import { serverConfig } from '@/serverConfig';

export const { handlers, auth, signIn } = NextAuth({
  secret: serverConfig.authSecret,
  providers: [
    Twitch({
      clientId: serverConfig.twitch.clientId,
      clientSecret: serverConfig.twitch.clientSecret
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const [login, userPermission] = await Promise.all([
          getUserLogin(account?.providerAccountId),
          getUserPermission(account?.providerAccountId)
        ]);

        token.login = login;
        token.perms = userPermission;
        token.id = account?.providerAccountId;
      }

      return token;
    },
    session({ session, token }) {
      session.user.perms = token.perms as number;
      session.user.id = token.id as string;
      session.user.login = token.login as string;

      return session;
    }
  }
});
