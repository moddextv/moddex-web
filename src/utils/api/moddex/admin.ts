import type { Badge } from '@/misc/badges';
import { asParams, call, query } from '@/utils/api/moddex/client';

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

interface ChannelConnection {
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

interface JobStatus {
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

// depth costs two scans of the whole roles table, so only the jobs page asks
export const getJobHealth = (actor: string, withDepth = false, historyDays?: number) => {
  const params = query({
    depth: withDepth ? '1' : undefined,
    history: historyDays ? String(historyDays) : undefined
  });

  return call<JobHealth>(`/v1/admin/jobs${params}`, { authenticated: true, actor });
};
