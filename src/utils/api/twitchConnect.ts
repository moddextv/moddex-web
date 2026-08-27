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

export const REQUIRED_SCOPES = ['moderation:read', 'channel:read:vips'] as const;

const OPTIONAL_SCOPES = ['user:read:moderated_channels'] as const;

export const redirectUri = (baseUrl: string): string => callbackUrl(baseUrl, 'channel');

export const mintConnectState = (twitchId: string): string => mintState(PURPOSE, twitchId);

export const readConnectState = (state: string | null, twitchId: string): boolean =>
  readState(state, PURPOSE, twitchId);

export const authorizeUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: serverConfig.twitch.clientId,
    redirect_uri: redirectUri(serverConfig.baseUrl),
    response_type: 'code',
    scope: [...REQUIRED_SCOPES, ...OPTIONAL_SCOPES].join(' '),
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
    serverConfig.twitch,
    code,
    redirectUri(serverConfig.baseUrl)
  );

  if (!grant) return null;

  const meResponse = await fetch(USERS, {
    headers: {
      Authorization: `Bearer ${grant.accessToken}`,
      'Client-Id': serverConfig.twitch.clientId
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
  let size = MODERATED_PAGE_SIZE;
  let reread = false;

  for (let page = 0; page < 200; page += 1) {
    const at = cursor;
    const before = channels.length;

    const params = new URLSearchParams({
      user_id: userId,
      first: String(size)
    });
    if (cursor) params.set('after', cursor);

    let response: Response;

    try {
      response = await fetch(`${MODERATED_CHANNELS}?${params.toString()}`, {
        signal: AbortSignal.timeout(15_000),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': serverConfig.twitch.clientId
        }
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

    if (cursor) continue;

    if (entries.length < size) return { channels, complete: true };

    // a full page without a cursor either ends on an exact multiple of the page
    // size or is a short read. one remainder cannot fill two different sizes, so
    // walk the same position again one narrower rather than call it complete
    if (reread) return { channels, complete: false };

    reread = true;
    size -= 1;
    cursor = at;
    channels.length = before;
  }

  return { channels, complete: false };
};
