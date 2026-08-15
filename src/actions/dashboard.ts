'use server';

import {
  getConnections,
  getJobHealth,
  type ChannelConnections,
  type JobHealth
} from '@/utils/api/moddex';
import { requirePermission } from '@/utils/authz';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { permissions } from '@/utils/permissions';

// The reads behind /dashboard. Bots and admins are writes and keep their own
// files; these two only look.

const admin = () => requirePermission(permissions.admin);

export async function fetchJobHealth(): Promise<ActionResult<JobHealth>> {
  return attempt('fetchJobHealth', async () => {
    const { userId } = await admin();

    return getJobHealth(userId);
  });
}

export async function listConnections(): Promise<ActionResult<ChannelConnections>> {
  return attempt('listConnections', async () => {
    const { userId } = await admin();

    return getConnections(userId);
  });
}
