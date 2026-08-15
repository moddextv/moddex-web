export const ROLES = {
  mod: {
    id: 1,
    gqlField: 'mods',
    channelLabel: 'mods',
    userLabel: 'modding',
    channelTitle: 'Moderators',
    userTitle: 'Moderating',
    tailwind: 'mod',
    corner: 'tl'
  },
  vip: {
    id: 2,
    gqlField: 'vips',
    channelLabel: 'vips',
    userLabel: 'viping',
    channelTitle: 'VIPs',
    userTitle: 'Holding VIP',
    tailwind: 'vip',
    corner: 'br'
  },
  artist: {
    id: 3,
    gqlField: 'artists',
    channelLabel: 'artists',
    userLabel: 'arting',
    channelTitle: 'Artists',
    userTitle: 'Holding artist',
    tailwind: 'artist',
    corner: 'tr'
  },
  founder: {
    id: 4,
    gqlField: 'founders',
    channelLabel: 'founders',
    userLabel: 'founding',
    channelTitle: 'Founders',
    userTitle: 'Founding',
    tailwind: 'founder',
    corner: 'bl'
  }
} as const;

export type RoleKey = keyof typeof ROLES;

export const ROLE_KEYS = Object.keys(ROLES) as RoleKey[];

export const ACTIVE_ROLE_KEYS: RoleKey[] = ['mod', 'vip', 'founder'];

export const roleByLabel = (label: string): RoleKey | undefined =>
  ROLE_KEYS.find((key) => ROLES[key].channelLabel === label || ROLES[key].userLabel === label);

export const roleCornerClass: Record<RoleKey, string> = {
  mod: 'corner-tl',
  vip: 'corner-br',
  artist: 'corner-tr',
  founder: 'corner-bl'
};

export const roleTextClass: Record<RoleKey, string> = {
  mod: 'text-mod',
  vip: 'text-vip',
  artist: 'text-artist',
  founder: 'text-founder'
};

export type UserType = 'channel' | 'user';

export type UserRoleType = 'modding' | 'viping' | 'founding';
export type ChannelRoleType = 'mods' | 'vips' | 'founders';

export type RoleType = UserRoleType | ChannelRoleType;
