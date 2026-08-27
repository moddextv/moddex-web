'use server';

import { getEventsubHealth, type EventsubHealth } from '@/utils/api/moddex/public';
import {
  createClientKey,
  getClientKeys,
  revokeClientKey,
  type ClientKeyEntry,
  getAuditLog,
  getConnections,
  getDonationLedger,
  getJobHealth,
  type AuditPage,
  type ChannelConnections,
  type JobHealth,
  type Ledger
} from '@/utils/api/moddex/admin';
import { requirePermission } from '@/utils/authz';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { permissions } from '@/utils/permissions';

// The reads behind /dashboard. Bots and admins are writes and keep their own
// files; these two only look.

const admin = () => requirePermission(permissions.admin);

export async function fetchJobHealth(
  withDepth = false,
  historyDays?: number
): Promise<ActionResult<JobHealth>> {
  return attempt('fetchJobHealth', async () => {
    const { userId } = await admin();

    return getJobHealth(userId, withDepth, historyDays);
  });
}

export async function fetchEventsubHealth(): Promise<ActionResult<EventsubHealth>> {
  return attempt('fetchEventsubHealth', async () => {
    await admin();

    return getEventsubHealth();
  });
}

export async function listDonations(cursor?: string): Promise<ActionResult<Ledger>> {
  return attempt('listDonations', async () => {
    const { userId } = await admin();

    return getDonationLedger(userId, { limit: 50, ...(cursor ? { cursor } : {}) });
  });
}

export type AuditView = 'actions' | 'logins' | 'everything';

// the view decides the filter here rather than in the client, so an action id
// cannot ask for a page the dashboard never offers
const FILTERS: Record<AuditView, { type?: string; exclude?: string }> = {
  actions: { exclude: 'login' },
  logins: { type: 'login' },
  everything: {}
};

export async function listAudit(
  view: AuditView = 'actions',
  cursor?: string
): Promise<ActionResult<AuditPage>> {
  return attempt('listAudit', async () => {
    const { userId } = await admin();

    return getAuditLog(userId, {
      limit: 50,
      ...(FILTERS[view] ?? FILTERS.actions),
      ...(cursor ? { cursor } : {})
    });
  });
}

export async function listConnections(): Promise<ActionResult<ChannelConnections>> {
  return attempt('listConnections', async () => {
    const { userId } = await admin();

    return getConnections(userId);
  });
}

export async function listClientKeys(): Promise<ActionResult<{ items: ClientKeyEntry[] }>> {
  return attempt('listClientKeys', async () => {
    const { userId } = await admin();

    return getClientKeys(userId);
  });
}

export async function mintClientKey(
  label: string,
  login?: string
): Promise<ActionResult<{ id: number; prefix: string; label: string; key: string }>> {
  return attempt('mintClientKey', async () => {
    const { userId } = await admin();

    return createClientKey(userId, label, login);
  });
}

export async function killClientKey(id: number): Promise<ActionResult<{ revoked: boolean }>> {
  return attempt('killClientKey', async () => {
    const { userId } = await admin();

    return revokeClientKey(userId, id);
  });
}
