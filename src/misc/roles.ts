/**
 * the role registry — the single place a role is defined.
 *
 * the old design had one table per role (`mods`, `vips`) and hardcoded the two
 * names across 15 files. adding founder and artist that way means four tables,
 * four query paths, four api endpoints and four sets of ui strings. here a role
 * is one row in this object plus one enum value in the database.
 *
 * `id` is what goes in the database. NEVER renumber these — the values are
 * stored in millions of rows. append new roles with the next free integer.
 */
export const ROLES = {
  mod: {
    id: 1,
    /** what twitch's graphql connection is called on the user type */
    gqlField: 'mods',
    /** how the channel page labels it: "who mods for this channel" */
    channelLabel: 'mods',
    /** how the user page labels it: "where does this person mod" */
    userLabel: 'modding',
    colour: '#4ADE80',
    tailwind: 'mod',
    /** which corner of the mark this role takes */
    corner: 'tl'
  },
  vip: {
    id: 2,
    gqlField: 'vips',
    channelLabel: 'vips',
    userLabel: 'viping',
    colour: '#F472B6',
    tailwind: 'vip',
    corner: 'br'
  },
  artist: {
    id: 3,
    // the GqlRoleData interface in utils/api/twitch/gql.ts already declares an
    // `artists` connection alongside mods/vips, so this fetches the same way.
    gqlField: 'artists',
    channelLabel: 'artists',
    userLabel: 'arting',
    colour: '#60A5FA',
    tailwind: 'artist',
    corner: 'tr'
  },
  founder: {
    id: 4,
    // UNVERIFIED: unlike artists, no `founders` connection appears in the gql
    // response shape the code already models. on twitch a founder is a
    // *subscriber* badge (one of a channel's first subscribers), not a
    // moderation role, so it may not be exposed on the user type at all.
    // confirm before building the fetch path — the schema does not care either
    // way, this is purely about where the data comes from.
    gqlField: 'founders',
    channelLabel: 'founders',
    userLabel: 'founding',
    colour: '#FBBF24',
    tailwind: 'founder',
    corner: 'bl'
  }
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleId = (typeof ROLES)[RoleKey]['id'];

export const ROLE_KEYS = Object.keys(ROLES) as RoleKey[];

/** roles that are actually fetchable today — drives what the ui offers */
export const ACTIVE_ROLE_KEYS: RoleKey[] = ['mod', 'vip'];

export const roleById = (id: number): RoleKey | undefined =>
  ROLE_KEYS.find((key) => ROLES[key].id === id);

/** accepts either label form so existing routes and urls keep working */
export const roleByLabel = (label: string): RoleKey | undefined =>
  ROLE_KEYS.find(
    (key) => ROLES[key].channelLabel === label || ROLES[key].userLabel === label
  );

/** the two border classes that draw this role's corner of the mark */
export const cornerClasses: Record<(typeof ROLES)[RoleKey]['corner'], string> = {
  tl: 'border-b-0 border-r-0',
  br: 'border-t-0 border-l-0',
  tr: 'border-b-0 border-l-0',
  bl: 'border-t-0 border-r-0'
};
