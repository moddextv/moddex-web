'use server';

import { db } from '@/misc/Database';

export async function getUserIgnoreState(userId: string): Promise<boolean> {
  const user = await db.queryOne('SELECT ignored FROM users WHERE id=?', [
    userId
  ]);
  return !!user.ignored;
}

export async function setIgnoredUser(
  userId: string,
  ignoreUser: boolean
): Promise<void> {
  await db.query('UPDATE users SET ignored=? WHERE id=?', [ignoreUser, userId]);
}
