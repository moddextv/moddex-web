import { ChannelRoleType, User } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { config } from '@/config';
import { splitArray } from '@/utils/utils';
import { db } from '@/misc/Database';
import { updateUserInDb } from '@/utils/user';

const gqlQuery = async (
  query: string,
  variables: Record<string, unknown> = {}
): Promise<any> => {
  const body = JSON.stringify({ query, variables });

  try {
    return fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US',
        'Client-ID': config.twitchClientId,
        'Client-Version': '7f3e84e3-9bb1-4c29-aab5-c83c4a3f8995',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        'Referer': 'https://www.twitch.tv/',
        'Content-Type': 'application/json'
      },
      body
    }).then(res => res.json());
  } catch (e) {
    logger.error(`gql-error: ${e}`);
    return [];
  }
};

export const fetchUsers = async (identifiers: string[], type: 'id' | 'login' = 'login'): Promise<User[]> => {
  const chunkedIds = splitArray(identifiers, 50);

  const gqlType = type === 'id' ? 'ID' : 'String';

  const users = await Promise.all(chunkedIds.map(async chunk => {
    // aliases and variable names are positional, so no caller-controlled value
    // is ever interpolated into the query document itself.
    const variableDefinitions = chunk
      .map((_, index) => `$v${index}: ${gqlType}`)
      .join(', ');

    const operations = chunk.map((_, index) => `
      user_${index}: user(${type}: $v${index}) {
        id
        login
        displayName
        description
        createdAt
        profileImageURL(width: 150)
        roles {
          isAffiliate,
          isPartner,
          isStaff
        }
        followers(first: 1) {
          totalCount
        }
      }
    `).join('\n');

    const variables = Object.fromEntries(
      chunk.map((identifier, index) => [`v${index}`, identifier])
    );

    const response = await gqlQuery(
      `query BulkUsers(${variableDefinitions}) { ${operations} }`,
      variables
    );

    if (!response?.data) return [];

    return Object.values(response.data).map((user: any) => {
      if (!user) return [];

      return {
        id: user.id,
        login: user.login,
        name: user.displayName,
        bio: user.description,
        avatar: user.profileImageURL,
        roles: user.roles,
        follower: user.followers?.totalCount || 0,
        created: user.createdAt,
        badges: [],
        chatBadge: null
      } as User;
    }).filter(Boolean);
  }));

  return users.flat() as User[];
};

export const fetchUsersById = async (userIds: string[]): Promise<User[]> => {
  // fetchUsers defaults to type 'login'. omitting 'id' here meant this looked
  // up `user(login: "28005230")` and found nothing, so getUsers() never created
  // users it had not seen and storeUsers() then failed the foreign key. in
  // production that is invisible -- `users` already holds millions of rows, so
  // almost every mod or vip is already present -- but any genuinely new user
  // was silently dropped, and on a fresh database nothing stored at all.
  return await fetchUsers(userIds, 'id');
};

export const fetchUsersByLogin = async (usernames: string[]): Promise<User[]> => {
  return await fetchUsers(usernames, 'login');
};

export const fetchUserOrBanned = async (username: string): Promise<User | string> => {
  const response = await gqlQuery(
    `query UserOrBanned($login: String!) {
      user: userResultByLogin(login: $login) {
        ... on User {
          createdAt
          id
          login
          displayName
          description
          profileImageURL(width: 150)
          deletedAt
          followers {
            totalCount
          }
        }
        ... on UserDoesNotExist {
          reason
        }
      }
    }`,
    { login: username }
  );

  const rawUser = response?.data?.user;

  if (!rawUser) return '';

  if (rawUser.reason) {
    if (rawUser.reason === 'UNKNOWN') return '';
    await db.query(`UPDATE users SET banned=? WHERE login=?`, [
      rawUser.reason,
      username
    ]);
    return rawUser.reason;
  }

  const user = {
    id: rawUser.id,
    login: rawUser.login,
    name: rawUser.displayName,
    bio: rawUser.description,
    avatar: rawUser.profileImageURL,
    roles: rawUser.roles,
    follower: rawUser.followers?.totalCount ?? 0,
    created: rawUser.createdAt,
    badges: [],
    chatBadge: null
  } as User;

  await updateUserInDb(user);

  return user;
};

export const fetchMods = async (channelId: string): Promise<User[]> => {
  return fetchRoles(channelId, 'mods');
};

export const fetchVips = async (channelId: string): Promise<User[]> => {
  return fetchRoles(channelId, 'vips');
};

/**
 * founders do not go through fetchRoles. the connection is shaped differently
 * in four ways, all verified against gql.twitch.tv on 2026-08-06:
 *
 *   1. rooted at `channel(name:)`, so this takes a LOGIN, not an id
 *   2. a plain list, not an edges/node connection
 *   3. no pagination -- no first/after/cursor/pageInfo. twitch caps the badge
 *      per channel, so the whole set arrives in one response
 *   4. the timestamp is `entitlementStart`, not `grantedAt`
 *
 * `isSubscribed` is deliberately not requested. a founder who lets their sub
 * lapse keeps the entitlement but loses the badge, and what this product
 * records is *when the role was granted* -- a permanent fact -- not whether it
 * is currently displayed.
 */
export const fetchFounders = async (channelLogin: string): Promise<User[]> => {
  const response = await gqlQuery(
    `query ChannelFounders($name: String!) {
      channel(name: $name) {
        founders {
          entitlementStart
          user {
            id
            login
            displayName
            description
            createdAt
            profileImageURL(width: 150)
            roles {
              isAffiliate,
              isPartner,
              isStaff
            }
            followers(first: 1) {
              totalCount
            }
          }
        }
      }
    }`,
    { name: channelLogin }
  );

  const founders = response?.data?.channel?.founders || [];

  return founders
    .filter((founder: GqlFounder) => founder?.user)
    .map((founder: GqlFounder) => ({
      id: founder.user.id,
      login: founder.user.login,
      name: founder.user.displayName,
      bio: founder.user.description,
      avatar: founder.user.profileImageURL,
      roles: founder.user.roles,
      follower: founder.user.followers?.totalCount || 0,
      banned: '',
      created: founder.user.createdAt,
      granted: founder.entitlementStart,
      badges: [],
      chatBadge: null
    })) as User[];
};

interface GqlFounder {
  entitlementStart: string;
  user: {
    id: string;
    login: string;
    displayName: string;
    description: string | null;
    createdAt: string;
    profileImageURL: string;
    roles: {
      isAffiliate: boolean;
      isPartner: boolean;
      isStaff: boolean;
    };
    followers: {
      totalCount: number;
    };
  };
}

/**
 * only the roles twitch exposes as a paginated connection on the `user` type.
 * `founders` is deliberately excluded -- it is a plain list under
 * `channel(name:)` and has its own fetcher. keeping this narrower than
 * ChannelRoleType means routing a non-connection role through here is a
 * compile error rather than a silently empty result.
 */
type PaginatedChannelRole = Extract<ChannelRoleType, 'mods' | 'vips'>;

const fetchRoles = async (channelId: string, role: PaginatedChannelRole): Promise<User[]> => {
  const users: User[] = [];
  let cursor = '';
  let hasNextPage = true;

  while (hasNextPage) {
    // `role` is a ChannelRoleType union, never caller-supplied; the id and
    // cursor are values and go through variables.
    const response: GqlRoleData = await gqlQuery(
      `query ChannelRoles($channelId: ID!, $cursor: Cursor) {
        user(id: $channelId) {
          ${role}(first: 100, after: $cursor) {
            edges {
              grantedAt,
              cursor,
              node {
                id
                login
                displayName
                description
                createdAt
                profileImageURL(width: 150)
                roles {
                  isAffiliate,
                  isPartner,
                  isStaff
                }
                followers(first: 1) {
                  totalCount
                }
              }
            },
            pageInfo {
              hasNextPage
            }
          }
        }
      }`,
      { channelId, cursor: cursor || null }
    );

    const edges: GqlRoleDataEdge[] = response?.data?.user?.[role]?.edges || [];
    hasNextPage = response?.data?.user?.[role]?.pageInfo?.hasNextPage || false;
    cursor = hasNextPage ? edges[edges.length - 1]?.cursor : '';

    edges.forEach(edge => {
      if (edge.node) {
        users.push({
          id: edge.node.id,
          login: edge.node.login,
          name: edge.node.displayName,
          bio: edge.node.description,
          avatar: edge.node.profileImageURL,
          roles: edge.node.roles,
          follower: edge.node.followers?.totalCount || 0,
          banned: '',
          created: edge.node.createdAt,
          granted: edge.grantedAt,
          badges: [],
          chatBadge: null
        });
      }
    });
  }

  return users;
};

interface GqlRoleDataEdge {
  cursor: string;
  grantedAt: string;
  node: {
    id: string;
    login: string;
    displayName: string;
    description: string | null;
    createdAt: string;
    profileImageURL: string;
    roles: {
      isAffiliate: boolean;
      isPartner: boolean;
      isStaff: boolean;
    };
    followers: {
      totalCount: number;
    };
    __typename: string;
  };
  __typename: string;
}

interface GqlRoleData {
  data: {
    user: {
      id: string;
      hasUnreadChangelogItems?: boolean;
      editors?: {
        edges: any[];
        pageInfo: {
          hasNextPage: boolean;
          __typename: string;
        };
        __typename: string;
      };
      mods?: {
        edges: GqlRoleDataEdge[];
        pageInfo: {
          hasNextPage: boolean;
          __typename: string;
        };
        __typename: string;
      };
      vips?: {
        edges: GqlRoleDataEdge[];
        pageInfo: {
          hasNextPage: boolean;
          __typename: string;
        };
        __typename: string;
      };
      __typename: string;
    };
    experiment?: {
      isInCommunityMomentsExperiment: boolean;
      __typename: string;
    };
    // there was an `artists` connection declared here, as a sibling of `user`
    // rather than a field on it. twitch rejects `artists` on both User and
    // Channel (verified 2026-08-06), so it described nothing real, and its
    // placement meant fetchRoles' `data.user[role]` lookup would have read
    // undefined and reported an empty role rather than an error. see the
    // artist entry in misc/roles.ts.
  };
  extensions: {
    durationMilliseconds: number;
    operationName: string;
    requestID: string;
  };
}
