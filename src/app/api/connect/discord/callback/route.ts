import { NextRequest } from 'next/server';
import { backToSettings } from '@/utils/api/connectRedirect';
import { serverConfig } from '@/serverConfig';
import { auth } from '@/auth';
import { exchangeCodeForUserId, isDiscordConfigured, readDiscordState } from '@/utils/api/discord';
import { ModdexApiError, setUserSocial } from '@/utils/api/moddex';

export async function GET(request: NextRequest) {
  const session = await auth();
  const twitchId = session?.user?.id;

  if (!twitchId) return backToSettings('discord', 'signin');
  if (!isDiscordConfigured()) return backToSettings('discord', 'unconfigured');

  const params = request.nextUrl.searchParams;

  if (params.get('error')) return backToSettings('discord', 'canceled');

  if (!readDiscordState(params.get('state'), twitchId)) return backToSettings('discord', 'state');

  const code = params.get('code');
  if (!code) return backToSettings('discord', 'nocode');

  try {
    const discordId = await exchangeCodeForUserId(serverConfig.baseUrl, code);
    if (!discordId) return backToSettings('discord', 'exchange');

    await setUserSocial(twitchId, 'discord', discordId);

    return backToSettings('discord', 'connected');
  } catch (error) {
    if (error instanceof ModdexApiError && error.status === 409)
      return backToSettings('discord', 'taken');

    return backToSettings('discord', 'failed');
  }
}
