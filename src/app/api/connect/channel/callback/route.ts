import { NextRequest } from 'next/server';
import { backToSettings } from '@/utils/api/connectRedirect';
import { auth } from '@/auth';
import { setChannelConnection, setModeratedChannels } from '@/utils/api/moddex/me';
import { logger } from '@/misc/Logger';
import { REQUIRED_SCOPES, exchangeCode, readConnectState } from '@/utils/api/twitchConnect';

export async function GET(request: NextRequest) {
  const session = await auth();
  const twitchId = session?.user?.id;

  if (!twitchId) return backToSettings('channel', 'signin');

  const params = request.nextUrl.searchParams;

  if (params.get('error')) return backToSettings('channel', 'canceled');

  if (!readConnectState(params.get('state'), twitchId)) return backToSettings('channel', 'state');

  const code = params.get('code');
  if (!code) return backToSettings('channel', 'nocode');

  try {
    const result = await exchangeCode(code);
    if (!result) return backToSettings('channel', 'exchange');

    if (result.userId !== twitchId) return backToSettings('channel', 'mismatch');

    const missing = REQUIRED_SCOPES.filter((scope) => !result.scopes.includes(scope));
    if (missing.length) return backToSettings('channel', 'scopes');

    await setChannelConnection(twitchId, result.scopes);

    if (result.moderated) {
      try {
        await setModeratedChannels(twitchId, result.moderated.channels, result.moderated.complete);
      } catch (error) {
        logger.warn(`connected ${twitchId} but could not store their moderated channels`, error);
        return backToSettings('channel', 'connected-nosync');
      }
    }

    return backToSettings('channel', 'connected');
  } catch {
    return backToSettings('channel', 'failed');
  }
}
