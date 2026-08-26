import 'server-only';

import type { ConnectFlow } from '@/utils/api/connectFlow';

export const callbackUrl = (baseUrl: string, flow: ConnectFlow): string =>
  `${baseUrl.replace(/\/$/, '')}/api/connect/${flow}/callback`;

interface TokenGrant {
  accessToken: string;
  scopes: string[];
}

export const exchangeCodeForToken = async (
  tokenUrl: string,
  credentials: { clientId: string; clientSecret: string },
  code: string,
  redirectUri: string
): Promise<TokenGrant | null> => {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  if (!response.ok) return null;

  const token = (await response.json()) as { access_token?: string; scope?: string[] };

  if (!token.access_token) return null;

  return {
    accessToken: token.access_token,
    scopes: Array.isArray(token.scope) ? token.scope : []
  };
};
