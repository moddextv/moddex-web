import { db } from '@/misc/Database';
import { User, UserBadgeRow } from '@/misc/Interfaces';
import { fetchMods, fetchVips } from '@/utils/api/twitch/gql';
import { formatUsers, getUsers } from '@/utils/user';

type Role = 'mods' | 'vips';

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
  role: Role,
  forceRefresh: boolean
): Promise<User[]> => {
  if (forceRefresh || !user.updated) {
    return await getAndStoreUsers(user.id, role);
  }

  return getStoredUsers(user.id, role);
};

const getAndStoreUsers = async (id: string, role: Role): Promise<User[]> => {
  const usersFromApi =
    role === 'mods' ? await fetchMods(id) : await fetchVips(id);
  const userLogins = usersFromApi.map((user) => user.login);

  await getUsers(userLogins);
  await storeUsers(id, usersFromApi, role);

  await db.query(`UPDATE users SET updated=CURRENT_TIMESTAMP WHERE id=?`, [id]);

  return getStoredUsers(id, role);
};

const getStoredUsers = async (id: string, role: Role): Promise<User[]> => {
  const usersFromDb: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.ignored,
        r.granted, 
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path 
      FROM 
        users u 
      JOIN ${role} r 
        ON u.id = r.user_id 
      LEFT JOIN user_badges ub 
        on u.id = ub.user_id 
      LEFT JOIN badges b 
        on ub.badge_id = b.id 
      WHERE 
        r.channel_id = ? 
      ORDER BY 
        r.granted DESC, b.order ASC
    `,
    [id]
  );

  return formatUsers(usersFromDb, true);
};

const storeUsers = async (id: string, users: User[], role: Role) => {
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
