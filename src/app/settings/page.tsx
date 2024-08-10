import { Metadata } from 'next';
import { Title } from '@/components/UI/Title';
import { OptOut } from '@/components/Settings/OptOut';
import { auth } from '@/auth';
import { Login } from '@/components/Login';
import { getSelectedUserChatBadge, getUserChatBadges } from '@/utils/badges';
import { getUserIgnoreState } from '@/actions/userIgnoreState';
import { ChatBadge } from '@/components/Settings/ChatBadge';
import { UserChatBadges } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';

export const metadata: Metadata = {
  title: 'profile settings',
  description: 'update your settings for modchecker.com. opt-out from being tracked or select a badge to display in chats.',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <Login />;
  }

  const userId = session.user.id;

  const userChatBadges: UserChatBadges = {
    available: [],
    selected: '',
  };

  const [isIgnored, availableUserChatBadges] = await Promise.all([
    getUserIgnoreState(userId),
    getUserChatBadges(userId)
  ]);

  if (availableUserChatBadges.length) {
    userChatBadges.selected = await getSelectedUserChatBadge(userId);
    userChatBadges.available = [
      { name: 'none', path: '' },
      ...availableUserChatBadges,
    ];
  }

  await logger.db('settings-page',`userChatBadges: ${JSON.stringify(userChatBadges)}`);

  return (
    <div className="max-w-3xl mx-auto">
      <Title mb="md" className="uppercase">
        settings
      </Title>

      <div className="mb-8">
        <Title level={2} mb="sm" size="md">
          privacy
        </Title>
        <div className="mb-4">
          {/*<OptOut userId={userId} initialIsIgnored={isIgnored} />*/}
          <p>
            you can opt-out of being tracked, meaning your profile will not be displayed and you will not be listed in any mod- and vip-lists.
          </p>
        </div>
      </div>

      {userChatBadges.available.length > 0 && (
        <div className="mb-8">
          <Title level={2} mb="sm" size="md">
            cosmetics
          </Title>
          <p className="text-lg mb-2">chat badge</p>
          <ChatBadge userId={userId} userChatBadges={userChatBadges} />
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
    </div>
  );
}
