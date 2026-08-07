import { DefaultSession } from 'next-auth';

export type UserType = 'channel' | 'user';

export type UserRoleType = 'modding' | 'viping' | 'founding';
export type ChannelRoleType = 'mods' | 'vips' | 'founders';

export type RoleType = UserRoleType | ChannelRoleType;

export interface UserListProps {
  type: UserType;
  role: RoleType;
  user: User;
}

export interface User {
  id: string;
  login: string;
  name: string | null;
  avatar: string | null;
  follower: number | null;
  bio?: string | null;
  roles?: {
    isAffiliate: boolean;
    isPartner: boolean;
    isStaff?: boolean;
  } | null;
  discord?: string | null;
  created?: string | null;
  updated?: string | null;
  // the mariadb driver hands back a Date for DATETIME columns, while the gql
  // path supplies the same field as an ISO string. both reach the components.
  granted?: string | Date | null;
  banned?: string | null;
  ignored?: boolean;
  /** curated flag, see misc/bots.ts — drives the "hide bots" filter */
  bot?: boolean;
  badges: Badge[];
  chatBadge: ChatBadge | null;
}


/**
 * the browse surfaces, /v1/channels and /v1/accounts.
 *
 * `counts` means different things per direction and that is the whole point of
 * the pair: on a channel it is the roles that channel has handed out, on an
 * account it is the roles that account holds. moddex-api reads both off one
 * rollup table because the same twitch id is usually both.
 */
export interface BrowseCounts {
  mod: number;
  vip: number;
  total: number;
}

export interface BrowseEntry extends User {
  counts: BrowseCounts;
}

export interface BrowsePage {
  items: BrowseEntry[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

export type ChannelSort = 'read' | 'roles' | 'followers';
export type AccountSort = 'roles' | 'followers';

export interface UserBadgeRow {
  id: string;
  login: string;
  name: string;
  avatar: string;
  follower: number;
  // the mariadb driver hands back a Date for DATETIME columns, while the gql
  // path supplies the same field as an ISO string. both reach the components.
  granted?: string | Date | null;
  bio?: string | null;
  roles?: null | {
    isAffiliate: boolean;
    isPartner: boolean;
    isStaff?: boolean;
  };
  discord?: string | null;
  created?: string | null;
  updated?: string | null;
  banned: string | null;
  ignored?: boolean;
  // tinyint(1) from mariadb, so it arrives as 0/1 rather than a boolean
  bot?: boolean | number;
  badge_id: number;
  badge_name: string;
  badge_path: string;
  chat_badge_name: string;
  chat_badge_path: string;
}

export interface GqlUser {
  id: string;
  login: string;
  displayName: string;
  description: string;
  createdAt: string;
  profileImageURL: string;
  roles: {
    isAffiliate: boolean;
    isPartner: boolean;
    isStaff: boolean;
  };
  followers: {
    totalCount: number;
  };
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

export interface ChatBadge {
  id?: number;
  name: string;
  path: string;
}

export interface UserChatBadges {
  available: ChatBadge[],
  selected: string
}

declare module 'next-auth' {
  interface Session {
    user: {
      perms: number;
      login: string;
    } & DefaultSession['user'];
  }

  interface User {
    perms: number;
  }
}
