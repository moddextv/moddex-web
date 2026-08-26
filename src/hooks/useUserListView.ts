'use client';

import { useEffect, useMemo, useState } from 'react';
import { RoleUser } from '@/misc/account';
import { type ListDirection, type ListSort } from '@/hooks/pageQuery';
import { BotMode, COLUMNS, ColumnKey, Direction, matches } from '@/components/User/columns';

export const useUserListView = (
  users: RoleUser[],
  paged: boolean,
  type: 'channel' | 'user',
  setServerSort: (sort: ListSort, direction: ListDirection) => void,
  setServerSearch: (query: string) => void
) => {
  const [column, setColumn] = useState<ColumnKey>(type === 'channel' ? 'granted' : 'followers');
  const [direction, setDirection] = useState<Direction>('desc');

  const [botMode, setBotMode] = useState<BotMode>('all');
  const [query, setQuery] = useState('');

  const botCount = useMemo(
    () => (paged ? 0 : users.filter((entry) => entry.bot).length),
    [users, paged]
  );

  const visibleUsers = useMemo(() => {
    if (paged) return users;

    const filtered = users.filter(
      (entry) =>
        matches(entry, query) &&
        (botMode === 'all' || (botMode === 'only' ? entry.bot : !entry.bot))
    );

    const compare = COLUMNS[column].compare;
    const sorted = [...filtered].sort(compare);

    return direction === 'desc' ? sorted.reverse() : sorted;
  }, [users, query, botMode, column, direction, paged]);

  const searching = query.trim().length > 0;
  const filtered = !paged && (searching || botMode !== 'all');

  // filtered asks whether THIS component is hiding rows, canClear whether the
  // person has anything to undo — a paged list is filtered by the server
  const canClear = searching || botMode !== 'all';

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
    setBotMode('all');
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
    botMode,
    setBotMode,
    query,
    setQuery,
    botCount,
    visibleUsers,
    searching,
    filtered,
    canClear,
    clear,
    chooseColumn
  };
};
