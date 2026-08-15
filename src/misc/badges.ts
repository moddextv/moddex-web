export interface Badge {
  id: number;
  name: string;
  svg: string;
  webp: string;
}

export interface BadgesProps {
  badges?: Badge[];
  size?: number;
  className?: string;
}

export type ChatBadge = Omit<Badge, 'id'>;

export interface UserChatBadges {
  available: ChatBadge[];
  selected: string;
}
