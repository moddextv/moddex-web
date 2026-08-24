import type { User } from '@/misc/account';
import type { Badge } from '@/misc/badges';
import type { BrowsePage } from '@/misc/browse';
import type { RolePage } from '@/misc/roleList';
import { asParams, call, query } from '@/utils/api/moddex/client';
import {
  badgesShape,
  browsePageShape,
  historyShape,
  leaderboardShape,
  rolePageShape,
  statsShape,
  suggestShape,
  userShape
} from '@/utils/api/moddex/shapes';

export type Role = 'mods' | 'vips' | 'founders';

export type { RolePage } from '@/misc/roleList';

type RoleAxis = { channel_id: string } | { user_id: string };

type UserQuery = { id: string } | { login: string };

type BrowseQuery = {
  sort: string;
  limit: number;
  offset: number;
};

type RoleQuery = RoleAxis & {
  role: Role;
  limit?: number;
  cursor?: string | null;
  sort?: 'granted' | 'followers';
  dir?: 'asc' | 'desc';
  q?: string;
};

const subjectPath = (axis: RoleAxis): string =>
  'channel_id' in axis
    ? `/v1/channels/by-id/${encodeURIComponent(axis.channel_id)}`
    : `/v1/users/by-id/${encodeURIComponent(axis.user_id)}`;

const roleParams = ({ role, ...rest }: RoleQuery): Record<string, string | undefined> => {
  void role;

  const { channel_id: channelId, user_id: userId, ...query } = rest as Record<string, unknown>;
  void channelId;
  void userId;

  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, value == null ? undefined : String(value)])
  );
};

export const getRolePage = (params: RoleQuery & { limit: number }): Promise<RolePage> =>
  call(`${subjectPath(params)}/${params.role}${query(roleParams(params))}`, {
    expect: rolePageShape
  });

export const getUserProfile = (params: UserQuery, actor?: string): Promise<User> =>
  call(
    'login' in params
      ? `/v1/users/${encodeURIComponent(params.login)}`
      : `/v1/users/by-id/${encodeURIComponent(params.id)}`,
    {
      ...(actor ? { actor } : {}),
      expect: userShape
    }
  );

export const getChannels = (params: BrowseQuery): Promise<BrowsePage> =>
  call(`/v1/channels${query(asParams(params))}`, { revalidate: 60, expect: browsePageShape });

export const getAccounts = (
  params: BrowseQuery & { bots: 'include' | 'exclude' }
): Promise<BrowsePage> =>
  call(`/v1/users${query(asParams(params))}`, { revalidate: 60, expect: browsePageShape });

export const getSuggestions = (q: string, limit: number): Promise<{ items: User[] }> =>
  call(`/v1/search${query({ q, limit: String(limit) })}`, {
    revalidate: 60,
    expect: suggestShape
  });

export const getStats = () =>
  call<{
    channels: number;
    users: number;
    mods: number;
    vips: number;
    founders: number | null;
    takenAt: string | null;
  }>('/v1/stats', { expect: statsShape });

export interface HistoryPoint {
  day: string;
  channels: number;
  users: number;
  mods: number;
  vips: number;
  founders: number | null;
}

export const getStatsHistory = (days = 30) =>
  call<HistoryPoint[]>(`/v1/stats/history?days=${days}`, {
    revalidate: 3600,
    expect: historyShape
  });

export type LeaderScale = 'mod' | 'vip' | 'founder' | 'roles';

export interface LeaderRow {
  place: number;
  count: number;
  id: string;
  login: string;
  name: string | null;
  avatar: string | null;
  bot: boolean;
  badges: Badge[];
}

export interface Leaderboard {
  role: string;
  computedAt: string | null;
  depth: number;
  of: number | null;
  items: LeaderRow[];
  limit: number;
  hasMore: boolean;
  after: number | null;
}

// this site's own ?scale= is singular and public; the api's path segment is plural
const BOARD_PATH: Record<LeaderScale, string> = {
  mod: 'mods',
  vip: 'vips',
  founder: 'founders',
  roles: 'roles'
};

export const getLeaderboard = (
  scale: LeaderScale,
  params: { limit?: number; after?: number; bots?: 'include' | 'exclude' } = {}
): Promise<Leaderboard> =>
  call(`/v1/leaderboards/${BOARD_PATH[scale]}${query(asParams(params))}`, {
    revalidate: 900,
    expect: leaderboardShape
  });

export interface Membership {
  mod: { grantedAt: string | null } | null;
  vip: { grantedAt: string | null } | null;
  founder: { grantedAt: string | null } | null;
}

// the internal token is what makes an opted-out account say so, rather than
// reading as a name that does not exist
export const getMembership = (login: string, channel: string) =>
  call<Membership>(`/v1/users/${encodeURIComponent(login)}/roles/${encodeURIComponent(channel)}`, {
    authenticated: true
  });

export interface EventsubHealth {
  status: string;
  eventsub: string;
  enabledShards?: number;
  totalShards?: number;
}

export const getEventsubHealth = () =>
  call<EventsubHealth>('/v1/eventsub/health', { revalidate: 30 });

export const getBadges = () => call<Badge[]>('/v1/badges', { expect: badgesShape });
