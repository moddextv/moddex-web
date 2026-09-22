import { auth, signIn } from '@/auth';
import { Locale, localePath } from '@/i18n/locales';
import { getTranslator } from '@/i18n/dictionary';
import { getChannelConnection } from '@/utils/api/moddex/me';
import { claimState } from '@/utils/claim';
import { TwitchIcon } from '@/components/Icons';
import { UserType } from '@/misc/roles';
import { CSSProperties } from 'react';

interface ClaimPanelProps {
  locale: Locale;
  type: UserType;
  userId: string;
  login: string;
}

const COPY = {
  user: {
    ask: 'claim.user.ask',
    signIn: 'claim.user.signIn',
    yours: 'claim.user.yours',
    connect: 'claim.user.connect'
  },
  channel: {
    ask: 'claim.channel.ask',
    signIn: 'claim.channel.signIn',
    yours: 'claim.channel.yours',
    connect: 'claim.channel.connect'
  }
} as const;

export const ClaimPanel = async ({ locale, type, userId, login }: ClaimPanelProps) => {
  const session = await auth();
  const viewerId = session?.user?.id;
  const connected =
    viewerId === userId
      ? await getChannelConnection(userId)
          .then((connection) => connection.connected)
          .catch(() => false)
      : false;
  const state = claimState(viewerId, userId, connected);

  if (!state) return null;

  const t = getTranslator(locale);
  const copy = COPY[type];
  const back = localePath(locale, `/${type}/${login}`);

  return (
    <section className="enter pt-6" style={{ '--i': 1 } as CSSProperties} aria-labelledby="claim">
      <div className="panel flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="min-w-0">
          <p id="claim" className="text-base font-bold mb-1">
            {t(state === 'signIn' ? copy.ask : copy.yours)}
          </p>
          <p className="text-read text-primary-300 max-w-[56ch]">
            {t(state === 'signIn' ? copy.signIn : copy.connect)}
          </p>
        </div>

        {state === 'signIn' ? (
          <form
            action={async () => {
              'use server';
              await signIn('twitch', { redirectTo: back });
            }}
          >
            <button type="submit" className="btn btn-twitch shrink-0">
              <TwitchIcon size={16} color="text-white" />
              {t('login.continue')}
            </button>
          </form>
        ) : (
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="/api/connect/channel" className="btn btn-twitch-quiet shrink-0">
            <TwitchIcon size={16} />
            {t('claim.connect')}
          </a>
        )}
      </div>
    </section>
  );
};
