import type { Badge } from '@/misc/badges';

type Kind = 'admins' | 'bots' | 'badge' | 'twitch';

// twitch decides these three, so they are state rather than a switch
const KINDS: Record<string, Kind> = {
  admin: 'admins',
  bot: 'bots',
  affiliate: 'twitch',
  partner: 'twitch',
  staff: 'twitch'
};

export const kindOf = (badge: string): Kind => KINDS[badge] ?? 'badge';

export const SOURCES: Record<string, string> = {
  affiliate: 'twitch',
  partner: 'twitch',
  staff: 'twitch',
  donator: 'the donations',
  'top donator': 'the donations',
  booster: 'discord boosts'
};

export const wears = (badges: Badge[] | undefined, name: string): boolean =>
  (badges ?? []).some((badge) => badge.name === name);
