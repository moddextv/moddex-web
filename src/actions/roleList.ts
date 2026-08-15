'use server';

import { RoleType, UserType } from '@/misc/roles';
import type { ListDirection, ListSort } from '@/hooks/pageQuery';
import { getRolePage, ModdexApiError, type RolePage } from '@/utils/api/moddex';

const notFound = (error: unknown) => error instanceof ModdexApiError && error.status === 404;

const ROLE_FOR: Record<UserType, Record<string, 'mods' | 'vips' | 'founders'>> = {
  channel: { mods: 'mods', vips: 'vips', founders: 'founders' },
  user: { modding: 'mods', viping: 'vips', founding: 'founders' }
};

const EMPTY_PAGE: RolePage = { items: [], hasMore: false, cursor: null, total: null };

export async function fetchUserListPage(
  userId: string,
  type: UserType,
  role: RoleType,
  options: {
    limit: number;
    cursor?: string | null;
    sort: ListSort;
    dir: ListDirection;
    search?: string;
  }
): Promise<RolePage> {
  const endpoint = ROLE_FOR[type]?.[role];
  if (!endpoint) return EMPTY_PAGE;

  const searching = type === 'user' && (options.search?.trim().length ?? 0) >= 3;

  const sort: ListSort = type === 'channel' ? 'granted' : options.sort;

  const axis = type === 'channel' ? { channel_id: userId } : { user_id: userId };

  try {
    const page = await getRolePage({
      role: endpoint,
      ...axis,
      limit: options.limit,
      sort,
      dir: options.dir,
      cursor: options.cursor ?? undefined,
      q: searching ? options.search?.trim() : undefined
    });

    return {
      items: page.items,
      hasMore: page.hasMore,
      cursor: page.hasMore ? page.cursor : null,
      total: page.total ?? null
    };
  } catch (error) {
    if (notFound(error)) return EMPTY_PAGE;

    throw error;
  }
}
