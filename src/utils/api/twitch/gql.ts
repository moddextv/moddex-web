import { ChannelRoleType, User } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { config } from '@/config';
import { splitArray } from '@/utils/utils';

const gqlQuery = async (body: string): Promise<any> => {
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
    await logger.db('gql-error', JSON.stringify(e));
    return [];
  }
};

export const fetchUsers = async (identifiers: string[], type: string = 'id'): Promise<User[]> => {
  const chunkedIds = splitArray(identifiers, 50);

  const users = await Promise.all(chunkedIds.map(async chunk => {
    const operations = chunk.map(identifier => `
      user_${identifier}: user(${type}: "${identifier}") {
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

    const response = await gqlQuery(JSON.stringify({
      query: `query { ${operations} }`
    }));

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
  return await fetchUsers(userIds);
};

export const fetchUsersByLogin = async (usernames: string[]): Promise<User[]> => {
  return await fetchUsers(usernames, 'login');
};


export const fetchMods = async (channelId: string): Promise<User[]> => {
  return fetchRoles(channelId, 'mods');
};

export const fetchVips = async (channelId: string): Promise<User[]> => {
  return fetchRoles(channelId, 'vips');
};

const fetchRoles = async (channelId: string, role: ChannelRoleType): Promise<User[]> => {
  const users: User[] = [];
  let cursor = '';
  let hasNextPage = true;

  while (hasNextPage) {
    const response: GqlRoleData = await gqlQuery(JSON.stringify({
      query: `query {
        user(id: "${channelId}") {
          ${role}(first: 100, after: "${cursor}") {
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
      }`
    }));

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
    artists?: {
      edges: GqlRoleDataEdge[];
      pageInfo: {
        hasNextPage: boolean;
        __typename: string;
      };
      __typename: string;
    };
  };
  extensions: {
    durationMilliseconds: number;
    operationName: string;
    requestID: string;
  };
}
