'use server';

import {
  getConnections,
  getDonationLedger,
  getMembership,
  getEventsubHealth,
  getJobHealth,
  type ChannelConnections,
  type EventsubHealth,
  type Membership,
  type JobHealth,
  type Ledger
} from '@/utils/api/moddex';
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

export async function listConnections(): Promise<ActionResult<ChannelConnections>> {
  return attempt('listConnections', async () => {
    const { userId } = await admin();

    return getConnections(userId);
  });
}
