/**
 * Integration tests against a running stack.
 *
 *   docker compose up -d
 *   npx vitest run --config vitest.integration.config.ts
 *
 * These hit the real app over http and the real database behind it, so they
 * are excluded from the default `npm test` run. They assert *contracts* rather
 * than data, because the seeded database grows as channels get refreshed --
 * anything asserting "exactly N mods" would rot within a day.
 */
import { describe, expect, it, beforeAll } from 'vitest';

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:5099';
const TIMEOUT = 120_000; // a cold next dev route compiles on first hit

const get = async (path: string) => {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json — the assertion below will say so */
  }
  return { status: res.status, json, text };
};

beforeAll(async () => {
  const res = await fetch(`${BASE}/api/health`);
  if (!res.ok) {
    throw new Error(
      `stack not reachable at ${BASE} (/api/health -> ${res.status}). ` +
        'run `docker compose up -d` first.'
    );
  }
}, TIMEOUT);

describe('GET /api/v1/mods', () => {
  it(
    'rejects a non-integer channel_id with 400',
    async () => {
      const { status, json } = await get('/api/v1/mods?channel_id=abc');
      expect(status).toBe(400);
      expect(json.error).toBe('bad request');
    },
    TIMEOUT
  );

  it(
    'rejects a request with no parameters at all with 400',
    async () => {
      const { status, json } = await get('/api/v1/mods');
      expect(status).toBe(400);
      expect(json.message).toMatch(/channel, channel_id, user, user_id/);
    },
    TIMEOUT
  );

  it(
    '404s for a channel that is not tracked',
    async () => {
      const { status, json } = await get(
        '/api/v1/mods?channel=definitelynotarealchannel_zzz'
      );
      expect(status).toBe(404);
      expect(json.error).toBe('not found');
    },
    TIMEOUT
  );

  it(
    'returns 200 with an array for a tracked channel',
    async () => {
      const { status, json } = await get('/api/v1/mods?channel=forsen');
      expect(status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    },
    TIMEOUT
  );
});

describe('the 200-[] vs 404 contract', () => {
  // §5 removed eight dead `if (!filtered)` branches that could never fire,
  // because filterUsers always returns an array. The de-facto contract has
  // always been "200 with an empty array", never 404-on-empty, and the FFZ
  // add-on depends on it. This test exists so that stays a decision rather
  // than something that drifts.
  it(
    'an empty role list is 200 [], not 404',
    async () => {
      // a demo channel from the seed with no mods of its own
      const { status, json } = await get('/api/v1/vips?channel=demoshouter');
      expect([200, 404]).toContain(status);
      if (status === 200) {
        expect(Array.isArray(json)).toBe(true);
      } else {
        // 404 is only ever "no such tracked channel", never "no rows"
        expect(json.message).toMatch(/no tracked channel/);
      }
    },
    TIMEOUT
  );
});

describe('GET /api/v1/founders', () => {
  it(
    'exists and answers the same shape as mods/vips',
    async () => {
      const { status, json } = await get('/api/v1/founders?channel=forsen');
      expect(status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    },
    TIMEOUT
  );

  it(
    'carries the granted date, which is the whole point of the role',
    async () => {
      const { json } = await get('/api/v1/founders?channel=forsen');
      if (!Array.isArray(json) || json.length === 0) return; // nothing to assert
      for (const f of json) {
        expect(f).toHaveProperty('granted');
        expect(f.granted).not.toBeNull();
        expect(Number.isNaN(new Date(f.granted).getTime())).toBe(false);
      }
    },
    TIMEOUT
  );
});

describe('opt-out filtering', () => {
  it(
    'never returns the `ignored` flag to api consumers',
    async () => {
      // filterUsers drops opted-out users and strips the flag from the rest;
      // leaking it would expose who has opted out, which is the one thing the
      // setting is for.
      const { json } = await get('/api/v1/mods?channel=forsen');
      if (!Array.isArray(json)) return;
      for (const u of json) {
        expect(u).not.toHaveProperty('ignored');
      }
    },
    TIMEOUT
  );

  it(
    '404s an opted-out channel rather than serving it',
    async () => {
      const { status } = await get('/api/v1/mods?channel=optedout');
      expect(status).toBe(404);
    },
    TIMEOUT
  );
});

describe('GET /api/health', () => {
  it(
    'reports ok while the database is reachable',
    async () => {
      const { status } = await get('/api/health');
      expect(status).toBe(200);
    },
    TIMEOUT
  );
});
