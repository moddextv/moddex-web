import 'server-only';

import { logger } from '@/misc/Logger';
import type { RoleUser, User } from '@/misc/account';
import type { Badge } from '@/misc/badges';
import type { BrowsePage } from '@/misc/browse';
import type { RolePage } from '@/misc/roleList';
import {
  arrayOf,
  bool,
  id,
  nullable,
  num,
  object,
  ShapeError,
  str,
  type Check
} from '@/utils/api/shape';

const BASE = process.env.MODDEX_API_URL ?? 'https://api.moddex.tv';

const token = () => process.env.INTERNAL_API_TOKEN ?? '';

export class ModdexApiError extends Error {
  readonly detail: string;

  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
    readonly code: string = ''
  ) {
    super(`moddex-api ${status} on ${path}: ${message}`);
    this.name = 'ModdexApiError';
    this.detail = message;
  }
}

type Options = {
  authenticated?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  actor?: string;
  revalidate?: number;
  expect?: Check<unknown>;
};

async function call<T>(path: string, options: Options = {}): Promise<T> {
  const { authenticated = false, method = 'GET', body, revalidate, actor, expect } = options;

  if (authenticated && !token()) {
    throw new ModdexApiError(0, path, 'INTERNAL_API_TOKEN is not set, see .env.example');
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token() ? { authorization: `Bearer ${token()}` } : {}),
      ...(actor ? { 'x-moddex-actor': actor } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    next: revalidate === undefined ? { revalidate: 0 } : { revalidate }
  });

  if (!res.ok) {
    // `code` is the api's stable slug and `message` is rewordable prose — branch
    // on the slug, never on the sentence
    const body = await res
      .json()
      .then((j) => ({ message: j?.message ?? j?.error ?? res.statusText, code: j?.error ?? '' }))
      .catch(() => ({ message: res.statusText, code: '' }));

    throw new ModdexApiError(res.status, path, String(body.message), String(body.code));
  }

  const payload = await res.json();

  if (expect) {
    try {
      expect(payload, '');
    } catch (error) {
      const detail = error instanceof ShapeError ? error.message : 'unreadable response';

      logger.error(`moddex-api sent a shape ${path} cannot use: ${detail}`);

      throw new ModdexApiError(502, path, detail, 'bad shape');
    }
  }

  return payload as T;
}

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value);
  }
  const string = search.toString();
  return string ? `?${string}` : '';
};

const userShape = object({ id, login: str, badges: arrayOf(object({})) });
const usersShape = arrayOf(userShape);

const roleUserShape = object({
  id,
  login: str,
  badges: arrayOf(object({})),
  grantedAt: nullable(str)
});
const roleUsersShape = arrayOf(roleUserShape);

const badgesShape = arrayOf(object({ id: num, name: str, svg: str, webp: str }));

const statsShape = object({
  channels: num,
  users: num,
  mods: num,
  vips: num,
  founders: nullable(num),
  takenAt: nullable(str)
});

const historyShape = arrayOf(
  object({ day: str, channels: num, users: num, mods: num, vips: num, founders: nullable(num) })
);

const rolePageShape = object({
  items: roleUsersShape,
  hasMore: bool,
  cursor: nullable(str),
  total: nullable(num)
});

const suggestShape = object({ items: usersShape });

const browsePageShape = object({
  items: arrayOf(object({ id, login: str, counts: object({ mod: num, vip: num }) })),
  hasMore: bool
});

const leaderboardShape = object({
  role: str,
  computedAt: nullable(str),
  depth: num,
  of: nullable(num),
  items: arrayOf(
    object({
      place: num,
      count: num,
      id,
      login: str,
      name: nullable(str),
      avatar: nullable(str),
      bot: bool,
      badges: arrayOf(object({}))
    })
  ),
  limit: num,
  hasMore: bool,
  after: nullable(num)
});

export type Role = 'mods' | 'vips' | 'founders';

export type { RolePage } from '@/misc/roleList';

const subjectPath = (axis: RoleAxis): string =>
  'channel_id' in axis
    ? `/v1/channels/by-id/${encodeURIComponent(axis.channel_id)}`
    : `/v1/users/by-id/${encodeURIComponent(axis.user_id)}`;

export const getRolePage = (params: RoleQuery & { limit: number }): Promise<RolePage> =>
  call(`${subjectPath(params)}/${params.role}${query(roleParams(params))}`, {
    expect: rolePageShape
  });

export type RoleAxis = { channel_id: string } | { user_id: string };

export type UserQuery = { id: string } | { login: string };

export type BrowseQuery = {
  sort: string;
  limit: number;
  offset: number;
};

const asParams = (params: object): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, value == null ? undefined : String(value)])
  );

export type RoleQuery = RoleAxis & {
  role: Role;
  limit?: number;
  cursor?: string | null;
  sort?: 'granted' | 'followers';
  dir?: 'asc' | 'desc';
  q?: string;
};

const roleParams = ({ role, ...rest }: RoleQuery): Record<string, string | undefined> => {
  void role;

  const { channel_id: channelId, user_id: userId, ...query } = rest as Record<string, unknown>;
  void channelId;
  void userId;

  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, value == null ? undefined : String(value)])
  );
};

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

export const getUserIgnored = (userId: string) =>
  call<{ userId: string; ignored: boolean }>('/v1/me/opt-out', {
    authenticated: true,
    actor: userId
  });

export const getUserPermissionLevel = (userId: string) =>
  call<{ userId: string; permission: number }>('/v1/me', {
    authenticated: true,
    actor: userId
  });

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

export const getStatsHistory = (days = 30) =>
  call<HistoryPoint[]>(`/v1/stats/history?days=${days}`, {
    revalidate: 3600,
    expect: historyShape
  });

export const getUserChatBadges = <T>(userId: string) =>
  call<{ userId: string; available: T; selected: string | null }>('/v1/me/chat-badges', {
    authenticated: true,
    actor: userId
  });

export const setUserIgnored = (userId: string, ignored: boolean) =>
  call<{ userId: string; ignored: boolean; updated: boolean }>('/v1/me/opt-out', {
    authenticated: true,
    method: 'PUT',
    actor: userId,
    body: { ignored }
  });

export const setUserSocial = (userId: string, network: string, externalId: string) =>
  call<{ userId: string; network: string; externalId: string }>(
    `/v1/me/socials/${encodeURIComponent(network)}`,
    { authenticated: true, method: 'PUT', actor: userId, body: { externalId } }
  );

export const clearUserSocial = (userId: string, network: string) =>
  call<{ userId: string; network: string; removed: boolean }>(
    `/v1/me/socials/${encodeURIComponent(network)}`,
    { authenticated: true, method: 'DELETE', actor: userId }
  );

export const getChannelConnection = (channelId: string) =>
  call<{
    channelId: string;
    connected: boolean;
    everConnected: boolean;
    scopes: string | null;
    connectedAt: string | null;
    revokedAt: string | null;
    syncedAt: string | null;
  }>('/v1/me/connection', { authenticated: true, actor: channelId });

export const setModeratedChannels = (
  userId: string,
  channels: { id: string; login: string }[],
  complete: boolean
) =>
  call<{ userId: string; channels: number; revoked: number; complete: boolean }>(
    '/v1/me/moderated-channels',
    { authenticated: true, method: 'POST', actor: userId, body: { channels, complete } }
  );

export const setChannelConnection = (channelId: string, scopes: string[]) =>
  call<{ channelId: string; connected: boolean; scopes: string }>('/v1/me/connection', {
    authenticated: true,
    method: 'PUT',
    actor: channelId,
    body: { scopes }
  });

export const clearChannelConnection = (channelId: string) =>
  call<{ channelId: string; connected: boolean; changed: boolean }>('/v1/me/connection', {
    authenticated: true,
    method: 'DELETE',
    actor: channelId
  });

export const setUserChatBadge = (userId: string, badge: string) =>
  call<{ userId: string; badge: string | null }>('/v1/me/chat-badge', {
    authenticated: true,
    method: 'PUT',
    actor: userId,
    body: { badge }
  });

export interface BotEntry {
  userId: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  badges?: Badge[];
  addedBy: string | null;
  addedByLogin: string | null;
  addedAt: string;
  known: boolean;
}

export const getBots = (actor: string) =>
  call<BotEntry[]>('/v1/admin/bots', { authenticated: true, actor });

export interface JobStatus {
  lastAt: string | null;
  dueSince: string;
  overdue: boolean;
}

export interface SweepHealth {
  live: { perMinute: number | null };
  stale: { depth: number | null; perMinute: number | null };
  discover: { depth: number | null; perMinute: number | null };
  depthCounted: boolean;
  queue: { waiting: number; running: number; capacity: number; yieldAbove: number };
  yield: { engaged: boolean; since: string | null };
}

export interface JobRun {
  at: string;
  seconds: number;
  rows: number | null;
  averageSecondsLast7: number | null;
}

export interface JobPoint {
  at: string;
  seconds: number;
}

export interface JobHealth {
  snapshot: JobStatus & { users: number | null };
  roleCounts: JobStatus;
  sweepHead: string | null;
  sweeps: SweepHealth;
  runs: Record<string, JobRun>;
  series: Record<string, JobPoint[]> | null;
  backup: { at: string; bytes: number; expectedEverySeconds: number } | null;
}

// depth costs two scans of 8.2M rows, so the jobs page asks and nothing else does
export const getJobHealth = (actor: string, withDepth = false, historyDays?: number) => {
  const params = query({
    depth: withDepth ? '1' : undefined,
    history: historyDays ? String(historyDays) : undefined
  });

  return call<JobHealth>(`/v1/admin/jobs${params}`, { authenticated: true, actor });
};

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

export interface LedgerEntry {
  id: string;
  userId: string | null;
  login: string | null;
  displayName: string | null;
  donorName: string | null;
  amountCents: number;
  time: string | null;
  status: string;
}

export interface Ledger {
  items: LedgerEntry[];
  limit: number;
  hasMore: boolean;
  cursor: string | null;
}

export const getDonationLedger = (
  actor: string,
  params: { limit?: number; cursor?: string } = {}
) =>
  call<Ledger>(`/v1/admin/donations${query(asParams(params))}`, {
    authenticated: true,
    actor
  });

export interface ChannelConnection {
  id: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  ignored: boolean;
  scopes: string[];
  connectedAt: string | null;
  syncedAt: string | null;
  moderatedSyncedAt: string | null;
  revokedAt: string | null;
}

export interface ChannelConnections {
  items: ChannelConnection[];
  total: number;
}

export const getConnections = (actor: string) =>
  call<ChannelConnections>('/v1/admin/connections', { authenticated: true, actor });

export const grantAdmin = (actor: string, userId: string) =>
  call<{ userId: string; admin: boolean }>(`/v1/admin/admins/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'PUT',
    actor
  });

export const revokeAdmin = (actor: string, userId: string) =>
  call<{ userId: string; admin: boolean }>(`/v1/admin/admins/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'DELETE',
    actor
  });

export const flagBot = (actor: string, userId: string) =>
  call<{ userId: string; bot: boolean }>(`/v1/admin/bots/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'PUT',
    actor
  });

export const unflagBot = (actor: string, userId: string) =>
  call<{ userId: string; bot: boolean }>(`/v1/admin/bots/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'DELETE',
    actor
  });

export const refreshUser = (
  subject: { login: string } | { id: string },
  roles: boolean = false
): Promise<User> =>
  call('/v1/internal/users/refresh', {
    authenticated: true,
    method: 'POST',
    body: { ...subject, roles },
    expect: userShape
  });

export const getBadges = () => call<Badge[]>('/v1/badges', { expect: badgesShape });

export const grantBadge = (actor: string, userId: string, badge: string) =>
  call<{ userId: string; badge: string; granted: boolean }>(
    `/v1/admin/users/${encodeURIComponent(userId)}/badges/${encodeURIComponent(badge)}`,
    { authenticated: true, method: 'PUT', actor }
  );

export const revokeBadge = (actor: string, userId: string, badge: string) =>
  call<{ userId: string; badge: string; revoked: boolean; chatBadgeCleared: boolean }>(
    `/v1/admin/users/${encodeURIComponent(userId)}/badges/${encodeURIComponent(badge)}`,
    { authenticated: true, method: 'DELETE', actor }
  );

export interface BadgeHolder {
  id: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  badges?: Badge[];
  ignored: boolean;
  grantedBy: string | null;
  grantedAt: string | null;
  grantedByLogin: string | null;
  owner: boolean;
}

export const getBadgeHolders = (actor: string, badge: string) =>
  call<{ badge: string; total: number; listable: boolean; items: BadgeHolder[] }>(
    `/v1/admin/badges/${encodeURIComponent(badge)}/holders`,
    { authenticated: true, actor }
  );

export interface BadgeCounts {
  counts: Record<string, number | null>;
  countedAt: Record<string, string>;
}

export const getBadgeCounts = (actor: string) =>
  call<BadgeCounts>('/v1/admin/badges/counts', { authenticated: true, actor });
