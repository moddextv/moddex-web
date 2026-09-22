import { RoleUser } from '@/misc/account';

export const COLUMNS = {
  granted: {
    opens: 'desc',
    compare: (a: RoleUser, b: RoleUser) => grantedAt(a) - grantedAt(b)
  },
  followers: {
    opens: 'desc',
    compare: (a: RoleUser, b: RoleUser) => (a.followers || 0) - (b.followers || 0)
  },
  name: {
    opens: 'asc',
    compare: (a: RoleUser, b: RoleUser) => a.login.localeCompare(b.login)
  }
} as const;

export type ColumnKey = keyof typeof COLUMNS;
export type Direction = 'asc' | 'desc';

const BOT_MODES = ['all', 'hide', 'only'] as const;
export type BotMode = (typeof BOT_MODES)[number];

// the badges a row can be narrowed to; each is a slug the api sends on the row
export const KINDS = ['partner', 'affiliate', 'staff', 'verified'] as const;
export type Kind = (typeof KINDS)[number];

export interface Filters {
  bots: BotMode;
  kinds: Kind[];
  hideBanned: boolean;
}

export const NO_FILTERS: Filters = { bots: 'all', kinds: [], hideBanned: false };

export const hasKind = (user: RoleUser, kind: Kind): boolean =>
  (user.badges ?? []).some((badge) => badge.slug === kind);

export const isFiltering = (filters: Filters): boolean =>
  filters.bots !== 'all' || filters.kinds.length > 0 || filters.hideBanned;

export const activeFilterCount = (filters: Filters): number =>
  (filters.bots === 'all' ? 0 : 1) + filters.kinds.length + (filters.hideBanned ? 1 : 0);

// bots narrow, kinds narrow to any of the chosen, banned drops; each on its own axis
export const passesFilters = (user: RoleUser, filters: Filters): boolean => {
  if (filters.bots === 'hide' && user.bot) return false;
  if (filters.bots === 'only' && !user.bot) return false;
  if (filters.hideBanned && user.banned) return false;
  if (filters.kinds.length > 0 && !filters.kinds.some((kind) => hasKind(user, kind))) return false;

  return true;
};

export const matches = (user: RoleUser, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return (
    user.login.toLowerCase().includes(needle) || (user.name ?? '').toLowerCase().includes(needle)
  );
};

export const grantedAt = (user: RoleUser): number => {
  if (!user.grantedAt) return Number.NEGATIVE_INFINITY;

  const time = new Date(user.grantedAt).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
};
