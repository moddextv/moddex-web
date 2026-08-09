'use server';

import { setUserChatBadge } from '@/utils/api/moddex';
import { requireUserId } from '@/utils/authz';

/**
 * every export of a 'use server' file is a publicly callable endpoint, so the
 * acting user is derived from the session here and never taken from an
 * argument. see the note in userIgnoreState.ts: this is the only place that
 * property can be enforced now.
 *
 * the "has this user earned that badge" check moved to moddex-api rather than
 * staying here. it is a rule about the data, and the database is that
 * service's to protect — a 403 comes back if the badge was never earned.
 */
export async function setSelectedUserChatBadge(newSelectedBadge: string): Promise<void> {
  const userId = await requireUserId();

  await setUserChatBadge(userId, newSelectedBadge);
}
