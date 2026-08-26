'use server';

import { revalidatePath } from 'next/cache';
import {
  clearChannelConnection,
  clearUserSocial,
  setUserChatBadge,
  setUserIgnored
} from '@/utils/api/moddex/me';
import { requireUserId } from '@/utils/authz';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';
import { NETWORKS, type Network } from '@/misc/networks';

// What the signed-in user may change about themselves. Every export here takes
// its user from requireUserId and never from an argument.

export async function setIgnoredUser(ignoreUser: boolean): Promise<ActionResult> {
  return attempt('setIgnoredUser', async () => {
    const userId = await requireUserId();

    await setUserIgnored(userId, ignoreUser);
  });
}

export async function setSelectedUserChatBadge(newSelectedBadge: string): Promise<ActionResult> {
  return attempt('setSelectedUserChatBadge', async () => {
    const userId = await requireUserId();

    await setUserChatBadge(userId, newSelectedBadge);
  });
}

// One action for every social network, because `user_socials` is keyed by one.
// The type is erased over the wire, so the list is checked at runtime too.
export async function disconnect(network: Network): Promise<ActionResult> {
  return attempt('disconnect', async () => {
    if (!NETWORKS.includes(network)) {
      throw new RangeError(`unknown network: ${network}`);
    }

    const userId = await requireUserId();

    await clearUserSocial(userId, network);

    revalidatePath('/settings');
  });
}

// not disconnect('channel') — a grant with revoked_at and subscriptions behind it
export async function disconnectChannel(): Promise<ActionResult> {
  return attempt('disconnectChannel', async () => {
    const userId = await requireUserId();

    await clearChannelConnection(userId);

    revalidatePath('/settings');
  });
}
