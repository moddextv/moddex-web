'use server';

import { User } from '@/misc/account';
import { getUser } from '@/utils/user';
import { isUsername } from '@/utils/username';

export async function getUserProfile(
  username: string,
  forceRefresh: boolean = false,
  withRoles: boolean = false
): Promise<{ user: User | null; banReason?: string; optedOut?: boolean }> {
  if (!isUsername(username)) {
    return { user: null };
  }

  return getUser(username, forceRefresh, withRoles);
}
