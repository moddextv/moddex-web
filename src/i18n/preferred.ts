import { isLocale, Locale } from './locales';

const CHOICE_KEY = 'moddex.locale';

// our chinese is traditional, so a simplified-chinese browser is not offered it
const TRADITIONAL = /-(tw|hk|mo|hant)(-|$)/;

// the first browser language we serve wins, so an english-first browser is never nagged
export const preferredLocale = (languages: readonly string[]): Locale | null => {
  for (const raw of languages) {
    const tag = raw.toLowerCase();
    const [primary] = tag.split('-');

    if (primary === 'zh') {
      if (TRADITIONAL.test(tag) && isLocale(primary)) return primary;
      continue;
    }

    if (isLocale(primary)) return primary;
  }

  return null;
};

export const readLocaleChoice = (): string | null => {
  try {
    return window.localStorage.getItem(CHOICE_KEY);
  } catch {
    return null;
  }
};

export const rememberLocale = (locale: Locale): void => {
  try {
    window.localStorage.setItem(CHOICE_KEY, locale);
  } catch {}
};
