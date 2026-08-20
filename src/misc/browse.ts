import type { Account } from '@/misc/account';

export interface BrowseCounts {
  mod: number;
  vip: number;
  total: number;
}

export interface BrowseEntry extends Account {
  counts: BrowseCounts;
  updatedAt: string | null;
}

export interface BrowsePage {
  items: BrowseEntry[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

export type ChannelSort = 'read' | 'roles' | 'followers';
export type AccountSort = 'roles' | 'followers';
