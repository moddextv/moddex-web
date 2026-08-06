import 'server-only';

import { ChatBadge } from '@/misc/Interfaces';
import { getUserChatBadges as apiGetUserChatBadges } from '@/utils/api/moddex';

/**
 * Adapter over moddex-api. This file used to hold every badge query and the
 * grant/revoke writes; those moved with the donation logic, which is the only
 * thing that called them.
 *
 * Two exports remain because two are imported: the settings page renders a
 * picker. Both come from one api call now, so they share a cached promise per
 * request rather than making the round trip twice.
 */

const perRequest = new Map<string, Promise<{ available: ChatBadge[]; selected: string | null }>>();

const load = (userId: string) => {
  let pending = perRequest.get(userId);

  if (!pending) {
    pending = apiGetUserChatBadges<ChatBadge[]>(userId)
      .then(({ available, selected }) => ({ available, selected }))
      .finally(() => {
        // a server component render is short-lived; holding this past the
        // request would serve one user's badges to the next
        perRequest.delete(userId);
      });

    perRequest.set(userId, pending);
  }

  return pending;
};

export const getUserChatBadges = async (
  userId: string = ''
): Promise<ChatBadge[]> => {
  if (!userId) return [];

  return (await load(userId)).available;
};

export const getSelectedUserChatBadge = async (
  userId: string = ''
): Promise<string> => {
  if (!userId) return '';

  return (await load(userId)).selected ?? '';
};
