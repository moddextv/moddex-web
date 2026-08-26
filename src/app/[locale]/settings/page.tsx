import { asLocale } from '@/i18n/locales';
import { optional } from '@/i18n/translate';
import { getTranslator } from '@/i18n/dictionary';
import { alternatesFor } from '@/misc/metadata';
import { LocaleLink } from '@/components/UI/LocaleLink';
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
import { NO_CHAT_BADGE, UserChatBadges } from '@/misc/badges';
import { config } from '@/config';
import { CSSProperties, FC, ReactNode } from 'react';

interface MetaProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: MetaProps): Promise<Metadata> => {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);

  return {
    alternates: alternatesFor('/settings', locale),
    robots: { index: false, follow: false },
    title: t('pages.settings'),
    description: t('settings.metaDescription', { domain: config.brand.domain })
  };
};

const Fact: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row cols-fact">
    <span className="text-base text-primary-300">{label}</span>
    {children}
  </div>
);

export default async function SettingsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ discord?: string; channel?: string }>;
}) {
  const locale = asLocale((await params).locale);
  const t = getTranslator(locale);
  const { discord: discordStatus, channel: channelStatus } = await searchParams;
  const channelMessage = optional(t, channelStatus && `settings.channelStatus.${channelStatus}`);
  const discordMessage = optional(t, discordStatus && `settings.discordStatus.${discordStatus}`);
  const session = await auth();

  if (!session?.user?.id) {
    return <Login locale={locale} heading={t('settings.signInHeading')} redirectTo="/settings" />;
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
    userChatBadges.available = [
      { slug: 'none', name: 'none', images: NO_CHAT_BADGE },
      ...availableUserChatBadges
    ];
  }

  return (
    <main id="main" className="flex-grow">
      <Container>
        <header className="enter pt-12 pb-8">
          <h1 className="text-h1 mb-2">{t('settings.heading')}</h1>
          <p className="text-ui text-primary-400">{t('settings.signedInAs', { login })}</p>
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
                {t('settings.privacy')}
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
                  {t('settings.badge.title')}
                </h2>
                <span className="ml-auto text-ui text-founder">{t('settings.badge.notLive')}</span>
              </div>
              <p className="text-read text-primary-300 mb-6">{t('settings.badge.body')}</p>

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
              {t('settings.live.title')}
            </h2>
            <p className="text-ui text-primary-400 mb-5">{t('settings.live.body')}</p>

            <ConnectChannel
              initialConnected={connection.connected}
              everConnected={connection.everConnected}
            />

            {channelMessage && (
              <p className="mt-5 text-ui text-primary-300 max-w-prose">{channelMessage}</p>
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
              {t('settings.account.title')}
            </h2>

            <div className="rows">
              <Fact label={t('settings.account.signedIn')}>
                <span className="flex items-center gap-3">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? t('settings.account.avatarAlt')}
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

              <Fact label={t('settings.account.publicProfile')}>
                <LocaleLink
                  href={`/user/${login}`}
                  className="text-base text-primary-100 font-semibold hover:underline"
                >
                  {config.brand.domain}/u/{login}
                </LocaleLink>
              </Fact>

              <Fact label={t('settings.account.discord')}>
                <ConnectDiscord initialDiscordId={discordId} />
              </Fact>

              {discordMessage && (
                <p className="px-4 py-3 text-ui text-primary-300 max-w-prose">{discordMessage}</p>
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
