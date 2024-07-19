import { db } from '@/misc/Database';
import { Badge } from '@/misc/Interfaces';

export const getAllBadges = async (): Promise<Badge[]> => {
  return await db.query('SELECT * FROM badges ORDER BY `order`');
};

export const getBadgeById = async (id: number): Promise<Badge | false> => {
  return await db.queryOne('SELECT * FROM badges WHERE id=?', [id]);
};

export const getBadgeByName = async (
  badgeName: string
): Promise<Badge | false> => {
  return await db.queryOne('SELECT * FROM badges WHERE name=?', [badgeName]);
};

export const addBadgeByIdToUser = async (
  userId: string,
  badgeId: number
): Promise<boolean> => {
  await db.query(
    'INSERT IGNORE INTO user_badges(user_id, badge_id) VALUES (?, ?)',
    [userId, badgeId]
  );
  return true;
};

export const removeBadgeByIdFromUser = async (
  userId: string,
  badgeId: number
): Promise<boolean> => {
  await db.query('DELETE FROM user_badges WHERE user_id=? AND badge_id=?', [
    userId,
    badgeId
  ]);
  return true;
};

export const addBadgeByNameToUser = async (
  userId: string,
  badgeName: string
): Promise<boolean> => {
  const badge: Badge | false = await getBadgeByName(badgeName);
  if (!badge) return false;

  return addBadgeByIdToUser(userId, badge.id);
};

export const removeBadgeByNameFromUser = async (
  userId: string,
  badgeName: string
): Promise<boolean> => {
  const badge: Badge | false = await getBadgeByName(badgeName);
  if (!badge) return false;

  await removeBadgeByIdFromUser(userId, badge.id);
  return true;
};

const fetchUserBadgesFromDB = async (
  userIds: string[] = []
): Promise<Badge[]> => {
  if (!userIds.length) {
    return await db.query(`
        SELECT 
          b.name, b.path
        FROM users u
          JOIN user_badges ub
            ON u.id = ub.user_id
          JOIN badges b
            ON ub.badge_id = b.id
        ORDER BY b.order
    `);
  }

  return await db.query(
    `
      SELECT 
        b.name, b.path
      FROM users u
        JOIN user_badges ub
          ON u.id = ub.user_id
        JOIN badges b
          ON ub.badge_id = b.id
      WHERE u.id
        IN (${new Array(userIds.length).fill('?').join(',')})
      ORDER BY b.order
    `,
    [...userIds]
  );
};

export const getUserBadges = async (userId: string = ''): Promise<Badge[]> => {
  let userIds: string[] = [];

  if (userId) {
    userIds = userId.split(',');
  }

  return await fetchUserBadgesFromDB(userIds);
};
