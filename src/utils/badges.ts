import 'server-only';

import { ChatBadge } from '@/misc/badges';
import { getUserChatBadges } from '@/utils/api/moddex/me';

const perRequest = new Map<string, Promise<{ available: ChatBadge[]; selected: string | null }>>();

const load = (userId: string) => {
  let pending = perRequest.get(userId);

  if (!pending) {
    pending = getUserChatBadges<ChatBadge[]>(userId)
      .then(({ available, selected }) => ({ available, selected }))
      .finally(() => {
        perRequest.delete(userId);
      });

    perRequest.set(userId, pending);
  }

  return pending;
};

export const getAvailableUserChatBadges = async (userId: string = ''): Promise<ChatBadge[]> => {
  if (!userId) return [];

  return (await load(userId)).available;
};

export const getSelectedUserChatBadge = async (userId: string = ''): Promise<string> => {
  if (!userId) return '';

  return (await load(userId)).selected ?? '';
};
