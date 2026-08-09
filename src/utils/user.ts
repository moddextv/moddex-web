import 'server-only';

import { User } from '@/misc/Interfaces';
import {
  ModdexApiError,
  getUserIgnored,
  getUserPermissionLevel,
  getUsers as apiGetUsers
} from '@/utils/api/moddex';

/**
 * Adapter over moddex-api. This file used to hold the queries and the outbound
 * twitch scrape; both live in moddex-api now, which owns the database.
 *
 * The exported signatures are unchanged so the five callers did not have to
 * move at the same time as the plumbing. There were twelve exports and five
 * of them were actually imported anywhere — the rest were deleted rather than
 * ported.
 */

/**
 * Kept for the one caller that still pipes a list through it.
 *
 * It is no longer a security boundary: moddex-api strips `ignored` from every
 * user it returns and drops opted-out users itself, with an integration test
 * asserting the flag never leaves. Filtering again here would be theatre.
 */
export const filterUsers = async (users: User[]): Promise<User[]> => users;

export const getUserPermission = async (userId: string = ''): Promise<number> => {
  if (!userId) return 0;

  const { permission } = await getUserPermissionLevel(userId);
  return permission;
};

export const getUserIgnoreState = async (userId: string): Promise<boolean> => {
  const { ignored } = await getUserIgnored(userId);
  return ignored;
};

/**
 * A user by login.
 *
 * `forceRefresh` is accepted and ignored. moddex-api decides when to re-scrape
 * from twitch, from the record's own `updated` timestamp — letting a browser
 * force outbound twitch traffic was a small denial of service anyway. The
 * parameter stays so the two callers did not need editing.
 *
 * The rename-and-redirect in the pages still works: moddex-api upserts login
 * and name on every lookup (updateUserInDb), so what comes back here is
 * already current and the page only has to compare and redirect.
 *
 * A banned user comes back as `user: null` with `banReason` set, which is the
 * contract the channel page reads.
 */
export const getUser = async (
  username: string,
  _forceRefresh: boolean = false
): Promise<{ user: User | null; banReason?: string }> => {
  let users: User[];

  try {
    users = await apiGetUsers<User[]>({ login: username });
  } catch (error) {
    // /v1/users deliberately 404s on an empty result: a lookup by login is a
    // question about one specific account, so "no such user" is the honest
    // answer there. for this caller it is not an error at all, it is `null` --
    // and until this catch existed, every lookup of a name twitch does not have
    // threw straight past the page's `if (!user)` branch and into the error
    // boundary, so a typo rendered "that page did not finish loading".
    if (error instanceof ModdexApiError && error.status === 404) {
      return { user: null };
    }

    throw error;
  }

  const user = Array.isArray(users) ? (users[0] ?? null) : null;

  const banned = (user as unknown as { banned?: string })?.banned;
  if (user && banned) {
    return { user: null, banReason: banned };
  }

  return { user };
};

export const getUsersFromDbById = async (ids: string[]): Promise<User[]> => {
  if (ids.length === 0) return [];

  return await apiGetUsers<User[]>({ id: ids.join(',') });
};
