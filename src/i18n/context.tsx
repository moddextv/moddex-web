'use client';

import { createContext, FC, ReactNode, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, Locale, localePath } from './locales';
import { Dictionary, translator, Translator, Vars } from './translate';

interface I18nValue {
  locale: Locale;
  t: Translator;
  path: (to: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  fallback: Dictionary;
  children: ReactNode;
}

export const I18nProvider: FC<I18nProviderProps> = ({ locale, dictionary, fallback, children }) => {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: translator(locale, dictionary, fallback),
      path: (to: string) => localePath(locale, to)
    }),
    [locale, dictionary, fallback]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nValue => {
  const value = useContext(I18nContext);

  if (!value) throw new Error('useI18n needs an I18nProvider above it');

  return value;
};

export const useT = (): Translator => useI18n().t;

export const useLocale = (): Locale => useI18n().locale;

export type { Vars };
export { DEFAULT_LOCALE };
