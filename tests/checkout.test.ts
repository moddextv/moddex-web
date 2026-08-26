import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted above every const, so the spy has to be hoisted with it
const { create } = vi.hoisted(() => ({
  create: vi.fn(async (_params: { success_url: string; cancel_url: string }) => ({
    id: 'cs_test_1'
  }))
}));

vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create } };
  }
}));

vi.mock('@/auth', () => ({ auth: vi.fn(async () => ({ user: { login: 'maersux' } })) }));

vi.mock('@/serverConfig', () => ({
  serverConfig: {
    baseUrl: 'https://moddex.tv',
    stripe: { secretKey: 'sk_test', donation: { price: 'price_1' } }
  }
}));

import { startCheckout } from '@/actions/checkout';

const urls = async (locale?: string) => {
  await startCheckout(locale);

  return create.mock.calls.at(-1)![0];
};

describe('the donation sends the donor back where they came from', () => {
  beforeEach(() => create.mockClear());

  /**
   * The return url was hardcoded english until 2026-08-26, so a german donor
   * gave in german and landed on the english thank-you page. /de/spenden/success
   * existed the whole time and was never reached.
   */
  it('returns to the language the donor was reading', async () => {
    expect(await urls('de')).toMatchObject({
      success_url: 'https://moddex.tv/de/spenden/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://moddex.tv/de/spenden'
    });

    expect(await urls('fr')).toMatchObject({
      success_url: 'https://moddex.tv/fr/don/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://moddex.tv/fr/don'
    });
  });

  it('keeps the english urls unprefixed', async () => {
    expect(await urls('en')).toMatchObject({
      success_url: 'https://moddex.tv/donate/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://moddex.tv/donate'
    });
  });

  /**
   * The argument crosses from the browser into a url stripe redirects to, so it
   * is clamped rather than trusted. Anything unknown reads as english, which is
   * what this did before it took an argument at all.
   */
  it.each([undefined, '', 'zz', '../evil', 'https://elsewhere.example', 'de/../..'])(
    'refuses %s and falls back to english',
    async (bogus) => {
      const built = await urls(bogus);

      expect(built.success_url).toBe(
        'https://moddex.tv/donate/success?session_id={CHECKOUT_SESSION_ID}'
      );
      expect(built.cancel_url).toBe('https://moddex.tv/donate');
    }
  );

  it('never lets a caller reach a host that is not ours', async () => {
    for (const bogus of ['//evil.example', 'https://evil.example', '\\\\evil.example']) {
      const built = await urls(bogus);

      expect(built.success_url.startsWith('https://moddex.tv/')).toBe(true);
      expect(built.cancel_url.startsWith('https://moddex.tv/')).toBe(true);
    }
  });
});
