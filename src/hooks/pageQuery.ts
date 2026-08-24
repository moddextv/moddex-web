export type ListSort = 'granted' | 'followers';
export type ListDirection = 'asc' | 'desc';

export interface Query {
  sort: ListSort;
  dir: ListDirection;
  search: string;
}

export const MIN_SEARCH_LENGTH = 3;

export const takeOnce = <T>(ref: { current: T | null }): T | null => {
  const value = ref.current;
  if (value === null) return null;

  ref.current = null;

  return value;
};

export const withServerSort = (previous: Query, sort: ListSort, dir: ListDirection): Query =>
  previous.sort === sort && previous.dir === dir ? previous : { ...previous, sort, dir };

export const withServerSearch = (previous: Query, term: string): Query => {
  const trimmed = term.trim();
  const next = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '';

  return previous.search === next ? previous : { ...previous, search: next };
};

// hasMore answers "is there another page of THIS reply", paged answers "is this
// list server-paged" — only an unfiltered reply may answer the second
export const stillPaged = (previous: boolean, query: Query, hasMore: boolean): boolean =>
  query.search ? previous : hasMore;
