import type { BotRow } from '@/actions/bots';
import type { AdminRow } from '@/actions/admins';

export interface Row {
  userId: string;
  login: string | null;
  name: string | null;
  avatar: string | null;
  byLogin: string | null;
  at: string | null;
  owner?: boolean;
  known?: boolean;
}

export const CAP = 40;

export const toBotRow = (bot: BotRow): Row => ({
  userId: bot.userId,
  login: bot.login,
  name: bot.name,
  avatar: bot.avatar,
  byLogin: bot.addedByLogin,
  at: bot.addedAt,
  known: bot.known
});

export const toAdminRow = (admin: AdminRow): Row => ({
  userId: admin.userId,
  login: admin.login,
  name: admin.name,
  avatar: admin.avatar,
  byLogin: admin.grantedByLogin,
  at: admin.grantedAt,
  owner: admin.owner
});

export const matches = (row: Row, term: string) =>
  row.login?.toLowerCase().includes(term) ||
  row.name?.toLowerCase().includes(term) ||
  row.userId.includes(term);

export interface Hit {
  account: Row;
  bot: boolean;
  admin: boolean;
}

export const resolveHit = (bots: Row[], admins: Row[], term: string): Hit | null => {
  if (!term) return null;

  const account =
    bots.find((row) => matches(row, term)) ?? admins.find((row) => matches(row, term));

  if (!account) return null;

  return {
    account,
    bot: bots.some((row) => row.userId === account.userId),
    admin: admins.some((row) => row.userId === account.userId)
  };
};

export const visibleRows = (rows: Row[], term: string, showAll: boolean) => {
  const filtered = term ? rows.filter((row) => matches(row, term)) : rows;

  return showAll ? filtered : filtered.slice(0, CAP);
};
