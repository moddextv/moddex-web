/** The chat mark at FrankerFaceZ's three densities: 18, 36 and 72 pixels. */
export type ChatUrls = { 1: string; 2: string; 4: string };

/**
 * A badge as it hangs off an account. `slug` is the stable key and `name` is
 * display text somebody may reword, so anything that matches, matches on slug.
 */
export interface Badge {
  id: number;
  slug: string;
  name: string;
  svg: string;
}

export interface BadgesProps {
  badges?: Badge[];
  size?: number;
  className?: string;
}

/**
 * What `GET /v1/badges` answers, which is NOT the badge that rides on a user.
 * The catalogue carries both drawings and no top-level `svg`; the lean one
 * carries `svg` and nothing else. Confusing the two is what broke `/dashboard`.
 *
 * The admin endpoints key on `name` — `WHERE name = ?` — so a grant, a revoke
 * and a count all speak `name` while the artwork comes from `slug`.
 */
export interface BadgeCatalogueEntry {
  id: number;
  slug: string;
  name: string;
  chatName: string | null;
  order: number | null;
  wearable: boolean;
  images: {
    icon: { svg: string; png: string };
    chat: ChatUrls;
  };
}

export interface ChatBadge {
  slug: string;
  name: string;
  images: ChatUrls;
}

export interface UserChatBadges {
  available: ChatBadge[];
  selected: string;
}

export const NO_CHAT_BADGE: ChatUrls = { 1: '', 2: '', 4: '' };

// the previews draw at 18-20px, so 2x is the one that is sharp on a retina screen
export const chatBadgeSrc = (badge: ChatBadge): string => badge.images[2];
