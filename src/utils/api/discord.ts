import 'server-only';

import { purposeOf } from '@/utils/api/connectFlow';
import { callbackUrl, exchangeCodeForToken } from '@/utils/api/oauth';

import { mintState, readState } from './oauthState';

const AUTHORIZE = 'https://discord.com/oauth2/authorize';
const TOKEN = 'https://discord.com/api/oauth2/token';
const ME = 'https://discord.com/api/users/@me';

const clientId = () => process.env.DISCORD_CLIENT_ID ?? '';
const clientSecret = () => process.env.DISCORD_CLIENT_SECRET ?? '';

export const isDiscordConfigured = (): boolean => Boolean(clientId() && clientSecret());

export const redirectUri = (baseUrl: string): string => callbackUrl(baseUrl, 'discord');

const PURPOSE = purposeOf('discord');

export const mintDiscordState = (twitchId: string): string => mintState(PURPOSE, twitchId);

export const readDiscordState = (state: string | null, twitchId: string): boolean =>
  readState(state, PURPOSE, twitchId);

export const authorizeUrl = (baseUrl: string, state: string): string => {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(baseUrl),
    response_type: 'code',
    scope: 'identify',
    state,
    prompt: 'consent'
  });

  return `${AUTHORIZE}?${params.toString()}`;
};

export const exchangeCodeForUserId = async (
  baseUrl: string,
  code: string
): Promise<string | null> => {
  const grant = await exchangeCodeForToken(
    TOKEN,
    { clientId: clientId(), clientSecret: clientSecret() },
    code,
    redirectUri(baseUrl)
  );

  if (!grant) return null;

  const meResponse = await fetch(ME, {
    headers: { Authorization: `Bearer ${grant.accessToken}` }
  });
  if (!meResponse.ok) return null;

  const me = (await meResponse.json()) as { id?: string };

  return typeof me.id === 'string' && /^[0-9]{5,64}$/.test(me.id) ? me.id : null;
};
