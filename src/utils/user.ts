import 'server-only';

import { User } from '@/misc/account';
import {
  ModdexApiError,
  getUserIgnored,
  getUserPermissionLevel,
  getUserProfile as apiGetUser,
  refreshUser
} from '@/utils/api/moddex';
import { logger } from '@/misc/Logger';
import { cache } from 'react';

export const getUserLogin = async (userId: string = ''): Promise<string> => {
  if (!userId) return '';

  try {
    const stored = await getUserById(userId, userId);
    if (stored?.login) return stored.login;
  } catch (error) {
    logger.warn(`no stored row for ${userId} while signing in`, error);
  }

  try {
    const fetched = await refreshUser({ id: userId });
    if (fetched?.login) return fetched.login;
  } catch (error) {
    logger.warn(`could not resolve a login for ${userId} while signing in`, error);
  }

  return '';
};

export const getUserPermission = async (userId: string = ''): Promise<number> => {
  if (!userId) return 0;

  try {
    const { permission } = await getUserPermissionLevel(userId);
    return permission;
  } catch (error) {
    logger.warn(`could not read the permission level for ${userId}, defaulting to none`, error);
    return 0;
  }
};

export const getUserIgnoreState = async (userId: string): Promise<boolean> => {
  const { ignored } = await getUserIgnored(userId);
  return ignored;
};

export const getUser = cache(
  async (
    username: string,
    forceRefresh: boolean = false,
    withRoles: boolean = false
  ): Promise<{ user: User | null; banReason?: string; optedOut?: boolean }> => {
    let fetched: User | null;

    if (forceRefresh) {
      let stored: User | null = null;

      try {
        stored = await apiGetUser({ login: username });
      } catch (error) {
        if (error instanceof ModdexApiError && error.status === 404 && error.code === 'opted out') {
          return { user: null, optedOut: true };
        }
      }

      try {
        const refreshed = await refreshUser(
          stored?.id ? { id: stored.id } : { login: username },
          withRoles
        );

        if (refreshed) return { user: refreshed };
      } catch (error) {
        if (error instanceof ModdexApiError && error.status === 404) {
          return { user: null };
        }

        logger.warn(`refresh failed for ${username}, serving the stored row`, error);
      }
    }

    try {
      fetched = await apiGetUser({ login: username });
    } catch (error) {
      if (error instanceof ModdexApiError && error.status === 404) {
        if (error.code === 'opted out') return { user: null, optedOut: true };

        if (!forceRefresh) {
          try {
            const fetched = await refreshUser({ login: username });
            if (fetched) return { user: fetched };
          } catch (fetchError) {
            if (!(fetchError instanceof ModdexApiError && fetchError.status === 404)) {
              logger.warn(`first-sight fetch failed for ${username}`, fetchError);
            }
          }
        }

        return { user: null };
      }

      throw error;
    }

    const user = fetched;

    const banned = user?.banned;
    if (user && banned) {
      return { user: null, banReason: banned.reason };
    }

    return { user };
  }
);

export const getUserById = async (id: string, actor?: string): Promise<User | null> => {
  if (!id) return null;

  return await apiGetUser({ id }, actor);
};
