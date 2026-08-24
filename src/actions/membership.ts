'use server';

import { getMembership, type Membership } from '@/utils/api/moddex/public';
import { attempt } from '@/actions/attempt';
import type { ActionResult } from '@/actions/result';

// this one is public, and moddex-web's token exempts it from the api's rate
// limit — so the shape is checked here before anything is asked of the api
const LOGIN = /^[a-zA-Z0-9_]{1,25}$/;

export async function checkMembership(
  login: string,
  channel: string
): Promise<ActionResult<Membership>> {
  return attempt('checkMembership', async () => {
    const account = login.trim().toLowerCase();
    const where = channel.trim().toLowerCase();

    if (!LOGIN.test(account) || !LOGIN.test(where)) {
      throw new Error('a twitch login is letters, digits and underscores, up to 25');
    }

    return getMembership(account, where);
  });
}
