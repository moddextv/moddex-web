import schedule from 'node-schedule';
import { db } from '@/misc/Database';
import { logger } from '@/misc/Logger';

let isScheduled = false;

const captureSnapshot = async (): Promise<void> => {
  try {
    const [channels, users, mods, vips] = await Promise.all([
      db.query(`SELECT COUNT(*) AS count FROM users WHERE updated IS NOT NULL`),
      db.query(`SELECT COUNT(*) AS count FROM users`),
      db.query(`SELECT COUNT(*) AS count FROM mods`),
      db.query(`SELECT COUNT(*) AS count FROM vips`),
    ]);

    await db.query(
      `INSERT INTO snapshots (channels, users, mods, vips) VALUES (?, ?, ?, ?)`,
      [
        channels[0].count,
        users[0].count,
        mods[0].count,
        vips[0].count
      ]
    );

    console.log("Snapshot captured successfully.");
  } catch (error) {
    await logger.db('cronjob', `Error capturing snapshot: ${error}`);
  }
};

export const scheduleTask = (): void => {
  if (!isScheduled) {
    schedule.scheduleJob('0 * * * *', captureSnapshot);
    isScheduled = true;
  }
};
