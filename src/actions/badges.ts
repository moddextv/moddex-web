'use server';

import {
  getBadgeCounts,
  getBadgeHolders,
  getBadges,
  grantBadge,
  revokeBadge,
  type BadgeHolder
} from '@/utils/api/moddex';
import type { Badge } from '@/misc/badges';
import { requirePermission } from '@/utils/authz';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { permissions } from '@/utils/permissions';
import { revalidatePath } from 'next/cache';

const admin = () => requirePermission(permissions.admin);

const refresh = () => {
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
};

export async function grantUserBadge(userId: string, badge: string): Promise<ActionResult> {
  return attempt('grantUserBadge', async () => {
    const { userId: actor } = await admin();

    await grantBadge(actor, userId, badge);

    refresh();
  });
}

export async function revokeUserBadge(userId: string, badge: string): Promise<ActionResult> {
  return attempt('revokeUserBadge', async () => {
    const { userId: actor } = await admin();

    await revokeBadge(actor, userId, badge);

    refresh();
  });
}

export async function listBadgeCatalogue(): Promise<ActionResult<Badge[]>> {
  return attempt('listBadgeCatalogue', async () => {
    await admin();

    return getBadges();
  });
}

export async function listBadgeCounts(): Promise<ActionResult<Record<string, number>>> {
  return attempt('listBadgeCounts', async () => {
    const { userId } = await admin();

    return getBadgeCounts(userId);
  });
}

export async function listBadgeHolders(badge: string): Promise<ActionResult<BadgeHolder[]>> {
  return attempt('listBadgeHolders', async () => {
    const { userId } = await admin();

    const { items } = await getBadgeHolders(userId, badge);

    return items;
  });
}
