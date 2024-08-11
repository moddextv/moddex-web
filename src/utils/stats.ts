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
  const [channelsResult, usersResult, modsResult, vipsResult] = await Promise.all([
    db.queryOne(`SELECT COUNT(*) as count FROM users WHERE updated IS NOT NULL`) || 0,
    db.queryOne(`SELECT COUNT(*) as count FROM users`) || 0,
    db.queryOne(`SELECT COUNT(*) as count FROM mods`) || 0,
    db.queryOne(`SELECT COUNT(*) as count FROM vips`) || 0,
  ]);

  const channels = Number(channelsResult.count || 0);
  const users = Number(usersResult.count || 0);
  const mods = Number(modsResult.count || 0);
  const vips = Number(vipsResult.count || 0);

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
