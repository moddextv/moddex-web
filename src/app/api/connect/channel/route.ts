import { NextResponse } from 'next/server';
import { backToSettings } from '@/utils/api/connectRedirect';
import { auth } from '@/auth';
import { authorizeUrl, isConnectConfigured, mintConnectState } from '@/utils/api/twitchConnect';

export async function GET() {
  const session = await auth();
  const twitchId = session?.user?.id;

  if (!twitchId) {
    return backToSettings('channel', 'signin');
  }

  if (!isConnectConfigured()) {
    return backToSettings('channel', 'unconfigured');
  }

  return NextResponse.redirect(authorizeUrl(mintConnectState(twitchId)));
}
