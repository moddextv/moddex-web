import { db } from '@/misc/Database';
import { ChannelRoleType, User, UserBadgeRow } from '@/misc/Interfaces';
import { fetchMods, fetchVips } from '@/utils/api/twitch/gql';
import { formatUsers, getUsers } from '@/utils/user';

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

const getUsersByRole = async (
  user: User,
  role: ChannelRoleType,
  forceRefresh: boolean
): Promise<User[]> => {
  if (forceRefresh || !user.updated) {
    return await getAndStoreUsers(user.id, role);
  }

  return getStoredUsers(user.id, role);
};

const getAndStoreUsers = async (channelId: string, role: ChannelRoleType): Promise<User[]> => {
  const usersFromApi =
    role === 'mods' ? await fetchMods(channelId) : await fetchVips(channelId);
  const userLogins = usersFromApi.map((user) => user.login);

  if (!userLogins.length) {
    return Promise.all([
      db.query(`UPDATE users SET updated=CURRENT_TIMESTAMP WHERE id=?`, [channelId]),
      db.query(`DELETE FROM ${role} WHERE channel_id=?`, [channelId])
    ]);
  }

  await getUsers(userLogins);
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
    const grantedDateString = new Date(user.granted as string)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    await db.query(
      `INSERT INTO ${role} (user_id, channel_id, granted) VALUES (?, ?, ?)`,
      [user.id, id, grantedDateString]
    );
  }
};
