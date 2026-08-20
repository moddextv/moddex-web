import { RoleUser } from '@/misc/account';

export const COLUMNS = {
  granted: {
    label: 'Granted',
    opens: 'desc',
    ends: { desc: 'newest first', asc: 'oldest first' },
    compare: (a: RoleUser, b: RoleUser) => grantedAt(a) - grantedAt(b)
  },
  followers: {
    label: 'Followers',
    opens: 'desc',
    ends: { desc: 'most first', asc: 'fewest first' },
    compare: (a: RoleUser, b: RoleUser) => (a.followers || 0) - (b.followers || 0)
  },
  name: {
    label: 'Name',
    opens: 'asc',
    ends: { desc: 'z to a', asc: 'a to z' },
    compare: (a: RoleUser, b: RoleUser) => a.login.localeCompare(b.login)
  }
} as const;

export type ColumnKey = keyof typeof COLUMNS;
export type Direction = 'asc' | 'desc';

export const BOT_MODES = ['all', 'hide', 'only'] as const;
export type BotMode = (typeof BOT_MODES)[number];

export const BOT_MODES_LABEL: Record<BotMode, string> = {
  all: 'shown',
  hide: 'hidden',
  only: 'only'
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
