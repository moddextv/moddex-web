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
