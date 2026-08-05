import { Metadata } from 'next';
import { Title } from '@/components/UI/Title';
import { OptOut } from '@/components/Settings/OptOut';
import { auth } from '@/auth';
import { Login } from '@/components/Login';
import { getSelectedUserChatBadge, getUserChatBadges } from '@/utils/badges';
import { getUserIgnoreState } from '@/utils/user';
import { ChatBadge } from '@/components/Settings/ChatBadge';
import { UserChatBadges } from '@/misc/Interfaces';
import { config } from '@/config';

export const metadata: Metadata = {
  title: 'profile settings',
  description: `update your settings for ${config.brand.domain}. opt-out from being tracked or select a badge to display in chats.`
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <Login />;
  }

  const userId = session.user.id;

  const userChatBadges: UserChatBadges = {
    available: [],
    selected: ''
  };

  const [isIgnored, availableUserChatBadges] = await Promise.all([
    getUserIgnoreState(userId),
    getUserChatBadges(userId)
  ]);

  if (availableUserChatBadges.length) {
    userChatBadges.selected = await getSelectedUserChatBadge(userId);
    userChatBadges.available = [
      { name: 'none', path: '' },
      ...availableUserChatBadges
    ];
  }

  return (
    <main className="container mx-auto max-w-3xl py-16 px-6 flex-grow flex flex-col gap-8">
      <Title mb="md" className="uppercase">
        settings
      </Title>

      <div>
        <Title level={2} mb="sm" size="md">
          privacy
        </Title>
        <div className="mb-4">
          <OptOut initialIsIgnored={isIgnored} />
          <p>
            you can opt-out of being tracked, meaning your profile will not be displayed and you will not be listed in
            any mod- and vip-lists.
          </p>
        </div>
      </div>

      {userChatBadges.available.length > 0 && (
        <div>
          <Title level={2} mb="sm" size="md">
            cosmetics
          </Title>
          <p className="text-lg mb-2">chat badge</p>
          <ChatBadge userChatBadges={userChatBadges} />
          <p className="text-sm mt-1">
            <span className="text-red-500">
              we&apos;re currently working on chat integrations.
            </span>
            <br />
            <span>
              you can already choose a display badge so you&apos;re ready to go once it&apos;s live.
            </span>
          </p>
        </div>
      )}
    </main>
  );
}
