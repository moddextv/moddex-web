'use server';

import { grantAdmin, revokeAdmin } from '@/utils/api/moddex/admin';
import { requirePermission } from '@/utils/authz';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { permissions } from '@/utils/permissions';
import { revalidatePath } from 'next/cache';

const admin = () => requirePermission(permissions.admin);

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
