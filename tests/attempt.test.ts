import { beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NEXTAUTH_URL = 'https://moddex.tv';
process.env.AUTH_SECRET = 'test-secret';
process.env.AUTH_TWITCH_ID = 'test-client';
process.env.AUTH_TWITCH_SECRET = 'test-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_DONATION_PRICE = 'price_test';

vi.mock('@/misc/Logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() }
}));

type Attempt = typeof import('../src/actions/attempt').attempt;
let attempt: Attempt;
let ModdexApiError: typeof import('../src/utils/api/moddex/client').ModdexApiError;
let NotAuthenticatedError: typeof import('../src/utils/authErrors').NotAuthenticatedError;
let NotAuthorizedError: typeof import('../src/utils/authErrors').NotAuthorizedError;

beforeAll(async () => {
  ({ attempt } = await import('../src/actions/attempt'));
  ({ ModdexApiError } = await import('../src/utils/api/moddex/client'));
  ({ NotAuthenticatedError, NotAuthorizedError } = await import('../src/utils/authErrors'));
});

const throwing = (error: unknown) => () => Promise.reject(error);

describe('a call that works', () => {
  it('carries the value', async () => {
    const result = await attempt('test', async () => ({ userId: '1' }));

    expect(result).toEqual({ ok: true, data: { userId: '1' } });
  });

  it('carries an undefined value for an action that returns nothing', async () => {
    const result = await attempt('test', async () => undefined);

    expect(result.ok).toBe(true);
  });
});

describe('a call the api refused', () => {
  it('uses the api sentence, without the status and path around it', async () => {
    const error = new ModdexApiError(
      409,
      '/v1/admins/44322889',
      'this is the last admin',
      'last admin'
    );

    expect(error.message).toContain('/v1/admins/44322889');

    const result = await attempt('removeAdmin', throwing(error));

    expect(result).toEqual({ ok: false, error: 'this is the last admin', code: 'last admin' });
  });

  it('passes the slug through so a caller can branch without reading prose', async () => {
    const result = await attempt(
      'getUser',
      throwing(
        new ModdexApiError(404, '/v1/users', 'mrsxdev opted out of being listed', 'opted out')
      )
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('opted out');
  });

  it('says something rather than nothing when the api sent no sentence', async () => {
    const result = await attempt('flagBot', throwing(new ModdexApiError(500, '/v1/bots', '')));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });
});

describe('a call that was not allowed', () => {
  it('tells a signed-out person to sign in', async () => {
    const result = await attempt('setIgnoredUser', throwing(new NotAuthenticatedError()));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('unauthenticated');
      expect(result.error).toMatch(/sign in/i);
    }
  });

  it('tells an ex-admin their permission is gone', async () => {
    const result = await attempt('makeAdmin', throwing(new NotAuthorizedError(2, 0)));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('unauthorized');
  });
});

describe('a call that broke', () => {
  it('says little, because whatever threw was not written to be read', async () => {
    const result = await attempt('listBots', throwing(new Error('ECONNREFUSED 10.0.0.4:4000')));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toContain('ECONNREFUSED');
      expect(result.code).toBeUndefined();
    }
  });

  it('survives something that is not an Error at all', async () => {
    const result = await attempt('listBots', throwing('a string, from somewhere'));

    expect(result.ok).toBe(false);
  });
});
