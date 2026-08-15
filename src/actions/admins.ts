'use server';

import { getAdmins, grantAdmin, revokeAdmin, type AdminEntry } from '@/utils/api/moddex';
import { requirePermission } from '@/utils/authz';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { permissions } from '@/utils/permissions';
import { revalidatePath } from 'next/cache';

const admin = () => requirePermission(permissions.admin);

export type AdminRow = AdminEntry;

export async function listAdmins(): Promise<ActionResult<AdminRow[]>> {
  return attempt('listAdmins', async () => {
    const { userId } = await admin();

    return getAdmins(userId);
  });
}

export async function makeAdmin(userId: string): Promise<ActionResult> {
  return attempt('makeAdmin', async () => {
    const { userId: actor } = await admin();

    await grantAdmin(actor, userId);
    revalidatePath('/dashboard');
  });
}

export async function removeAdmin(userId: string): Promise<ActionResult> {
  return attempt('removeAdmin', async () => {
    const { userId: actor } = await admin();

    await revokeAdmin(actor, userId);
    revalidatePath('/dashboard');
  });
}
