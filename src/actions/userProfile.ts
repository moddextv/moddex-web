'use server';

import { User } from '@/misc/Interfaces';
import { getUser } from '@/utils/user';
import { regex } from '@/utils/regex';

/**
 * public read used by the profile reload button. `forceRefresh` triggers an
 * outbound twitch scrape, so the login is validated here rather than trusted.
 */
export async function getUserProfile(
  username: string,
  forceRefresh: boolean = false
): Promise<{ user: User | null; banReason?: string }> {
  if (!regex.username.test(username)) {
    return { user: null };
  }

  return getUser(username, forceRefresh);
}
