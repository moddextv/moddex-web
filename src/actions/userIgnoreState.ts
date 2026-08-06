'use server';

import { db } from '@/misc/Database';
import { auth } from '@/auth';

/**
 * every export of a 'use server' file is a publicly callable endpoint, so the
 * acting user is derived from the session here and never taken from an argument.
 */
export async function setIgnoredUser(ignoreUser: boolean): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('not authenticated');
  }

  await db.query('UPDATE users SET ignored=? WHERE id=?', [ignoreUser, userId]);
}
