export const BROWSE_PAGE_SIZE = 50;

// the api clamps offset here, so nothing beyond this page can be served
const MAX_OFFSET = 10_000;

export const MAX_BROWSE_PAGE = Math.floor(MAX_OFFSET / BROWSE_PAGE_SIZE);

export type BrowseAxis = 'channel' | 'user';

export const browsePagePath = (axis: BrowseAxis, page: number): string => `/${axis}/page/${page}`;

export const parseBrowsePage = (value: string): number | null => {
  if (!/^[1-9][0-9]*$/.test(value)) return null;

  const page = Number(value);

  return page > MAX_BROWSE_PAGE ? null : page;
};

export const browsePageCount = (total: number): number => {
  if (!Number.isFinite(total) || total < 1) return 1;

  return Math.min(Math.ceil(total / BROWSE_PAGE_SIZE), MAX_BROWSE_PAGE);
};
