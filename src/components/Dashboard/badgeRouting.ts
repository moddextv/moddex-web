import type { Badge } from '@/misc/badges';

type Kind = 'admins' | 'bots' | 'badge' | 'flag';

/**
 * A flag badge is a column on the account rather than a `user_badges` row, so it
 * is read and never granted: the api answers a grant with 409 and the holders
 * list with a count and no roster. Routing one to the ordinary panel is what put
 * "nobody holds verified" under a chip reading 31, and a toggle beside it that
 * could only ever fail.
 */
const KINDS: Record<string, Kind> = {
  admin: 'admins',
  bot: 'bots',
  verified: 'flag',
  affiliate: 'flag',
  partner: 'flag',
  staff: 'flag'
};

export const kindOf = (badge: string): Kind => KINDS[badge] ?? 'badge';

// which sentence says who writes it, since a flag badge is not twitch's by definition
const FLAG_COPY: Record<string, string> = {
  verified: 'dash.badge.signInFlag',
  affiliate: 'dash.badge.twitchOwned',
  partner: 'dash.badge.twitchOwned',
  staff: 'dash.badge.twitchOwned'
};

export const flagCopyFor = (badge: string): string => FLAG_COPY[badge] ?? 'dash.badge.twitchOwned';

export const SOURCES: Record<string, string> = {
  affiliate: 'twitch',
  partner: 'twitch',
  staff: 'twitch',
  verified: 'signing in',
  donator: 'the donations',
  'top donator': 'the donations',
  booster: 'discord boosts'
};

export const wears = (badges: Badge[] | undefined, name: string): boolean =>
  (badges ?? []).some((badge) => badge.name === name);
