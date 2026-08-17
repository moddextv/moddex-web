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

// INTERNAL_API_TOKEN can write as any user, so `server-only` above must stay and
// the token must never move into config.ts, which is bundled for the browser
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
    throw new ModdexApiError(0, path, 'INTERNAL_API_TOKEN is not set — see .env.example');
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
  granted: nullable(str)
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

const browsePageShape = object({
  items: arrayOf(object({ id, login: str, counts: object({ mod: num, vip: num }) })),
  hasMore: bool
});

export type Role = 'mods' | 'vips' | 'founders';

export type { RolePage } from '@/misc/roleList';

export const getRolePage = (params: RoleQuery & { limit: number }): Promise<RolePage> =>
  call(`/v1/${params.role}${query(roleParams(params))}`, { expect: rolePageShape });

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

  return Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [key, value == null ? undefined : String(value)])
  );
};

export const getUsers = (params: UserQuery, actor?: string): Promise<User[]> =>
  call(`/v1/users${query(asParams(params))}`, {
    ...(actor ? { actor } : {}),
    expect: usersShape
  });

export const getUserIgnored = (userId: string) =>
  call<{ userId: string; ignored: boolean }>(`/v1/users/${encodeURIComponent(userId)}/ignored`, {
    authenticated: true
  });

export const getUserPermissionLevel = (userId: string) =>
  call<{ userId: string; permission: number }>(
    `/v1/users/${encodeURIComponent(userId)}/permission`,
    { authenticated: true }
  );

export const getChannels = (params: BrowseQuery): Promise<BrowsePage> =>
  call(`/v1/channels${query(asParams(params))}`, { revalidate: 60, expect: browsePageShape });

export const getAccounts = (
  params: BrowseQuery & { bots: 'include' | 'exclude' }
): Promise<BrowsePage> =>
  call(`/v1/accounts${query(asParams(params))}`, { revalidate: 60, expect: browsePageShape });

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

export const getUserChatBadges = <T>(userId: string) =>
  call<{ userId: string; available: T; selected: string | null }>(
    `/v1/users/${encodeURIComponent(userId)}/chat-badges`,
    { authenticated: true }
  );

export const setUserIgnored = (userId: string, ignored: boolean) =>
  call<{ userId: string; ignored: boolean; updated: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/ignored`,
    { authenticated: true, method: 'PATCH', body: { ignored } }
  );

export const setUserSocial = (userId: string, network: string, externalId: string) =>
  call<{ userId: string; network: string; externalId: string }>(
    `/v1/users/${encodeURIComponent(userId)}/socials/${encodeURIComponent(network)}`,
    { authenticated: true, method: 'PUT', body: { externalId } }
  );

export const clearUserSocial = (userId: string, network: string) =>
  call<{ userId: string; network: string; removed: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/socials/${encodeURIComponent(network)}`,
    { authenticated: true, method: 'DELETE' }
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
  }>(`/v1/channels/${encodeURIComponent(channelId)}/connection`, { authenticated: true });

export const setModeratedChannels = (
  userId: string,
  channels: { id: string; login: string }[],
  complete: boolean
) =>
  call<{ userId: string; channels: number; revoked: number; complete: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/moderated-channels`,
    { authenticated: true, method: 'PUT', body: { channels, complete } }
  );

export const setChannelConnection = (channelId: string, scopes: string[]) =>
  call<{ channelId: string; connected: boolean; scopes: string }>(
    `/v1/channels/${encodeURIComponent(channelId)}/connection`,
    { authenticated: true, method: 'PUT', body: { scopes } }
  );

export const clearChannelConnection = (channelId: string) =>
  call<{ channelId: string; connected: boolean; changed: boolean }>(
    `/v1/channels/${encodeURIComponent(channelId)}/connection`,
    { authenticated: true, method: 'DELETE' }
  );

export const setUserChatBadge = (userId: string, badge: string) =>
  call<{ userId: string; badge: string | null }>(
    `/v1/users/${encodeURIComponent(userId)}/chat-badge`,
    { authenticated: true, method: 'PUT', body: { badge } }
  );

export interface BotEntry {
  userId: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  addedBy: string | null;
  addedByLogin: string | null;
  addedAt: string;
  known: boolean;
}

export const getBots = (actor: string) =>
  call<BotEntry[]>('/v1/bots', { authenticated: true, actor });

export interface JobStatus {
  lastAt: string | null;
  dueSince: string;
  overdue: boolean;
}

export interface JobHealth {
  snapshot: JobStatus & { users: number | null };
  roleCounts: JobStatus;
  sweepHead: string | null;
  backup: { at: string; bytes: number; expectedEverySeconds: number } | null;
}

export const getJobHealth = (actor: string) =>
  call<JobHealth>('/v1/jobs', { authenticated: true, actor });

export interface AdminEntry {
  userId: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  grantedBy: string | null;
  grantedByLogin: string | null;
  grantedAt: string | null;
  owner: boolean;
}

export const getAdmins = (actor: string) =>
  call<AdminEntry[]>('/v1/admins', { authenticated: true, actor });

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
  call<ChannelConnections>('/v1/channels/connections', { authenticated: true, actor });

export const grantAdmin = (actor: string, userId: string) =>
  call<{ userId: string; admin: boolean }>(`/v1/admins/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'PUT',
    actor
  });

export const revokeAdmin = (actor: string, userId: string) =>
  call<{ userId: string; admin: boolean }>(`/v1/admins/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'DELETE',
    actor
  });

export const flagBot = (actor: string, userId: string) =>
  call<{ userId: string; bot: boolean }>(`/v1/bots/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'PUT',
    actor
  });

export const unflagBot = (actor: string, userId: string) =>
  call<{ userId: string; bot: boolean }>(`/v1/bots/${encodeURIComponent(userId)}`, {
    authenticated: true,
    method: 'DELETE',
    actor
  });

export const refreshUser = (
  subject: { login: string } | { id: string },
  roles: boolean = false
): Promise<User> =>
  call('/v1/users/refresh', {
    authenticated: true,
    method: 'POST',
    body: { ...subject, roles },
    expect: userShape
  });

export const getBadges = () => call<Badge[]>('/v1/badges', { expect: badgesShape });

export const grantBadge = (actor: string, userId: string, badge: string) =>
  call<{ userId: string; badge: string; granted: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/badges/${encodeURIComponent(badge)}`,
    { authenticated: true, method: 'PUT', actor }
  );

export const revokeBadge = (actor: string, userId: string, badge: string) =>
  call<{ userId: string; badge: string; revoked: boolean; chatBadgeCleared: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/badges/${encodeURIComponent(badge)}`,
    { authenticated: true, method: 'DELETE', actor }
  );
