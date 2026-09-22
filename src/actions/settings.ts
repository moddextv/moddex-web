'use server';

import { revalidatePath } from 'next/cache';
import {
  clearChannelConnection,
  clearUserSocial,
  hideChannelFor,
  setUserChatBadge,
  setUserIgnored,
  unhideChannelFor
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

const isTwitchId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9]{1,20}$/.test(value);

// a channel hidden from the signed-in person's own profile; the channel's list is untouched
export async function hideChannel(channelId: string): Promise<ActionResult> {
  return attempt('hideChannel', async () => {
    if (!isTwitchId(channelId)) throw new RangeError('the channel id must be a twitch id');

    const userId = await requireUserId();

    await hideChannelFor(userId, channelId);

    revalidatePath('/settings');
  });
}

export async function unhideChannel(channelId: string): Promise<ActionResult> {
  return attempt('unhideChannel', async () => {
    if (!isTwitchId(channelId)) throw new RangeError('the channel id must be a twitch id');

    const userId = await requireUserId();

    await unhideChannelFor(userId, channelId);

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
