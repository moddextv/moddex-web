import schedule from 'node-schedule';
import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';

let isScheduled = false;

const captureSnapshot = async (): Promise<void> => {
  try {
    const [channels, users, mods, vips] = await Promise.all([
      db.queryOne(`SELECT COUNT(*) AS count FROM users WHERE updated IS NOT NULL`),
      db.queryOne(`SELECT COUNT(*) AS count FROM users`),
      db.queryOne(`SELECT COUNT(*) AS count FROM mods`),
      db.queryOne(`SELECT COUNT(*) AS count FROM vips`),
    ]);

    await db.query(
      `INSERT INTO snapshots (channels, users, mods, vips) VALUES (?, ?, ?, ?)`,
      [
        channels.count,
        users.count,
        mods.count,
        vips.count
      ]
    );
  } catch (error) {
    await logger.db('cronjob', `error capturing snapshot: ${error}`);
  }
};

export const scheduleTask = (): void => {
  if (!isScheduled) {
    isScheduled = true;
    schedule.scheduleJob('0 * * * *', captureSnapshot);
  }
};
