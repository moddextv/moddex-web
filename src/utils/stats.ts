import 'server-only';

import { getStats as apiGetStats } from '@/utils/api/moddex';
import { formatNumberShort } from '@/utils/utils';

interface StatsEntry {
  raw: number;
  formatted: string;
}

interface Stats {
  channels: StatsEntry;
  users: StatsEntry;
  mods: StatsEntry;
  vips: StatsEntry;
}

/**
 * The snapshot query moved to moddex-api; the formatting stayed here, because
 * how a number reads is a presentation decision. The api returns raw values
 * and zeroes on a fresh install rather than throwing, so the homepage renders
 * either way.
 */
const entry = (raw: number): StatsEntry => ({
  raw,
  formatted: formatNumberShort(raw)
});

export const getStats = async (): Promise<Stats> => {
  const { channels, users, mods, vips } = await apiGetStats();

  return {
    channels: entry(channels),
    users: entry(users),
    mods: entry(mods),
    vips: entry(vips)
  };
};
