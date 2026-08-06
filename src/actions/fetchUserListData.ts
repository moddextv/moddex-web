'use server';

import { RoleType, User, UserType } from '@/misc/Interfaces';
import { getRole } from '@/utils/api/moddex';

/**
 * Role lists for the browser. The scraping, caching and opt-out filtering all
 * happen in moddex-api now; this only maps the two axes onto its query
 * parameters.
 *
 *   channel + mods  ->  /v1/mods?channel_id=X   who mods for this channel
 *   user    + mods  ->  /v1/mods?user_id=X      which channels this user mods
 *
 * `forceRefresh` is gone rather than forwarded. It let a browser trigger
 * outbound twitch traffic on demand, and moddex-api decides when to re-scrape
 * from the record's own `updated` timestamp. The parameter is still accepted
 * so the client components did not have to change in the same commit.
 */
const ROLE_FOR: Record<UserType, Record<string, 'mods' | 'vips' | 'founders'>> =
  {
    channel: { mods: 'mods', vips: 'vips', founders: 'founders' },
    user: { modding: 'mods', viping: 'vips', founding: 'founders' }
  };

export async function fetchUserListData(
  userId: string,
  type: UserType,
  role: RoleType,
  _forceRefresh: boolean = false
): Promise<User[]> {
  const endpoint = ROLE_FOR[type]?.[role];
  if (!endpoint) return [];

  // the axis decides which parameter the id goes in: a channel's members, or
  // the channels a user is a member of
  const params =
    type === 'channel' ? { channel_id: userId } : { user_id: userId };

  try {
    return await getRole<User[]>(endpoint, params);
  } catch {
    // an untracked channel is a 404 from the api, and an empty list is the
    // right answer for a list component
    return [];
  }
}
