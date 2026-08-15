import { NextResponse } from 'next/server';
import { backToSettings } from '@/utils/api/connectRedirect';
import { serverConfig } from '@/serverConfig';
import { auth } from '@/auth';
import { authorizeUrl, isDiscordConfigured, mintDiscordState } from '@/utils/api/discord';

export async function GET() {
  const session = await auth();
  const twitchId = session?.user?.id;

  if (!twitchId) {
    return backToSettings('discord', 'signin');
  }

  if (!isDiscordConfigured()) {
    return backToSettings('discord', 'unconfigured');
  }

  return NextResponse.redirect(authorizeUrl(serverConfig.baseUrl, mintDiscordState(twitchId)));
}
