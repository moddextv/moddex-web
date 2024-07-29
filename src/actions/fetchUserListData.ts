'use server';

import { RoleType, User, UserType } from '@/misc/Interfaces';
import { getChannelMods, getChannelVips } from '@/utils/roles/channel';
import { getUserMods, getUserVips } from '@/utils/roles/user';
import { filterUsers } from '@/utils/user';

type UserRolesFunctions = {
  channel: {
    mods: (user: User) => Promise<User[]>;
    vips: (user: User) => Promise<User[]>;
  };
  user: {
    modding: (user: User) => Promise<User[]>;
    viping: (user: User) => Promise<User[]>;
  };
};

const functionMap: UserRolesFunctions = {
  channel: {
    mods: getChannelMods,
    vips: getChannelVips
  },
  user: {
    modding: getUserMods,
    viping: getUserVips
  }
};

export async function fetchUserListData(
  user: User,
  type: UserType,
  role: RoleType,
  forceRefresh: boolean = false
): Promise<User[]> {
  const fetchFunction = (functionMap[type] as any)[role];

  if (typeof fetchFunction !== 'function') {
    return [];
  }

  const users = await fetchFunction(user, forceRefresh);
  return filterUsers(users);
}
