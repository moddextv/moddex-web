import { describe, expect, it } from 'vitest';
import config from '../next.config.mjs';

const DOCS = 'https://api.moddex.tv/docs';

const redirects = await config.redirects!();

describe('the docs redirects', () => {
  it('cover all three spellings people reach for', () => {
    const toDocs = redirects.filter((r) => r.destination === DOCS).map((r) => r.source);

    expect(toDocs.sort()).toEqual(['/api', '/api/docs', '/docs']);
  });

  it('are permanent', () => {
    for (const redirect of redirects) expect(redirect.permanent).toBe(true);
  });

  // `/api` sits directly above this app's own routes, and a wildcard here would
  // take the sign-in flow down with it
  it('match exactly, so the app routes under /api are untouched', () => {
    const toDocs = redirects.filter((r) => r.destination === DOCS);

    for (const redirect of toDocs) {
      expect(redirect.source).not.toMatch(/[:*(]/);
    }
  });

  it('lets no wildcard from anywhere else reach /api either', () => {
    const wildcards = redirects.filter((r) => /[:*(]/.test(r.source));

    for (const redirect of wildcards) {
      expect(redirect.source.startsWith('/api')).toBe(false);
      expect('/api/auth/callback/twitch').not.toMatch(
        new RegExp(`^${redirect.source.replace(/\/:path\*$/, '(/|$)')}`)
      );
    }
  });
});
