'use server';

import { flagBot, getBots, getUserProfile, unflagBot, type BotEntry } from '@/utils/api/moddex';
import { requirePermission } from '@/utils/authz';
import type { User } from '@/misc/account';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { permissions } from '@/utils/permissions';
import { revalidatePath } from 'next/cache';

const admin = () => requirePermission(permissions.admin);

export type BotRow = BotEntry;

export async function listBots(): Promise<ActionResult<BotRow[]>> {
  return attempt('listBots', async () => {
    const { userId } = await admin();

    return getBots(userId);
  });
}

export async function findAccount(login: string): Promise<ActionResult<User | null>> {
  return attempt('findAccount', async () => {
    await admin();

    const trimmed = login.trim().toLowerCase();
    if (!trimmed) return null;

    return await getUserProfile({ login: trimmed });
  });
}

export async function flagAccountAsBot(userId: string): Promise<ActionResult> {
  return attempt('flagAccountAsBot', async () => {
    const { userId: actor } = await admin();

    await flagBot(actor, userId);

    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
  });
}

export async function unflagAccountAsBot(userId: string): Promise<ActionResult> {
  return attempt('unflagAccountAsBot', async () => {
    const { userId: actor } = await admin();

    await unflagBot(actor, userId);

    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
  });
}
