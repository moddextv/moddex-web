import { IVRUser } from '@/misc/Interfaces';
import { ivr } from '@/utils/api/ivr';
import { regex } from '@/utils/regex';

export const validateUsername = async (username: string = ''): Promise<boolean> => {
  if (!regex.username.test(username)) {
    return false;
  }

  const users: IVRUser[] = await ivr(`user?login=${username}`);
  if (!users.length) {
    return false;
  }

  return !users[0].banned;
};

/**
 * `Number()` coerces generously -- null, '', [] and whitespace all become 0,
 * which Number.isInteger then accepts. A function called isInteger saying yes
 * to null is a trap for the next caller, so the coercion is bounded to the two
 * types that can meaningfully be one.
 *
 * The /api/v1 routes are unaffected: they read query params, which are always
 * strings, and only reach here after an `if (param)` guard.
 */
export const isInteger = (value: unknown): boolean => {
  if (typeof value === 'number') return Number.isInteger(value);
  if (typeof value !== 'string' || value.trim() === '') return false;

  return Number.isInteger(Number(value));
};
