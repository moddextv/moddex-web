'use client';

import { useEffect, useMemo, useState } from 'react';
import { RoleUser } from '@/misc/account';
import { type ListDirection, type ListSort } from '@/hooks/pageQuery';
import {
  COLUMNS,
  ColumnKey,
  Direction,
  Filters,
  KINDS,
  Kind,
  NO_FILTERS,
  hasKind,
  isFiltering,
  matches,
  passesFilters
} from '@/components/User/columns';

export interface FilterCounts {
  bots: number;
  banned: number;
  kinds: Record<Kind, number>;
}

const EMPTY_COUNTS: FilterCounts = {
  bots: 0,
  banned: 0,
  kinds: { partner: 0, affiliate: 0, staff: 0, verified: 0 }
};

export const useUserListView = (
  users: RoleUser[],
  paged: boolean,
  type: 'channel' | 'user',
  setServerSort: (sort: ListSort, direction: ListDirection) => void,
  setServerSearch: (query: string) => void
) => {
  const [column, setColumn] = useState<ColumnKey>(type === 'channel' ? 'granted' : 'followers');
  const [direction, setDirection] = useState<Direction>('desc');

  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [query, setQuery] = useState('');

  // a paged list is filtered by the server, so the browser offers nothing
  const counts = useMemo<FilterCounts>(() => {
    if (paged) return EMPTY_COUNTS;

    return {
      bots: users.filter((entry) => entry.bot).length,
      banned: users.filter((entry) => entry.banned).length,
      kinds: Object.fromEntries(
        KINDS.map((kind) => [kind, users.filter((entry) => hasKind(entry, kind)).length])
      ) as Record<Kind, number>
    };
  }, [users, paged]);

  const visibleUsers = useMemo(() => {
    if (paged) return users;

    const kept = users.filter((entry) => matches(entry, query) && passesFilters(entry, filters));

    const compare = COLUMNS[column].compare;
    const sorted = [...kept].sort(compare);

    return direction === 'desc' ? sorted.reverse() : sorted;
  }, [users, query, filters, column, direction, paged]);

  const searching = query.trim().length > 0;
  const filtering = !paged && isFiltering(filters);
  const filtered = !paged && (searching || filtering);

  // filtered asks whether THIS component is hiding rows, canClear whether the
  // person has anything to undo — a paged list is filtered by the server
  const canClear = searching || isFiltering(filters);

  useEffect(() => {
    if (!paged) return;

    setColumn('granted');
    setDirection('desc');
  }, [paged]);

  useEffect(() => {
    if (!paged) return;

    const timer = setTimeout(() => setServerSearch(query), 300);
    return () => clearTimeout(timer);
  }, [paged, query, setServerSearch]);

  const clear = () => {
    setQuery('');
    setFilters(NO_FILTERS);
  };

  const chooseColumn = (next: ColumnKey) => {
    if (paged && next === 'name') return;

    const nextDirection =
      next === column ? (direction === 'asc' ? 'desc' : 'asc') : COLUMNS[next].opens;

    setColumn(next);
    setDirection(nextDirection);

    if (paged && next !== 'name') setServerSort(next, nextDirection);
  };

  return {
    column,
    direction,
    filters,
    setFilters,
    counts,
    query,
    setQuery,
    visibleUsers,
    searching,
    filtering,
    filtered,
    canClear,
    clear,
    chooseColumn
  };
};
