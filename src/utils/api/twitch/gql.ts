import { User } from '@/misc/Interfaces';

const gqlQuery = async (
  operationName: string,
  variables: any,
  extensions: any
): Promise<any> => {
  try {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        Origin: 'https://www.twitch.tv/',
        Referer: 'https://gql.twitch.tv/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0'
      },
      body: JSON.stringify([
        {
          operationName: operationName,
          variables: variables,
          extensions: extensions
        }
      ])
    });

    return await response.json();
  } catch (e) {
    return [];
  }
};

export const fetchMods = async (channelId: string): Promise<User[]> => {
  const variables = {
    channelID: channelId,
    includeEditors: false,
    includeArtists: false,
    includeMods: true,
    includeVIPs: false
  };

  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash:
        'dfe01a8ac494183d85cc9dbde2d808c35f7ffcfd2b3c12db4c7d2a57c2712121'
    }
  };

  const response: GqlRoleData[] = await gqlQuery(
    'UserRolesCacheQuery',
    variables,
    extensions
  );
  const edges: GqlRoleDataEdge[] = response?.[0]?.data?.user?.mods?.edges || [];
  if (!edges) return [];

  return edges
    .map(
      (edge) =>
        edge.node && {
          id: edge.node.id,
          login: edge.node.login,
          name: edge.node.displayName,
          avatar: edge.node.profileImageURL,
          granted: edge.grantedAt,
          badges: []
        }
    )
    .filter(Boolean);
};

export const fetchVips = async (channelId: string): Promise<User[]> => {
  const variables = {
    channelID: channelId,
    includeEditors: false,
    includeArtists: false,
    includeMods: false,
    includeVIPs: true
  };

  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash:
        'dfe01a8ac494183d85cc9dbde2d808c35f7ffcfd2b3c12db4c7d2a57c2712121'
    }
  };

  const response: GqlRoleData[] = await gqlQuery(
    'UserRolesCacheQuery',
    variables,
    extensions
  );
  const edges: GqlRoleDataEdge[] = response?.[0]?.data?.user?.vips?.edges || [];
  if (!edges) return [];

  return edges
    .map(
      (edge) =>
        edge.node && {
          id: edge.node.id,
          login: edge.node.login,
          name: edge.node.displayName,
          avatar: edge.node.profileImageURL,
          granted: edge.grantedAt,
          badges: []
        }
    )
    .filter(Boolean);
};

interface GqlRoleDataEdge {
  cursor: string;
  grantedAt: string;
  node: {
    id: string;
    displayName: string;
    login: string;
    profileImageURL: string;
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
