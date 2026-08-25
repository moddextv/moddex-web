import { Metadata } from 'next';
import { auth } from '@/auth';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { Login } from '@/components/Login';
import { OptOut } from '@/components/Settings/OptOut';
import { ChatBadge } from '@/components/Settings/ChatBadge';
import { ConnectChannel } from '@/components/Settings/ConnectChannel';
import { ConnectDiscord } from '@/components/Settings/ConnectDiscord';
import { SignOutButton } from '@/components/Settings/SignOutButton';
import { getAvailableUserChatBadges, getSelectedUserChatBadge } from '@/utils/badges';
import { getChannelConnection } from '@/utils/api/moddex/me';
import { getUserById, getUserIgnoreState } from '@/utils/user';
import { UserChatBadges } from '@/misc/badges';
import { config } from '@/config';
import Link from 'next/link';
import { CSSProperties, FC, ReactNode } from 'react';

export const metadata: Metadata = {
  alternates: { canonical: '/settings' },
  robots: { index: false, follow: false },
  title: 'Settings',
  description: `Opt out of ${config.brand.domain}, or choose which badge shows next to your name.`
};

const CHANNEL_MESSAGES: Record<string, string> = {
  connected: 'Channel connected. Moderator and VIP changes now reach moddex as they happen.',
  'connected-nosync':
    "Channel connected, but we couldn't save the list of channels you moderate. Live updates are working. Reconnect later to add the list.",
  canceled: 'Canceled. Your channel is unchanged.',
  mismatch:
    "You approved that on Twitch as a different account from the one you're signed in with here, so we refused the connection.",
  scopes:
    'Twitch withheld one of the two permissions. We need both for moderator and VIP events, so the channel stayed disconnected.',
  state: "That link expired or didn't belong to this session. Start again from the button above.",
  exchange: "Twitch didn't confirm the authorization. Try again.",
  nocode: 'Twitch sent back no authorization. Try again.',
  failed:
    'Something went wrong while saving, and your settings are unchanged. Try again in a moment.',
  unconfigured: "Channel connections aren't set up on this server yet.",
  signin: 'Your session ended before this finished. Sign in and try again.'
};

const DISCORD_MESSAGES: Record<string, string> = {
  connected: 'Discord connected. It now shows on your public profile.',
  canceled: 'Canceled. No Discord account was linked.',
  taken:
    'That Discord account is already connected to another moddex profile. Disconnect it there first.',
  state: "That link expired or didn't belong to this session. Start again from the button above.",
  exchange: "Discord didn't confirm the account. Try again.",
  nocode: 'Discord sent back no authorization. Try again.',
  failed:
    'Something went wrong while saving, and your profile is unchanged. Try again in a moment.',
  unconfigured: "Discord connections aren't set up on this server yet.",
  signin: 'Your session ended before this finished. Sign in and try again.'
};

const Fact: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row cols-fact">
    <span className="text-base text-primary-300">{label}</span>
    {children}
  </div>
);

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ discord?: string; channel?: string }>;
}) {
  const { discord: discordStatus, channel: channelStatus } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return <Login heading="Settings need a Twitch sign-in" redirectTo="/settings" />;
  }

  const userId = session.user.id;
  const login = session.user.login;

  const userChatBadges: UserChatBadges = { available: [], selected: '' };

  const [isIgnored, availableUserChatBadges, self, connection] = await Promise.all([
    getUserIgnoreState(userId),
    getAvailableUserChatBadges(userId),
    getUserById(userId, userId).catch(() => null),
    getChannelConnection(userId).catch(() => ({ connected: false, everConnected: false }))
  ]);

  const discordId = self?.discord ?? null;

  if (availableUserChatBadges.length) {
    userChatBadges.selected = await getSelectedUserChatBadge(userId);
    userChatBadges.available = [{ name: 'none', svg: '', webp: '' }, ...availableUserChatBadges];
  }

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-2">Settings</h1>
          <p className="text-ui text-primary-400">
            Signed in as {login}. Changes save immediately.
          </p>
        </header>

        <section
          className="enter pb-6"
          style={{ '--i': 1 } as CSSProperties}
          aria-labelledby="settings-privacy"
        >
          <div className="panel">
            <div className="flex items-center gap-3 mb-5">
              <span className="corner corner-tl text-mod" aria-hidden="true" />
              <h2 id="settings-privacy" className="text-h2">
                Privacy
              </h2>
            </div>

            <OptOut initialIsIgnored={isIgnored} />
          </div>
        </section>

        {userChatBadges.available.length > 0 && (
          <section
            className="enter pb-6"
            style={{ '--i': 2 } as CSSProperties}
            aria-labelledby="settings-badge"
          >
            <div className="panel">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="corner corner-br text-vip" aria-hidden="true" />
                <h2 id="settings-badge" className="text-h2">
                  Chat badge
                </h2>
                <span className="ml-auto text-ui text-founder">
                  Chat integration isn&apos;t live yet
                </span>
              </div>
              <p className="text-read text-primary-300 mb-6">
                Pick one now and it&apos;s already set when chat integration ships.
              </p>

              <ChatBadge userChatBadges={userChatBadges} login={login} />
            </div>
          </section>
        )}

        <section
          className="enter pb-4"
          style={{ '--i': 3 } as CSSProperties}
          aria-labelledby="settings-channel"
        >
          <div className="panel">
            <h2 id="settings-channel" className="text-h2 mb-1">
              Live role updates
            </h2>
            <p className="text-ui text-primary-400 mb-5">For your own channel. Optional.</p>

            <ConnectChannel
              initialConnected={connection.connected}
              everConnected={connection.everConnected}
            />

            {CHANNEL_MESSAGES[channelStatus ?? ''] && (
              <p className="mt-5 text-ui text-primary-300 max-w-prose">
                {CHANNEL_MESSAGES[channelStatus ?? '']}
              </p>
            )}
          </div>
        </section>

        <section
          className="enter pb-4"
          style={{ '--i': 4 } as CSSProperties}
          aria-labelledby="settings-account"
        >
          <div className="panel-flush">
            <h2 id="settings-account" className="text-h2 px-4 pb-5">
              Account
            </h2>

            <div className="rows">
              <Fact label="Signed in as">
                <span className="flex items-center gap-3">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? 'Your Twitch avatar'}
                      width={32}
                      height={32}
                      radius="full"
                      className="w-8 h-8 bg-primary-700"
                    />
                  ) : (
                    <span className="avatar w-8 h-8 text-meta" aria-hidden="true">
                      {login.slice(0, 1)}
                    </span>
                  )}
                  <span className="text-base font-bold">{login}</span>
                </span>
              </Fact>

              <Fact label="Public profile">
                <Link
                  href={`/user/${login}`}
                  className="text-base text-primary-100 font-semibold hover:underline"
                >
                  {config.brand.domain}/u/{login}
                </Link>
              </Fact>

              <Fact label="Discord">
                <ConnectDiscord initialDiscordId={discordId} />
              </Fact>

              {DISCORD_MESSAGES[discordStatus ?? ''] && (
                <p className="px-4 py-3 text-ui text-primary-300 max-w-prose">
                  {DISCORD_MESSAGES[discordStatus ?? '']}
                </p>
              )}
            </div>

            <div className="px-4 pt-5 pb-2">
              <SignOutButton />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
