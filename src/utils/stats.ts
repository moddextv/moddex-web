import { db } from '@/misc/Database';
import { formatNumberShort } from '@/utils/utils';

interface StatsEntry {
  raw: number,
  formatted: string;
}

interface Stats {
  channels: StatsEntry;
  users: StatsEntry;
  mods: StatsEntry;
  vips: StatsEntry;
}

export const getStats = async (): Promise<Stats> => {
  // `false` when the table is empty -- a fresh install has no snapshot row yet,
  // and the homepage should render zeroes rather than throw. a database that is
  // actually down now throws out of queryOne instead of arriving here as false.
  const snapshot = await db.queryOne('SELECT * FROM snapshots ORDER BY id DESC');
  const stats = snapshot || {};

  const channels = Number(stats.channels || 0);
  const users = Number(stats.users || 0);
  const mods = Number(stats.mods || 0);
  const vips = Number(stats.vips || 0);

  return {
    channels: {
      raw: channels,
      formatted: formatNumberShort(channels)
    },
    users: {
      raw: users,
      formatted: formatNumberShort(users)
    },
    mods: {
      raw: mods,
      formatted: formatNumberShort(mods)
    },
    vips: {
      raw: vips,
      formatted: formatNumberShort(vips)
    }
  }
}
