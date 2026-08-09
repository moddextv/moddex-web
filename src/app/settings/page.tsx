import { Metadata } from 'next';
import { auth } from '@/auth';
import { Container } from '@/components/UI/Container';
import { Image } from '@/components/UI/Image';
import { Login } from '@/components/Login';
import { OptOut } from '@/components/Settings/OptOut';
import { ChatBadge } from '@/components/Settings/ChatBadge';
import { SignOutButton } from '@/components/Settings/SignOutButton';
import { getSelectedUserChatBadge, getUserChatBadges } from '@/utils/badges';
import { getUserIgnoreState } from '@/utils/user';
import { UserChatBadges } from '@/misc/Interfaces';
import { config } from '@/config';
import Link from 'next/link';
import { CSSProperties, FC, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Settings',
  description: `Opt out of ${config.brand.domain}, or choose which badge shows next to your name.`
};

const Fact: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
    <span className="text-base text-primary-300">{label}</span>
    {children}
  </div>
);

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Login
        heading="Settings need a twitch sign-in"
        redirectTo="/settings"
      />
    );
  }

  const userId = session.user.id;
  const login = session.user.login;

  const userChatBadges: UserChatBadges = { available: [], selected: '' };

  const [isIgnored, availableUserChatBadges] = await Promise.all([
    getUserIgnoreState(userId),
    getUserChatBadges(userId)
  ]);

  if (availableUserChatBadges.length) {
    userChatBadges.selected = await getSelectedUserChatBadge(userId);
    // `none` first, so clearing the badge is as reachable as setting one
    userChatBadges.available = [
      { name: 'none', path: '' },
      ...availableUserChatBadges
    ];
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

        {/* only rendered when the account actually holds a badge. an empty
            picker is a setting that looks broken rather than one that does not
            apply. */}
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
                  Chat integration is not live yet
                </span>
              </div>
              <p className="text-read text-primary-300 mb-6">
                Choose it now and it is set when chat integration ships.
              </p>

              <ChatBadge userChatBadges={userChatBadges} login={login} />
            </div>
          </section>
        )}

        <section
          className="enter pb-4"
          style={{ '--i': 3 } as CSSProperties}
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
                      alt=""
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

              {availableUserChatBadges.length > 0 && (
                <Fact label="Badges held">
                  <span className="flex items-center gap-2">
                    {availableUserChatBadges.map((badge) => (
                      <Image
                        key={badge.name}
                        src={badge.path}
                        alt={badge.name}
                        title={badge.name}
                        width={20}
                        height={20}
                        radius="sm"
                      />
                    ))}
                  </span>
                </Fact>
              )}

              <Fact label="Public profile">
                <Link
                  href={`/user/${login}`}
                  className="text-base text-primary-100 font-semibold hover:underline"
                >
                  {config.brand.domain}/u/{login}
                </Link>
              </Fact>
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
