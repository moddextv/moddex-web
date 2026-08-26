import type { RoleUser } from '@/misc/account';

export const PAGE_SIZE = 100;

export interface RolePage {
  items: RoleUser[];
  hasMore: boolean;
  cursor: string | null;
  total: number | null;
}
