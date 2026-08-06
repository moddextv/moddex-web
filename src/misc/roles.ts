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
    // NOT FETCHABLE. verified against gql.twitch.tv on 2026-08-06:
    //   user(login:)    -> Cannot query field "artists" on type "User".
    //   channel(name:)  -> Cannot query field "artists" on type "Channel".
    // channelArtists / artistBadge / artistUsers are rejected too, and
    // introspection is disabled so the real name cannot be enumerated.
    //
    // the earlier note here claimed GqlRoleData already declared an `artists`
    // connection alongside mods/vips. it declared one as a sibling of `user`,
    // not a field on it, so fetchRoles' `data.user[role]` lookup would have
    // returned undefined -- an always-empty role with no error. that
    // declaration has been removed.
    //
    // twitch's artist badge is assigned in the Roles Manager, which is a
    // broadcaster-authenticated surface; expect a different (probably
    // persisted//hashed) operation rather than a public connection.
    gqlField: 'artists',
    channelLabel: 'artists',
    userLabel: 'arting',
    colour: '#60A5FA',
    tailwind: 'artist',
    corner: 'tr'
  },
  founder: {
    id: 4,
    // VERIFIED WORKING against gql.twitch.tv on 2026-08-06, but it does NOT
    // go through fetchRoles -- the shape is different in four ways:
    //
    //   query { channel(name: "<login>") {
    //     founderBadgeAvailability
    //     founders { entitlementStart isSubscribed
    //                user { id login displayName chatColor
    //                       profileImageURL(width: 600) } } } }
    //
    //   1. rooted at channel(name:), not user(id:)
    //   2. a plain list, not an edges/node connection
    //   3. no pagination at all -- no first/after/pageInfo/cursor
    //   4. the timestamp is `entitlementStart`, not `grantedAt`
    //
    // `isSubscribed` matters: a founder who lapses keeps the entitlement but
    // loses the badge, so the two are not the same question.
    // `founderBadgeAvailability` is the number of unclaimed slots left.
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
export const ACTIVE_ROLE_KEYS: RoleKey[] = ['mod', 'vip', 'founder'];

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
