import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONNECT_FLOWS, purposeOf } from '@/utils/api/connectFlow';
import { callbackUrl } from '@/utils/api/oauth';

describe('connect flows', () => {
  it('names every flow once', () => {
    expect([...CONNECT_FLOWS]).toEqual(['channel', 'discord']);
  });

  // This module imports nothing, and that is load-bearing rather than tidy:
  // reaching for serverConfig here makes every importer require NEXTAUTH_URL at
  // import time. It did, briefly, and only CI noticed — a dev machine has a
  // .env, so the suite passed locally and failed on push.
  it('imports nothing, so it cannot drag a required env var in', () => {
    const source = readFileSync(
      join(__dirname, '..', 'src', 'utils', 'api', 'connectFlow.ts'),
      'utf8'
    );

    expect(source).not.toMatch(/^import\s/m);
  });

  // The purpose is a wire value inside the signed state. Changing it fails the
  // state check for anyone mid-authorisation, so it is pinned here.
  it.each([
    ['channel', 'channel-connect'],
    ['discord', 'discord-connect']
  ] as const)('signs %s state as %s', (flow, purpose) => {
    expect(purposeOf(flow)).toBe(purpose);
  });
});

describe('callbackUrl', () => {
  it('builds the redirect twitch and discord were registered with', () => {
    expect(callbackUrl('https://moddex.tv', 'channel')).toBe(
      'https://moddex.tv/api/connect/channel/callback'
    );
    expect(callbackUrl('https://moddex.tv', 'discord')).toBe(
      'https://moddex.tv/api/connect/discord/callback'
    );
  });

  // A redirect that does not match the one registered with the provider is
  // rejected by them, so a stray slash in baseUrl must not reach the url.
  it('tolerates a trailing slash on the base url', () => {
    expect(callbackUrl('https://moddex.tv/', 'discord')).toBe(
      'https://moddex.tv/api/connect/discord/callback'
    );
  });

  it('leaves a port and a path prefix alone', () => {
    expect(callbackUrl('http://localhost:4999', 'channel')).toBe(
      'http://localhost:4999/api/connect/channel/callback'
    );
  });
});
