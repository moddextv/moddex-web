import type { Badge, ChatBadge } from '@/misc/badges';
import type { RoleType, UserType } from '@/misc/roles';
import type { RolePage } from '@/misc/roleList';

interface Banned {
  reason: string;
}

export interface RoleScale {
  count: number;
  rank: number | null;
  of: number | null;
}

export interface Account {
  id: string;
  login: string;
  name: string | null;
  avatar: string | null;
  followers: number | null;
  badges: Badge[];
  chatBadge: ChatBadge | null;
  bot?: boolean;
}

export interface RoleUser extends Account {
  grantedAt: string | null;
  banned?: Banned | null;
}

export interface User extends Account {
  bio?: string | null;
  // the account axis only: counts, nightly ranks and the size of each scale
  roles?: Record<'mod' | 'vip' | 'founder' | 'total', RoleScale> | null;
  discord?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  banned?: Banned | null;
  optedOut?: boolean;
  connected?: boolean;
  reach?: number | null;
}

export interface UserListProps {
  type: UserType;
  role: RoleType;
  user: Account;
  initial?: RolePage;
  tabbed?: boolean;
}
