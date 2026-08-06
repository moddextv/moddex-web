'use server';

import { db } from '@/misc/Database';
import { requireUserId } from '@/utils/authz';

/**
 * every export of a 'use server' file is a publicly callable endpoint, so the
 * acting user is derived from the session here and never taken from an argument.
 */
export async function setIgnoredUser(ignoreUser: boolean): Promise<void> {
  const userId = await requireUserId();

  await db.query('UPDATE users SET ignored=? WHERE id=?', [ignoreUser, userId]);
}
