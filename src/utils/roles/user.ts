import { db } from '@/misc/Database';
import { User, UserBadgeRow } from '@/misc/Interfaces';
import { formatUsers } from '@/utils/user';

export async function getUserMods(user: User): Promise<User[]> {
  const moddingChannels: UserBadgeRow[] = await db.query(
    `
			SELECT 
				u.id, u.name, u.login, u.avatar, u.ignored,
				m.granted, 
				b.id as badge_id, 
				b.name as badge_name, 
				b.path as badge_path 
			FROM users u 
			JOIN mods m ON u.id = m.channel_id 
			LEFT JOIN user_badges ub on u.id = ub.user_id 
			LEFT JOIN badges b on ub.badge_id = b.id 
			WHERE m.user_id = ? 
			ORDER BY m.granted DESC`,
    [user.id]
  );

  return formatUsers(moddingChannels, true) ?? [];
}

export async function getUserVips(user: User): Promise<User[]> {
  const vipedChannels: UserBadgeRow[] = await db.query(
    `
			SELECT 
				u.id, u.name, u.login, u.avatar, u.ignored,
				v.granted, 
				b.id as badge_id, 
				b.name as badge_name, 
				b.path as badge_path 
			FROM users u 
			JOIN vips v ON u.id = v.channel_id 
			LEFT JOIN user_badges ub on u.id = ub.user_id 
			LEFT JOIN badges b on ub.badge_id = b.id 
			WHERE v.user_id = ? 
			ORDER BY v.granted DESC`,
    [user.id]
  );

  return formatUsers(vipedChannels, true) ?? [];
}
