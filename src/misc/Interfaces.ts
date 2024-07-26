import { DefaultSession } from 'next-auth';

export type UserType = 'channel' | 'user';

export type UserRoleType = 'modding' | 'viping';
export type ChannelRoleType = 'mods' | 'vips';

export type RoleType = UserRoleType | ChannelRoleType;

export interface UserListProps {
  type: UserType;
  role: RoleType;
  user: User;
}

export interface User {
  id: string;
  login: string;
  name: string;
  avatar: string;
  bio?: string | null;
  discord?: string | null;
  created?: string | null;
  updated?: string | null;
  granted?: string | null;
  ignored?: boolean;
  badges: Badge[];
}

export interface UserBadgeRow {
  id: string;
  login: string;
  name: string;
  avatar: string;
  granted?: string | null;
  bio?: string | null;
  discord?: string | null;
  created?: string | null;
  updated?: string | null;
  ignored?: boolean;
  badge_id: number;
  badge_name: string;
  badge_path: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: 'admin' | 'global_mod' | 'staff' | '';
  broadcaster_type: 'affiliate' | 'partner' | '';
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  created_at: string;
}

export interface IVRUser {
  banned: boolean;
  displayName: string;
  login: string;
  id: string;
  bio: string;
  follows: null;
  followers: number;
  profileViewCount: null;
  panelCount: number;
  chatColor: string;
  logo: string;
  banner?: string;
  verifiedBot: null;
  createdAt: string;
  updatedAt: string;
  emotePrefix: string;
  roles: {
    isAffiliate: boolean;
    isPartner: boolean;
    isStaff: null;
  };
  badges: {
    setID: string;
    title: string;
    description: string;
    version: string;
  }[];
  chatterCount: number;
  chatSettings: {
    chatDelayMs: number;
    followersOnlyDurationMinutes: null;
    slowModeDurationSeconds: null;
    blockLinks: boolean;
    isSubscribersOnlyModeEnabled: boolean;
    isEmoteOnlyModeEnabled: boolean;
    isFastSubsModeEnabled: boolean;
    isUniqueChatModeEnabled: boolean;
    requireVerifiedAccount: boolean;
    rules: string[];
  };
  stream: null;
  lastBroadcast: {
    startedAt: string;
    title: string;
  };
  panels: {
    id: string;
  }[];
}

export interface Badge {
  id: number;
  name: string;
  path: string;
}

export interface BadgeComponent {
  badges?: Badge[];
  size?: number;
}

declare module 'next-auth' {
  interface Session {
    user: {
      perms: number;
    } & DefaultSession['user'];
  }

  interface User {
    perms: number;
  }
}
