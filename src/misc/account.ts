import type { Badge, ChatBadge } from '@/misc/badges';
import type { RoleType, UserType } from '@/misc/roles';
import type { RolePage } from '@/misc/roleList';

export interface Banned {
  reason: string;
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
}

export interface RoleScale {
  count: number;
  rank: number | null;
  of: number | null;
}

export interface User extends Account {
  bio?: string | null;
  roles?: {
    isAffiliate: boolean;
    isPartner: boolean;
    isStaff?: boolean;
  } | null;
  discord?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  banned?: Banned | null;
  optedOut?: boolean;
}

export interface UserListProps {
  type: UserType;
  role: RoleType;
  user: Account;
  initial?: RolePage;
  tabbed?: boolean;
}
