import type { User } from '@/misc/account';
import { call } from '@/utils/api/moddex/client';
import { userShape } from '@/utils/api/moddex/shapes';

export const refreshUser = (
  subject: { login: string } | { id: string },
  roles: boolean = false
): Promise<User> =>
  call('/v1/internal/users/refresh', {
    authenticated: true,
    method: 'POST',
    body: { ...subject, roles },
    expect: userShape
  });

export const recordLogin = (id: string): Promise<{ recorded: boolean }> =>
  call('/v1/internal/logins', { authenticated: true, method: 'POST', body: { id } });
