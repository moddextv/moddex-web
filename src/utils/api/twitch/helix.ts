import { db } from '@/misc/Database';
import { GqlUser, IVRUser } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { config } from '@/config';
import { splitArray } from '@/utils/utils';

export const helix = async (
  endpoint: string,
  method: string = 'GET',
  body?: object
): Promise<[]> => {
  const url: string = `https://api.twitch.tv/helix/${endpoint}`;

  const auth: string = await getAppAuthToken();

  const headers = {
    'Client-Id': config.twitch.clientId,
    'Authorization': `Bearer ${auth}`,
    'Content-Type': 'application/json'
  };

  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : null)
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorDetails = await response.json();
      await logger.db('helix-error',
        `Error in ${method} ${url}: ${response.status} ${response.statusText} - ${errorDetails.message || 'No detailed message'}`
      );
      return [];
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    await logger.db('helix-error', `Network Error in ${method} ${url}: ${error}`);
    return [];
  }
};

export const getAppAuthToken = async () => {
  const tokenData = await db.queryOne(
    'SELECT access_token, expires_at FROM tokens WHERE name = ?',
    ['app-token']
  );

  if (tokenData && Number(tokenData.expires_at) > Date.now()) {
    return tokenData.access_token;
  }

  const url = new URL('https://id.twitch.tv/oauth2/token');
  url.search = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    grant_type: 'client_credentials'
  }).toString();

  const authResponse = await fetch(url, {
    method: 'POST'
  });

  const newTokenData = await authResponse.json();
  const expires_at = Date.now() + newTokenData.expires_in * 1000;

  await db.query(
    'REPLACE INTO tokens (name, access_token, expires_at) VALUES (?, ?, ?)',
    ['app-token', newTokenData.access_token, expires_at]
  );
  return newTokenData.access_token;
};

export const getUserId = async (username: string): Promise<string> => {
  const user: any[] = await helix(`users?login=${username}`);
  return user[0]?.id || '';
}

export const getUsersFromHelix = async (usernames: string[]): Promise<GqlUser[]> => {
  const usernameChunks = splitArray([...usernames], 100);

  const userArrays = await Promise.all(
    usernameChunks.map(async (userChunk) => {
      const endpoint = `users?${userChunk.map((username) => `login=${username}`).join('&')}`;
      return await helix(endpoint);
    })
  );

  return userArrays.flat();
};