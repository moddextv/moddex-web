import { User } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { config } from '../../../../config';
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

export const fetchUsers = async (userIds: string[]): Promise<(User | false)[]> => {
  const chunkedUserIds = splitArray(userIds, 35);

  const users = await Promise.all(chunkedUserIds.map(async chunk => {
    const operations = chunk.map(id => `
      user_${id}: user(id: "${id}") {
        createdAt
        id
        login
        displayName
        description
        profileImageURL(width: 150)
        followers(first: 25) {
          totalCount
        }
      }
    `).join('\n');

    const response = await gqlQuery(JSON.stringify({
      query: `query { ${operations} }`
    }));

    if (!response?.data) return [];

    return Object.values(response.data).map((user: any) => {
      if (!user) return false;

      return {
        id: user.id,
        login: user.login,
        name: user.displayName,
        avatar: user.profileImageURL,
        bio: user.description,
        follower: user.followers?.totalCount || 0,
        badges: []
      };
    });
  }));

  return users.flat();
}

export const fetchMods = async (channelId: string): Promise<User[]> => {
  const mods: User[] = [];
  let cursor = '';
  let hasNextPage = true;

  while (hasNextPage) {
    const response: GqlRoleData = await gqlQuery(JSON.stringify({
      query: `query {
        user(id: "${channelId}") {
          mods(first: 100, after: "${cursor}") {
            edges {
              grantedAt,
              cursor,
              node {
                login,
                displayName,
                id,
                profileImageURL(width: 300)
              }
            },
            pageInfo {
              hasNextPage
            }
          }
        }
      }`
    }));

    const edges: GqlRoleDataEdge[] = response?.data?.user?.mods?.edges || [];
    hasNextPage = response?.data?.user?.mods?.pageInfo?.hasNextPage || false;
    cursor = hasNextPage ? edges[edges.length - 1]?.cursor : '';

    edges.forEach(edge => {
      if (edge.node) {
        mods.push({
          id: edge.node.id,
          login: edge.node.login,
          name: edge.node.displayName,
          avatar: edge.node.profileImageURL,
          follower: edge.node.followers?.totalCount || 0,
          granted: edge.grantedAt,
          badges: []
        });
      }
    });
  }

  return mods;
};

export const fetchVips = async (channelId: string): Promise<User[]> => {
  const vips: User[] = [];
  let cursor = '';
  let hasNextPage = true;

  while (hasNextPage) {
    const response: GqlRoleData = await gqlQuery(JSON.stringify({
      query: `query {
        user(id: "${channelId}") {
          vips(first: 100, after: "${cursor}") {
            edges {
              grantedAt,
              cursor,
              node {
                login,
                displayName,
                id,
                profileImageURL(width: 300)
              }
            },
            pageInfo {
              hasNextPage
            }
          }
        }
      }`
    }));

    const edges: GqlRoleDataEdge[] = response?.data?.user?.vips?.edges || [];
    hasNextPage = response?.data?.user?.vips?.pageInfo?.hasNextPage || false;
    cursor = hasNextPage ? edges[edges.length - 1]?.cursor : '';

    edges.forEach(edge => {
      if (edge.node) {
        vips.push({
          id: edge.node.id,
          login: edge.node.login,
          name: edge.node.displayName,
          avatar: edge.node.profileImageURL,
          follower: edge.node.followers?.totalCount || 0,
          granted: edge.grantedAt,
          badges: []
        });
      }
    });
  }

  return vips;
};

interface GqlRoleDataEdge {
  cursor: string;
  grantedAt: string;
  node: {
    id: string;
    displayName: string;
    login: string;
    profileImageURL: string;
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
