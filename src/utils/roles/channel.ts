import { db } from '@/misc/Database';
import { ChannelRoleType, User, UserBadgeRow } from '@/misc/Interfaces';
import { fetchFounders, fetchMods, fetchVips } from '@/utils/api/twitch/gql';
import { formatUsers, getUsers } from '@/utils/user';
import { logger } from '@/misc/Logger';

export const getChannelMods = async (
  user: User,
  forceRefresh: boolean = false
): Promise<User[]> => {
  return getUsersByRole(user, 'mods', forceRefresh);
};

export const getChannelVips = async (
  user: User,
  forceRefresh: boolean = false
): Promise<User[]> => {
  return getUsersByRole(user, 'vips', forceRefresh);
};

export const getChannelFounders = async (
  user: User,
  forceRefresh: boolean = false
): Promise<User[]> => {
  return getUsersByRole(user, 'founders', forceRefresh);
};

const getUsersByRole = async (
  user: User,
  role: ChannelRoleType,
  forceRefresh: boolean
): Promise<User[]> => {
  if (forceRefresh || !user.updated) {
    return getAndStoreUsers(user, role);
  }

  return getStoredUsers(user.id, role);
};

// takes the whole user rather than an id: founders are fetched via
// `channel(name:)`, which is keyed on the login, while mods and vips are
// fetched via `user(id:)`.
const getAndStoreUsers = async (channel: User, role: ChannelRoleType): Promise<User[]> => {
  const channelId = channel.id;

  const usersFromApi =
    role === 'mods'
      ? await fetchMods(channelId)
      : role === 'vips'
        ? await fetchVips(channelId)
        : await fetchFounders(channel.login);

  const userIds = usersFromApi.map((user) => user.id);

  if (!userIds.length) {
    await Promise.all([
      db.query(`UPDATE users SET updated=CURRENT_TIMESTAMP WHERE id=?`, [channelId]),
      db.query(`DELETE FROM ${role} WHERE channel_id=?`, [channelId])
    ]);

    return [];
  }

  await getUsers(userIds);
  await storeUsers(channelId, usersFromApi, role);

  await db.query(`UPDATE users SET updated=CURRENT_TIMESTAMP WHERE id=?`, [channelId]);

  return getStoredUsers(channelId, role);
};

const getStoredUsers = async (id: string, role: ChannelRoleType): Promise<User[]> => {
  const usersFromDb: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.follower, u.ignored,
        r.granted, 
        b.id AS badge_id,
        b.name AS badge_name,
        b.path AS badge_path 
      FROM 
        users u 
      JOIN ${role} r 
        ON u.id = r.user_id 
      LEFT JOIN user_badges ub 
        ON u.id = ub.user_id 
      LEFT JOIN badges b 
        ON ub.badge_id = b.id 
      WHERE 
        r.channel_id = ? 
      ORDER BY 
        r.granted DESC, b.order ASC
    `,
    [id]
  );

  return formatUsers(usersFromDb, true);
};

const storeUsers = async (id: string, users: User[], role: ChannelRoleType) => {
  await db.query(`DELETE FROM ${role} WHERE channel_id=?`, [id]);

  for (const user of users) {
    try {
      const grantedDateString = new Date(user.granted as string | Date)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      await db.query(
        `INSERT INTO ${role} (user_id, channel_id, granted) VALUES (?, ?, ?)`,
        [user.id, id, grantedDateString]
      );
    } catch (e) {
      logger.error(`error in storeUsers - channelId: ${id}, userId: ${user.id}, role: ${role}, granted: ${user.granted} - `, e)
    }
  }
};
