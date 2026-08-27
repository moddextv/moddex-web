import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

process.env.NEXTAUTH_URL = 'https://moddex.tv';
process.env.AUTH_SECRET = 'test-secret';
process.env.AUTH_TWITCH_ID = 'test-client';
process.env.AUTH_TWITCH_SECRET = 'test-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_DONATION_PRICE = 'price_test';

type Walk = typeof import('../src/utils/api/twitchConnect').fetchModeratedChannels;
let fetchModeratedChannels: Walk;

beforeAll(async () => {
  ({ fetchModeratedChannels } = await import('../src/utils/api/twitchConnect'));
});

const page = (n: number, cursor?: string) => ({
  ok: true,
  json: async () => ({
    data: Array.from({ length: n }, (_, i) => ({
      broadcaster_id: String(1000 + i),
      broadcaster_login: `channel${i}`
    })),
    pagination: cursor ? { cursor } : {}
  })
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchModeratedChannels', () => {
  /**
   * Somebody moderating exactly 100, 200 or 300 channels produces a genuinely
   * complete last page that is full, which is byte for byte what a dropped
   * cursor produces. Nothing was ever revoked for them. There is no next page to
   * ask for without a cursor, so the second read is the same position one
   * narrower: a remainder that exactly fills 100 cannot also exactly fill 99.
   */
  it('settles an exact multiple of the page size by reading it again one narrower', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(100))
      .mockResolvedValueOnce(page(99, 'c1'))
      .mockResolvedValueOnce(page(1));

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchModeratedChannels('token', '778353697');

    expect(result.channels).toHaveLength(100);
    expect(result.complete).toBe(true);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('first=99');
    // 100 rather than 200: the re-read replaces the rewound page, it does not add to it
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('refuses to call a full page without a cursor complete, even after the narrower read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(page(100)));

    const result = await fetchModeratedChannels('token', '778353697');

    expect(result.channels).toHaveLength(100);
    expect(result.complete).toBe(false);
  });

  it('still calls a short page complete, which is the ordinary ending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(page(37)));

    const result = await fetchModeratedChannels('token', '1123455928');

    expect(result.channels).toHaveLength(37);
    expect(result.complete).toBe(true);
  });

  it('walks every page while twitch does send cursors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(100, 'c1'))
      .mockResolvedValueOnce(page(51));

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchModeratedChannels('token', '778353697');

    expect(result.channels).toHaveLength(151);
    expect(result.complete).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('asks for a whole page, because the guard is written against that number', async () => {
    const fetchMock = vi.fn().mockResolvedValue(page(0));
    vi.stubGlobal('fetch', fetchMock);

    await fetchModeratedChannels('token', '1');

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('first=100');
  });

  it('reports a short read rather than an empty list when twitch errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    const result = await fetchModeratedChannels('token', '1');

    expect(result.channels).toHaveLength(0);
    expect(result.complete).toBe(false);
  });
});
