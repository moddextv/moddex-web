import 'server-only';

import { getStats } from '@/utils/api/moddex';
import { formatNumberShort } from '@/utils/format';

interface StatsEntry {
  raw: number;
  formatted: string;
}

interface Stats {
  channels: StatsEntry;
  users: StatsEntry;
  mods: StatsEntry;
  vips: StatsEntry;
  founders: StatsEntry | null;
}

const entry = (raw: number): StatsEntry => ({
  raw,
  formatted: formatNumberShort(raw)
});

export const getFormattedStats = async (): Promise<Stats> => {
  const { channels, users, mods, vips, founders } = await getStats();

  return {
    channels: entry(channels),
    users: entry(users),
    mods: entry(mods),
    vips: entry(vips),
    founders: founders === null ? null : entry(founders)
  };
};
