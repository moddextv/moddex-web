import { arrayOf, bool, id, nullable, num, object, str } from '@/utils/api/shape';

export const userShape = object({ id, login: str, badges: arrayOf(object({})) });
const usersShape = arrayOf(userShape);

const roleUserShape = object({
  id,
  login: str,
  badges: arrayOf(object({})),
  grantedAt: nullable(str)
});
const roleUsersShape = arrayOf(roleUserShape);

export const badgesShape = arrayOf(object({ id: num, name: str, svg: str, webp: str }));

export const statsShape = object({
  channels: num,
  users: num,
  mods: num,
  vips: num,
  founders: nullable(num),
  takenAt: nullable(str)
});

export const historyShape = arrayOf(
  object({ day: str, channels: num, users: num, mods: num, vips: num, founders: nullable(num) })
);

export const rolePageShape = object({
  items: roleUsersShape,
  hasMore: bool,
  cursor: nullable(str),
  total: nullable(num)
});

export const suggestShape = object({ items: usersShape });

export const browsePageShape = object({
  items: arrayOf(object({ id, login: str, counts: object({ mod: num, vip: num }) })),
  hasMore: bool
});

export const leaderboardShape = object({
  role: str,
  computedAt: nullable(str),
  depth: num,
  of: nullable(num),
  items: arrayOf(
    object({
      place: num,
      count: num,
      id,
      login: str,
      name: nullable(str),
      avatar: nullable(str),
      bot: bool,
      badges: arrayOf(object({}))
    })
  ),
  limit: num,
  hasMore: bool,
  after: nullable(num)
});
