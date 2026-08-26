import 'server-only';

import { auth } from '@/auth';
import { permissions } from '@/utils/permissions';
import { NotAuthenticatedError, NotAuthorizedError } from '@/utils/authErrors';

export const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NotAuthenticatedError();
  }

  return userId;
};

export const requirePermission = async (
  required: number
): Promise<{ userId: string; perms: number }> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new NotAuthenticatedError();
  }

  const perms = session?.user?.perms ?? permissions.default;

  if (perms < required) {
    throw new NotAuthorizedError(required, perms);
  }

  return { userId, perms };
};
