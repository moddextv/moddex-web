const MAX_MARKS_PER_BASE = 2;

const STACKED = new RegExp(`\\p{Mn}{${MAX_MARKS_PER_BASE + 1}}`, 'u');
const OVER_ALLOWANCE = new RegExp(`(\\p{Mn}{${MAX_MARKS_PER_BASE}})\\p{Mn}+`, 'gu');

export const tameCombiningMarks = (text: string): string => {
  if (!text) return text;

  if (!STACKED.test(text)) return text;

  return text.replace(OVER_ALLOWANCE, '$1');
};

export const displayBio = (bio: string | null | undefined, maxLength = 300): string => {
  if (!bio) return '';

  const tamed = tameCombiningMarks(bio).trim();

  return tamed.length > maxLength ? `${tamed.slice(0, maxLength - 1)}…` : tamed;
};
