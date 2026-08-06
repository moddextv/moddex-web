'use server';

import { RoleType, User, UserType } from '@/misc/Interfaces';
import { getChannelFounders, getChannelMods, getChannelVips } from '@/utils/roles/channel';
import { getUserFounders, getUserMods, getUserVips } from '@/utils/roles/user';
import { filterUsers, getUsersFromDbById } from '@/utils/user';

type UserRolesFunctions = {
  channel: {
    mods: (user: User, forceRefresh: boolean) => Promise<User[]>;
    vips: (user: User, forceRefresh: boolean) => Promise<User[]>;
    founders: (user: User, forceRefresh: boolean) => Promise<User[]>;
  };
  user: {
    modding: (user: User) => Promise<User[]>;
    viping: (user: User) => Promise<User[]>;
    founding: (user: User) => Promise<User[]>;
  };
};

const functionMap: UserRolesFunctions = {
  channel: {
    mods: getChannelMods,
    vips: getChannelVips,
    founders: getChannelFounders
  },
  user: {
    modding: getUserMods,
    viping: getUserVips,
    founding: getUserFounders
  }
};

/**
 * takes an id rather than a User object: the caller is a browser, and
 * `user.updated` is what decides whether this triggers an outbound twitch
 * scrape. the record is re-read server-side so a forged payload cannot force one.
 */
export async function fetchUserListData(
  userId: string,
  type: UserType,
  role: RoleType,
  forceRefresh: boolean = false
): Promise<User[]> {
  const fetchFunction = (functionMap[type] as any)[role];

  if (typeof fetchFunction !== 'function') {
    return [];
  }

  const [user] = await getUsersFromDbById([userId]);
  if (!user || user.ignored) {
    return [];
  }

  const users = await fetchFunction(user, forceRefresh);
  return filterUsers(users);
}
