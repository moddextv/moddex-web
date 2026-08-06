import 'server-only';

import { auth } from '@/auth';
import { constants } from '@/utils/constants';

/**
 * every export of a 'use server' file is a publicly callable endpoint. the
 * acting user must therefore come from the session, never from an argument --
 * these helpers exist so a new server action cannot get that wrong by
 * forgetting to write the check out by hand.
 *
 * they throw rather than returning null: a server action that ignores a
 * returned value still runs its mutation, whereas a throw cannot be ignored.
 */

export class NotAuthenticatedError extends Error {
  constructor() {
    super('not authenticated');
    this.name = 'NotAuthenticatedError';
  }
}

export class NotAuthorisedError extends Error {
  constructor(required: number, actual: number) {
    super(`not authorised: requires permission ${required}, has ${actual}`);
    this.name = 'NotAuthorisedError';
  }
}

/**
 * the id of the signed-in user, or throw. this is the one every mutating
 * action needs.
 */
export const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NotAuthenticatedError();
  }

  return userId;
};

/**
 * as above, but also demands a permission level. `perms` is resolved from the
 * user's badges at sign-in (see the jwt callback in auth.ts), so it is only as
 * fresh as the token -- do not use it to gate anything that must revoke
 * instantly.
 */
export const requirePermission = async (
  required: number
): Promise<{ userId: string; perms: number }> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NotAuthenticatedError();
  }

  const perms = session?.user?.perms ?? constants.permissions.default;

  if (perms < required) {
    throw new NotAuthorisedError(required, perms);
  }

  return { userId, perms };
};
