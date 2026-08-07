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
    /** the two headings a list of this role gets, one per lookup direction */
    channelTitle: 'Moderators',
    userTitle: 'Moderating',
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
    channelTitle: 'VIPs',
    userTitle: 'Holding VIP',
    colour: '#F472B6',
    tailwind: 'vip',
    corner: 'br'
  },
  artist: {
    id: 3,
    // NOT fetchable *through the public unauthenticated surface* -- but it is
    // obtainable. roles.tv publishes 2,197,197 artists, so a source exists and
    // the note below is a statement about the endpoint tried, not about twitch.
    // Ask them, or capture the Roles Manager request from a broadcaster session.
    //
    // verified against gql.twitch.tv on 2026-08-06:
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
    channelTitle: 'Artists',
    userTitle: 'Holding artist',
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
    channelTitle: 'Founders',
    userTitle: 'Founding',
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

/**
 * the class that draws this role's corner of the mark, and the class that
 * colours it. spelled out rather than built from `ROLES[key].corner` and
 * `.tailwind`, because tailwind reads these files as text: `text-${role}` is
 * a class it never sees and therefore never emits.
 */
export const roleCornerClass: Record<RoleKey, string> = {
  mod: 'corner-tl',
  vip: 'corner-br',
  artist: 'corner-tr',
  founder: 'corner-bl'
};

export const roleTextClass: Record<RoleKey, string> = {
  mod: 'text-mod',
  vip: 'text-vip',
  artist: 'text-artist',
  founder: 'text-founder'
};
