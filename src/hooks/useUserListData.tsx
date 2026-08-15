import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchUserListPage } from '@/actions/roleList';
import {
  takeOnce,
  withServerSearch,
  withServerSort,
  type ListDirection,
  type ListSort,
  type Query
} from '@/hooks/pageQuery';
import { beginPage, beginQuery, createPageLoad, newest, wanted } from '@/hooks/pageLoad';
import { Account, RoleUser } from '@/misc/account';
import { RoleType, UserType } from '@/misc/roles';
import { PAGE_SIZE, type RolePage } from '@/misc/roleList';

export { PAGE_SIZE };

export const useUserListData = (
  user: Account,
  type: UserType,
  role: RoleType,
  initial?: RolePage
) => {
  const [users, setUsers] = useState<RoleUser[]>(initial?.items ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(!initial);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const [paged, setPaged] = useState<boolean>(initial?.hasMore ?? false);
  const [hasMore, setHasMore] = useState<boolean>(initial?.hasMore ?? false);
  const cursor = useRef<string | null>(initial?.cursor ?? null);

  const [total, setTotal] = useState<number | null>(initial?.total ?? null);

  const [query, setQuery] = useState<Query>({ sort: 'granted', dir: 'desc', search: '' });

  const load = useRef(createPageLoad());

  const seeded = useRef(Boolean(initial));

  useEffect(() => {
    if (seeded.current) {
      seeded.current = false;
      return;
    }

    const attempt = beginQuery(load.current);

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const page = await fetchUserListPage(user.id, type, role, {
          limit: PAGE_SIZE,
          sort: query.sort,
          dir: query.dir,
          search: query.search
        });

        if (!wanted(load.current, attempt)) return;

        setUsers(page.items);
        setHasMore(page.hasMore);
        setPaged(page.hasMore);
        setTotal(page.total);
        cursor.current = page.cursor;
      } catch {
        if (wanted(load.current, attempt)) setError('Something went wrong with this request');
      } finally {
        if (wanted(load.current, attempt)) setIsLoading(false);
      }
    };

    run();
  }, [user.id, type, role, query, reloadToken]);

  const loadMore = useCallback(async () => {
    const seeking = takeOnce(cursor);
    if (!seeking) return;

    const attempt = beginPage(load.current);
    setIsLoadingMore(true);

    try {
      const page = await fetchUserListPage(user.id, type, role, {
        limit: PAGE_SIZE,
        cursor: seeking,
        sort: query.sort,
        dir: query.dir,
        search: query.search
      });

      if (!wanted(load.current, attempt)) return;

      setUsers((previous) => [...previous, ...page.items]);
      setHasMore(page.hasMore);
      cursor.current = page.cursor;
    } catch {
      if (wanted(load.current, attempt)) {
        setError('Something went wrong with this request');
        cursor.current = seeking;
      }
    } finally {
      if (newest(load.current, attempt)) setIsLoadingMore(false);
    }
  }, [user.id, type, role, query]);

  const setServerSort = useCallback((sort: ListSort, dir: ListDirection) => {
    setQuery((previous) => {
      const next = withServerSort(previous, sort, dir);

      if (next !== previous) cursor.current = null;

      return next;
    });
  }, []);

  const setServerSearch = useCallback((term: string) => {
    setQuery((previous) => {
      const next = withServerSearch(previous, term);

      if (next !== previous) cursor.current = null;

      return next;
    });
  }, []);

  const reload = () => {
    cursor.current = null;
    setReloadToken((token) => token + 1);
  };

  return {
    users,
    isLoading,
    isLoadingMore,
    error,
    reload,
    paged,
    hasMore,
    total,
    loadMore,
    serverSort: query.sort,
    serverDir: query.dir,
    serverSearch: query.search,
    setServerSort,
    setServerSearch
  };
};
