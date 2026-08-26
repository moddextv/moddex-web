import 'server-only';

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { ConnectPurpose } from '@/utils/api/connectFlow';
import { serverConfig } from '@/serverConfig';

const sign = (payload: string): string =>
  createHmac('sha256', serverConfig.authSecret).update(payload).digest('hex');

export const mintState = (purpose: ConnectPurpose, twitchId: string): string => {
  const nonce = randomBytes(16).toString('hex');
  const payload = `${purpose}.${twitchId}.${nonce}`;

  return `${payload}.${sign(payload)}`;
};

export const readState = (
  state: string | null,
  purpose: ConnectPurpose,
  twitchId: string
): boolean => {
  if (!state) return false;

  const [statePurpose, id, nonce, signature] = state.split('.');
  if (!statePurpose || !id || !nonce || !signature) return false;

  if (statePurpose !== purpose || id !== twitchId) return false;

  const a = Buffer.from(signature);
  const b = Buffer.from(sign(`${statePurpose}.${id}.${nonce}`));

  return a.length === b.length && timingSafeEqual(a, b);
};
