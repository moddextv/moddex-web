import { db } from '@/misc/Database';
import { User, UserBadgeRow } from '@/misc/Interfaces';
import { formatUsers } from '@/utils/user';

export async function getUserMods(user: User): Promise<User[]> {
  return getUserRoles(user.id, 'mods');
}

export async function getUserVips(user: User): Promise<User[]> {
  return getUserRoles(user.id, 'vips');
}

export async function getUserRoles(userId: string, role: string): Promise<User[]> {
  const channels: UserBadgeRow[] = await db.query(
      `
      SELECT 
        u.id, u.name, u.login, u.avatar, u.ignored,
        r.granted, 
        b.id AS badge_id, 
        b.name AS badge_name, 
        b.path AS badge_path 
      FROM 
        users u 
      JOIN ${role} r
        ON u.id = r.channel_id 
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id 
      LEFT JOIN badges b
        ON ub.badge_id = b.id 
      WHERE
        r.user_id = ? 
      ORDER BY
        r.granted DESC, b.order ASC`,
      [userId]
  );

  return formatUsers(channels, true) ?? [];
}