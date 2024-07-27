import { db } from '@/misc/Database';
import { TwitchUser, User, UserBadgeRow } from '@/misc/Interfaces';
import { getUsersFromHelix } from '@/utils/api/twitch/helix';
import { addBadgeByNameToUser, getUserBadges, removeBadgeByNameFromUser } from '@/utils/badges';

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

export const getUser = async (username: string = ''): Promise<User | false> => {
  const users: User[] = await getUsers([username]);
  return users.length ? users[0] : false;
};

export const getUsers = async (
  usernames: string[] = [],
  forceReload: boolean = false
): Promise<User[]> => {
  let usersFromDB: User[] = [];

  if (!forceReload) {
    usersFromDB = await getUsersFromDb(usernames);
  }

  const newUsernames: string[] = usernames.filter(username => !usersFromDB.find(u => u.login === username));
  if (!newUsernames.length) {
    for (const user of usersFromDB) {
      user.badges = await getUserBadges(user.id);
    }
    return usersFromDB;
  }

  const users: TwitchUser[] = await getUsersFromHelix(newUsernames);
  const updatedUsers: User[] = await Promise.all(users.map(updateUserInDb));

  return [...usersFromDB, ...updatedUsers];
};

const updateUserInDb = async (user: TwitchUser): Promise<User> => {
  await db.query(
    'INSERT INTO users (id, login, name, avatar, bio, created) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = VALUES(id)',
    [
      user.id,
      user.login,
      user.display_name,
      user.profile_image_url,
      user.description,
      new Date(user.created_at).toISOString().slice(0, 19).replace('T', ' ')
    ]
  );

  if (user.broadcaster_type === 'partner') {
    await Promise.all([
      addBadgeByNameToUser(user.id, 'partner'),
      removeBadgeByNameFromUser(user.id, 'affiliate')
    ]);
  } else if (user.broadcaster_type === 'affiliate') {
    await Promise.all([
      addBadgeByNameToUser(user.id, 'affiliate'),
      removeBadgeByNameFromUser(user.id, 'partner')
    ]);
  }

  if (user.type === 'staff') {
    await addBadgeByNameToUser(user.id, 'staff');
  }

  const [storedUser, badgesForUser] = await Promise.all([
    db.queryOne('SELECT updated FROM users WHERE id=?', [user.id]),
    getUserBadges(user.id)
  ]);

  return {
    id: user.id,
    login: user.login,
    name: user.display_name,
    avatar: user.profile_image_url,
    bio: user.description,
    created: user.created_at,
    updated: storedUser.updated,
    discord: null,
    badges: badgesForUser
  };
};

export const getUsersFromDb = async (usernames: string[]): Promise<User[]> => {
  const userList: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.bio, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        dc.discord_user_id AS discord
      FROM users u 
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id 
      LEFT JOIN badges b 
        ON ub.badge_id = b.id
      LEFT JOIN dctwitchusers dc
        ON dc.twitch_id = u.id
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
  const userList: UserBadgeRow[] = await db.query(
    `
      SELECT 
        u.id, u.login, u.name, u.avatar, u.bio, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        dc.discord_user_id AS discord
      FROM users u 
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id 
      LEFT JOIN badges b 
        ON ub.badge_id = b.id 
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
        u.id, u.login, u.name, u.avatar, u.bio, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        dc.discord_user_id AS discord
      FROM users u
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id
      LEFT JOIN badges b 
        ON ub.badge_id = b.id 
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
        u.id, u.login, u.name, u.avatar, u.bio, u.created, u.updated, u.ignored,
        b.id AS badge_id, b.name AS badge_name, b.path AS badge_path,
        dc.discord_user_id AS discord
      FROM users u
      LEFT JOIN user_badges ub
        ON u.id = ub.user_id
      LEFT JOIN badges b 
        ON ub.badge_id = b.id 
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

export const formatUsers = (
  entities: UserBadgeRow[],
  isRole: boolean = false
): User[] => {
  const results = new Map();

  entities.forEach((entity) => {
    if (!results.get(entity.id)) {
      const newUser: User = {
        id: entity.id,
        login: entity.login,
        name: entity.name,
        avatar: entity.avatar,
        discord: entity.discord,
        ignored: entity.ignored,
        badges: []
      };

      if (isRole) {
        newUser.granted = entity.granted;
      } else {
        newUser.bio = entity.bio;
        newUser.created = entity.created;
        newUser.updated = entity.updated;
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

export const filterUsers = (users: User[]): User[] => {
  const filteredUsers = users.filter((user) => !user.ignored);

  return filteredUsers.map((user) => {
    const { ignored, ...rest } = user;
    return rest;
  });
};
