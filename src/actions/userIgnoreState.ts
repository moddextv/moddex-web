'use server';

import { setUserIgnored } from '@/utils/api/moddex';
import { requireUserId } from '@/utils/authz';

/**
 * every export of a 'use server' file is a publicly callable endpoint, so the
 * acting user is derived from the session here and never taken from an
 * argument.
 *
 * that is now the ONLY thing enforcing it. the write happens in moddex-api,
 * which sees `userId` in a url and has no session to check it against — it
 * trusts the internal token to mean "this is moddex-web" and trusts moddex-web
 * to have done exactly what the line below does. do not accept a user id as a
 * parameter here.
 */
export async function setIgnoredUser(ignoreUser: boolean): Promise<void> {
  const userId = await requireUserId();

  await setUserIgnored(userId, ignoreUser);
}
