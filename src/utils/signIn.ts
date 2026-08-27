import { asLocale, localePath, stripLocale } from '@/i18n/locales';

const RESUMES_HERE = '/donate';

export const signInOptions = (pathname: string): { redirectTo: string } | undefined => {
  // a rendered pathname, so /de/spenden has to become /donate before it matches
  if (stripLocale(pathname).startsWith(RESUMES_HERE)) return undefined;

  return { redirectTo: localePath(asLocale(pathname.split('/')[1]), '/settings') };
};
