import { getUserLogin, getUserPermission } from '@/utils/user';
import Twitch from 'next-auth/providers/twitch';
import NextAuth from 'next-auth';
import { logger } from '@/misc/Logger';
import { recordLogin } from '@/utils/api/moddex/internal';
import { serverConfig } from '@/serverConfig';

export const { handlers, auth, signIn } = NextAuth({
  secret: serverConfig.authSecret,
  // without this next-auth serves its own unstyled, untranslated page
  pages: { error: '/login-failed' },
  providers: [
    Twitch({
      clientId: serverConfig.twitch.clientId,
      clientSecret: serverConfig.twitch.clientSecret
    })
  ],
  events: {
    // not awaited: a sign-in that cannot be recorded is still a sign-in
    signIn({ account }) {
      const id = account?.providerAccountId;
      if (!id) return;

      void recordLogin(id).catch((error) =>
        logger.warn(`could not record ${id} signing in`, error)
      );
    }
  },
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
