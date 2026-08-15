import 'server-only';

import { cache } from 'react';

import { fetchUserListPage } from '@/actions/roleList';
import { logger } from '@/misc/Logger';
import { PAGE_SIZE, type RolePage } from '@/misc/roleList';
import type { RoleType, UserType } from '@/misc/roles';

export type Seed = Record<string, RolePage | undefined>;

export const seedRoleLists = cache(
  async (userId: string, type: UserType, roles: readonly RoleType[]): Promise<Seed> => {
    const pages = await Promise.all(
      roles.map(async (role) => {
        try {
          const page = await fetchUserListPage(userId, type, role, {
            limit: PAGE_SIZE,
            sort: 'granted',
            dir: 'desc'
          });

          return [role, page] as const;
        } catch (error) {
          logger.warn(`could not seed the ${role} list for ${userId}`, error);

          return [role, undefined] as const;
        }
      })
    );

    return Object.fromEntries(pages);
  }
);

export const isEmpty = (seed: Seed): boolean =>
  Object.values(seed).every((page) => (page?.items.length ?? 0) === 0);
