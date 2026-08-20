import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NEXTAUTH_URL = 'https://moddex.tv';
process.env.AUTH_SECRET = 'test-secret';
process.env.AUTH_TWITCH_ID = 'test-client';
process.env.AUTH_TWITCH_SECRET = 'test-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_DONATION_PRICE = 'price_test';

const getUserProfile = vi.fn();
const refreshUser = vi.fn();

vi.mock('@/utils/api/moddex', async () => {
  const actual =
    await vi.importActual<typeof import('../src/utils/api/moddex')>('../src/utils/api/moddex');

  return {
    ModdexApiError: actual.ModdexApiError,
    getUserProfile,
    refreshUser,
    getUserIgnored: vi.fn(),
    getUserPermissionLevel: vi.fn()
  };
});

type GetUser = typeof import('../src/utils/user').getUser;
let getUser: GetUser;
let ModdexApiError: typeof import('../src/utils/api/moddex').ModdexApiError;

beforeAll(async () => {
  ({ ModdexApiError } = await import('../src/utils/api/moddex'));
  ({ getUser } = await import('../src/utils/user'));
});

afterEach(() => {
  vi.clearAllMocks();
});

const optedOut = () =>
  new ModdexApiError(404, '/v1/users/mrsxdev', 'mrsxdev opted out of being listed', 'opted out');

const theRow = { id: '123', login: 'mrsxdev', name: 'mrsxdev' };

describe('getUser and the opt-out', () => {
  it('reports an opted-out account as opted out on the ordinary read', () => {
    getUserProfile.mockRejectedValue(optedOut());

    return getUser('mrsxdev').then((result) => {
      expect(result).toEqual({ user: null, optedOut: true });
      expect(refreshUser).not.toHaveBeenCalled();
    });
  });

  it('does not serve an opted-out account through the reload button', () => {
    getUserProfile.mockRejectedValue(optedOut());
    refreshUser.mockResolvedValue(theRow);

    return getUser('mrsxdev', true).then((result) => {
      expect(result).toEqual({ user: null, optedOut: true });
      expect(refreshUser).not.toHaveBeenCalled();
    });
  });

  it('still refreshes an ordinary account by id', () => {
    getUserProfile.mockResolvedValue(theRow);
    refreshUser.mockResolvedValue({ ...theRow, name: 'newer' });

    return getUser('mrsxdev', true).then((result) => {
      expect(result.user?.name).toBe('newer');
      expect(refreshUser).toHaveBeenCalledWith({ id: '123' }, false);
    });
  });
});
