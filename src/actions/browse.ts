'use server';

import { AccountSort, BrowsePage, ChannelSort } from '@/misc/Interfaces';
import { getAccounts, getChannels } from '@/utils/api/moddex';

/**
 * The browse pages, for the client components that offer sorting and "load
 * more". Server actions rather than a route handler because the only caller is
 * this app's own ui, and a public json route for this already exists on
 * api.moddex.tv.
 *
 * A failure comes back as an empty page rather than throwing. These lists are
 * one section of a page, and taking the whole route down because a ranking did
 * not load is the wrong trade -- the same reasoning as fetchUserListData.
 */
const EMPTY: BrowsePage = { items: [], limit: 0, offset: 0, hasMore: false };

export async function fetchChannels(
  sort: ChannelSort,
  limit: number,
  offset: number
): Promise<BrowsePage> {
  try {
    return await getChannels<BrowsePage>({
      sort,
      limit: String(limit),
      offset: String(offset)
    });
  } catch {
    return EMPTY;
  }
}

export async function fetchAccounts(
  sort: AccountSort,
  limit: number,
  offset: number,
  includeBots: boolean
): Promise<BrowsePage> {
  try {
    return await getAccounts<BrowsePage>({
      sort,
      bots: includeBots ? 'include' : 'exclude',
      limit: String(limit),
      offset: String(offset)
    });
  } catch {
    return EMPTY;
  }
}
