'use server';

import { AccountSort, BrowsePage, ChannelSort } from '@/misc/browse';
import { getAccounts, getChannels, ModdexApiError } from '@/utils/api/moddex';

const EMPTY: BrowsePage = { items: [], limit: 0, offset: 0, hasMore: false };

export async function fetchChannels(
  sort: ChannelSort,
  limit: number,
  offset: number
): Promise<BrowsePage> {
  try {
    return await getChannels({
      sort,
      limit,
      offset
    });
  } catch (error) {
    if (error instanceof ModdexApiError && error.status === 404) return EMPTY;

    throw error;
  }
}

export async function fetchAccounts(
  sort: AccountSort,
  limit: number,
  offset: number,
  includeBots: boolean
): Promise<BrowsePage> {
  try {
    return await getAccounts({
      sort,
      bots: includeBots ? 'include' : 'exclude',
      limit,
      offset
    });
  } catch (error) {
    if (error instanceof ModdexApiError && error.status === 404) return EMPTY;

    throw error;
  }
}
