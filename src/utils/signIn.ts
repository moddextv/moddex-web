const RESUMES_HERE = '/donate';

export const signInOptions = (pathname: string): { redirectTo: string } | undefined =>
  pathname.startsWith(RESUMES_HERE) ? undefined : { redirectTo: '/settings' };
