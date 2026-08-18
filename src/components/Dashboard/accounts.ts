import type { BotRow } from '@/actions/bots';
import type { AdminRow } from '@/actions/admins';
import type { Badge } from '@/misc/badges';
import type { BadgeHolder } from '@/utils/api/moddex';

export interface Row {
  userId: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  badges: Badge[];
  byLogin: string | null;
  at: string | null;
  owner?: boolean;
  ignored?: boolean;
  known?: boolean;
}

export const CAP = 40;

export const toBotRow = (bot: BotRow): Row => ({
  userId: bot.userId,
  login: bot.login,
  name: bot.name,
  avatar: bot.avatar,
  badges: bot.badges ?? [],
  byLogin: bot.addedByLogin,
  at: bot.addedAt,
  known: bot.known
});

export const toAdminRow = (admin: AdminRow): Row => ({
  userId: admin.userId,
  login: admin.login,
  name: admin.name,
  avatar: admin.avatar,
  badges: admin.badges ?? [],
  byLogin: admin.grantedByLogin,
  at: admin.grantedAt,
  owner: admin.owner
});

export const matches = (row: Row, term: string) =>
  row.login?.toLowerCase().includes(term) ||
  row.name?.toLowerCase().includes(term) ||
  row.userId.includes(term);

export const visibleRows = (rows: Row[], term: string, showAll: boolean) => {
  const filtered = term ? rows.filter((row) => matches(row, term)) : rows;

  return showAll ? filtered : filtered.slice(0, CAP);
};

export const toHolderRow = (holder: BadgeHolder): Row => ({
  userId: holder.id,
  login: holder.login,
  name: holder.name,
  avatar: holder.avatar,
  badges: holder.badges ?? [],
  byLogin: holder.grantedByLogin,
  at: holder.grantedAt,
  ignored: holder.ignored
});
