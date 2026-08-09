import { getUserPermission } from '@/utils/user';
import Twitch from '@auth/core/providers/twitch';
import NextAuth from 'next-auth';
import { config } from '@/config';
import { getUser } from '@/utils/api/ivr';

export const { handlers, auth, signIn } = NextAuth({
  secret: config.authSecret,
  providers: [
    Twitch({
      clientId: config.twitch.clientId,
      clientSecret: config.twitch.clientSecret
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const [twitchUser, userPermission] = await Promise.all([
          getUser(account?.providerAccountId),
          getUserPermission(account?.providerAccountId)
        ]);

        token.login = twitchUser?.login || '';
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
