export const SUGGEST_LIMIT = 8;

export const SUGGEST_DEBOUNCE_MS = 180;

export interface Suggestion {
  id: string;
  login: string;
  name: string | null;
  avatar: string | null;
  followers: number | null;
}
