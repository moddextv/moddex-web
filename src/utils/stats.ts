import 'server-only';

import { getStats } from '@/utils/api/moddex/public';

interface Stats {
  channels: number;
  users: number;
  mods: number;
  vips: number;
  founders: number | null;
}

export const getIndexStats = async (): Promise<Stats> => {
  const { channels, users, mods, vips, founders } = await getStats();

  return { channels, users, mods, vips, founders };
};
