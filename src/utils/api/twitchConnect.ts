import 'server-only';

import { purposeOf } from '@/utils/api/connectFlow';
import { callbackUrl, exchangeCodeForToken } from '@/utils/api/oauth';
import { serverConfig } from '@/serverConfig';

import { mintState, readState } from './oauthState';

const AUTHORIZE = 'https://id.twitch.tv/oauth2/authorize';
const TOKEN = 'https://id.twitch.tv/oauth2/token';
const USERS = 'https://api.twitch.tv/helix/users';
const MODERATED_CHANNELS = 'https://api.twitch.tv/helix/moderation/channels';

const PURPOSE = purposeOf('channel');

export const SCOPES = ['moderation:read', 'channel:read:vips'] as const;

const OPTIONAL_SCOPES = ['user:read:moderated_channels'] as const;

const clientId = () => process.env.AUTH_TWITCH_ID ?? '';
const clientSecret = () => process.env.AUTH_TWITCH_SECRET ?? '';

export const isConnectConfigured = (): boolean => Boolean(clientId() && clientSecret());

export const redirectUri = (baseUrl: string): string => callbackUrl(baseUrl, 'channel');

export const mintConnectState = (twitchId: string): string => mintState(PURPOSE, twitchId);

export const readConnectState = (state: string | null, twitchId: string): boolean =>
  readState(state, PURPOSE, twitchId);

export const authorizeUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(serverConfig.baseUrl),
    response_type: 'code',
    scope: [...SCOPES, ...OPTIONAL_SCOPES].join(' '),
    state,
    force_verify: 'true'
  });

  return `${AUTHORIZE}?${params.toString()}`;
};

interface ConnectResult {
  userId: string;
  scopes: string[];
  moderated: { channels: { id: string; login: string }[]; complete: boolean } | null;
}

export const exchangeCode = async (code: string): Promise<ConnectResult | null> => {
  const grant = await exchangeCodeForToken(
    TOKEN,
    { clientId: clientId(), clientSecret: clientSecret() },
    code,
    redirectUri(serverConfig.baseUrl)
  );

  if (!grant) return null;

  const meResponse = await fetch(USERS, {
    headers: {
      Authorization: `Bearer ${grant.accessToken}`,
      'Client-Id': clientId()
    }
  });

  if (!meResponse.ok) return null;

  const me = (await meResponse.json()) as { data?: { id?: string }[] };
  const userId = me.data?.[0]?.id;

  if (typeof userId !== 'string' || !/^[0-9]{1,20}$/.test(userId)) return null;

  const moderated = grant.scopes.includes('user:read:moderated_channels')
    ? await fetchModeratedChannels(grant.accessToken, userId)
    : null;

  return { userId, scopes: grant.scopes, moderated };
};

const MODERATED_PAGE_SIZE = 100;

export const fetchModeratedChannels = async (
  accessToken: string,
  userId: string
): Promise<{ channels: { id: string; login: string }[]; complete: boolean }> => {
  const channels: { id: string; login: string }[] = [];
  let cursor = '';

  for (let page = 0; page < 100; page += 1) {
    const params = new URLSearchParams({
      user_id: userId,
      first: String(MODERATED_PAGE_SIZE)
    });
    if (cursor) params.set('after', cursor);

    let response: Response;

    try {
      response = await fetch(`${MODERATED_CHANNELS}?${params.toString()}`, {
        signal: AbortSignal.timeout(15_000),
        headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': clientId() }
      });
    } catch {
      return { channels, complete: false };
    }

    if (!response.ok) return { channels, complete: false };

    const body = (await response.json().catch(() => null)) as {
      data?: { broadcaster_id?: string; broadcaster_login?: string }[];
      pagination?: { cursor?: string };
    } | null;

    if (!body) return { channels, complete: false };

    const entries = body.data ?? [];

    for (const entry of entries) {
      if (entry.broadcaster_id) {
        channels.push({ id: String(entry.broadcaster_id), login: entry.broadcaster_login ?? '' });
      }
    }

    cursor = body.pagination?.cursor ?? '';

    if (!cursor) {
      // twitchdev/issues#1176: this endpoint omits the cursor for any `first`
      // above 1, so a FULL page without one is a short read, not the end. Never
      // reduce this to `if (!cursor) complete = true` — that is the whole bug.
      if (entries.length >= MODERATED_PAGE_SIZE) return { channels, complete: false };

      return { channels, complete: true };
    }
  }

  return { channels, complete: false };
};
