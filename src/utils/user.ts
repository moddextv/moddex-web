'use server';

import { db } from '@/misc/Database';
import { User, UserBadgeRow } from '@/misc/Interfaces';
import { addBadgeByNameToUser, getUserBadges, getUserChatBadge, removeBadgeByNameFromUser } from '@/utils/badges';
import { fetchUsersById } from '@/utils/api/twitch/gql';
import { getUserId as getUserIdFromIvr } from '@/utils/api/twitch/helix';
import { logger } from '@/misc/Logger';

export const getUserPermission = async (
  userId: string = ''
): Promise<number> => {
  if (!userId) return 0;

  const user = await db.queryOne(
    `
    SELECT 
      b.permission
    FROM 
      user_badges ub
    JOIN 
      badges b ON ub.badge_id = b.id
    WHERE 
      ub.user_id=?
    ORDER BY 
      b.permission DESC
  `,
    [userId]
  );
  return user?.permission || 0;
};

export const getUser = async (userId: string = ''): Promise<User | false> => {
  const users: User[] = await getUsers([userId]);
  return users.length ? users[0] : false;
};

export const getUsers = async (
  userIds: string[] = [],
  forceReload: boolean = false
): Promise<User[]> => {
  let usersFromDB: User[] = [];

  if (!forceReload) {
    usersFromDB = await getUsersFromDbById(userIds);
  }

  const newUsers: string[] = userIds.filter(userId => !usersFromDB.find(u => u.id === userId));
  if (!newUsers.length) {
    for (const user of usersFromDB) {
      user.badges = await getUserBadges(user.id);
    }
    return usersFromDB;
  }

  logger.log(newUsers);

  const users: User[] = await fetchUsersById(newUsers);
  const updatedUsers: User[] = await Promise.all(users.map(updateUserInDb));

  return [...usersFromDB, ...updatedUsers];
};

const updateUserInDb = async (user: User): Promise<User> => {
  try {
    await db.query(
      'INSERT INTO users (id, login, name, avatar, bio, follower, created) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE login = VALUES(login), name = VALUES(name), avatar = VALUES(avatar), bio = VALUES(bio), follower = VALUES(follower)',
      [
        user.id,
        user.login,
        user.name,
        user.avatar,
        user.bio,
        user.follower,
        new Date(user.created as string).toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  } catch (e) {
    logger.error(`error in storeUsers - userId: ${user.id}, created: ${user.created} - `, e)
  }

  if (user.roles?.isPartner) {
    await Promise.all([
      addBadgeByNameToUser(user.id, 'partner'),
      removeBadgeByNameFromUser(user.id, 'affiliate')
    ]);
  } else if (user.roles?.isAffiliate) {
    await Promise.all([
      addBadgeByNameToUser(user.id, 'affiliate'),
      removeBadgeByNameFromUser(user.id, 'partner')
    ]);
  }

  if (user.roles?.isStaff) {
    await addBadgeByNameToUser(user.id, 'staff');
  }

  const [storedUser, discordUser, badgesForUser, chatBadge] = await Promise.all([
    db.queryOne('SELECT updated FROM users WHERE id=?', [user.id]),
    db.queryOne('SELECT discord_user_id FROM dctwitchusers WHERE twitch_id=?', [user.id]),
    getUserBadges(user.id),
    getUserChatBadge(user.id)
  ]);

  return {
    id: user.id,
    login: user.login,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    follower: user.follower,
    created: user.created,
    updated: storedUser.updated,
    discord: discordUser?.discord_user_id || null,
    badges: badgesForUser,
    chatBadge: chatBadge
  };
};

export const getUserId = async (login: string): Promise<string> => {
  const user = await db.queryOne(`SELECT id FROM users WHERE login=?`, [login]);
  if (user?.id) return user.id;

  return getUserIdFromIvr(login);
}

export const getUsersFromDb = async (usernames: string[]): Promise<User[]> => {
  if (!usernames.length) {
    return [];
  }

  const userList: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.bio, u.follower, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        cb.name as chat_badge_name, cb.path as chat_badge_path,
        dc.discord_user_id AS discord
      FROM users u 
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id 
      LEFT JOIN badges b 
        ON ub.badge_id = b.id
      LEFT JOIN dctwitchusers dc
        ON dc.twitch_id = u.id
      LEFT JOIN user_chat_badges ucb
        ON u.id = ucb.user_id 
      LEFT JOIN chat_badges cb 
        ON ucb.chat_badge_id = cb.id
      WHERE u.login
        IN (${new Array(usernames.length).fill('?').join(',')})
      ORDER BY
        b.order ASC
    `,
    [...usernames]
  );

  return formatUsers(userList);
};

export const getUsersFromDbById = async (ids: string[]): Promise<User[]> => {
  if (!ids.length) {
    return [];
  }

  const userList: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.bio, u.follower, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        cb.name as chat_badge_name, cb.path as chat_badge_path,
        dc.discord_user_id AS discord
      FROM users u 
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id 
      LEFT JOIN badges b 
        ON ub.badge_id = b.id 
      LEFT JOIN user_chat_badges ucb
        ON u.id = ucb.user_id 
      LEFT JOIN chat_badges cb 
        ON ucb.chat_badge_id = cb.id
      LEFT JOIN dctwitchusers dc
        ON dc.twitch_id = u.id
      WHERE u.id
        IN (${new Array(ids.length).fill('?').join(',')})
      ORDER BY
        b.order ASC
    `,
    [...ids]
  );

  return formatUsers(userList);
};

export const getUsersByBadgeId = async (badgeId: string): Promise<User[]> => {
  const userList: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.bio, u.follower, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        cb.name as chat_badge_name, cb.path as chat_badge_path,
        dc.discord_user_id AS discord
      FROM users u
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id
      LEFT JOIN badges b 
        ON ub.badge_id = b.id 
      LEFT JOIN user_chat_badges ucb
        ON u.id = ucb.user_id 
      LEFT JOIN chat_badges cb 
        ON ucb.chat_badge_id = cb.id
      LEFT JOIN dctwitchusers dc
        ON dc.twitch_id = u.id
      WHERE b.id = ?
      ORDER BY
        b.order ASC
    `,
    [badgeId]
  );

  return formatUsers(userList);
};

export const getUsersByBadgeName = async (
  badgeName: string
): Promise<User[]> => {
  const userList: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.bio, u.follower, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        cb.name as chat_badge_name, cb.path as chat_badge_path,
        dc.discord_user_id AS discord
      FROM users u
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id
      LEFT JOIN badges b 
        ON ub.badge_id = b.id
      LEFT JOIN user_chat_badges ucb
        ON u.id = ucb.user_id 
      LEFT JOIN chat_badges cb 
        ON ucb.chat_badge_id = cb.id
      LEFT JOIN dctwitchusers dc
        ON dc.twitch_id = u.id
      WHERE b.name = ?
      ORDER BY
        b.order ASC
    `,
    [badgeName]
  );

  return formatUsers(userList);
};

export const formatUsers = async (
  entities: UserBadgeRow[],
  isRole: boolean = false
): Promise<User[]> => {
  const results = new Map();

  entities.forEach((entity) => {
    if (!results.get(entity.id)) {
      const newUser: User = {
        id: entity.id,
        login: entity.login,
        name: entity.name,
        avatar: entity.avatar,
        follower: entity.follower,
        discord: entity.discord,
        ignored: entity.ignored,
        badges: [],
        chatBadge: null
      };

      if (isRole) {
        newUser.granted = entity.granted;
      } else {
        newUser.bio = entity.bio;
        newUser.created = entity.created;
        newUser.updated = entity.updated;
      }

      if (entity.chat_badge_name) {
        newUser.chatBadge = {
          name: entity.chat_badge_name,
          path: entity.chat_badge_path
        }
      }

      results.set(entity.id, newUser);
    }

    if (entity.badge_id) {
      results.get(entity.id).badges.push({
        id: entity.badge_id,
        name: entity.badge_name,
        path: entity.badge_path
      });
    }
  });

  return Array.from(results.values()) as User[];
};

export const filterUsers = async (users: User[]): Promise<User[]> => {
  const filteredUsers = users.filter((user) => !user.ignored);

  return filteredUsers.map((user) => {
    const { ignored, ...rest } = user;
    return rest;
  });
};
