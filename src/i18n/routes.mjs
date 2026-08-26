/**
 * Every top-level path that carries a locale, listed rather than excluded.
 *
 * A negative lookahead would be shorter and is exactly how the visitor counter
 * was lost once: a matcher meant to exclude something quietly caught the collect
 * endpoint, and the failure was invisible because the script still loaded. This
 * list cannot reach /insights, /api, /health, or any metadata file, because it
 * never mentions them. tests/localeRouting.test.ts pins that.
 *
 * A .mjs because next.config.mjs cannot import TypeScript, and both it and
 * src/i18n/locales.ts have to read the same table or the urls disagree.
 */
export const LOCALIZED_SEGMENTS = [
  'about',
  'c',
  'channel',
  'dashboard',
  'design',
  'donate',
  'leaderboard',
  'privacy',
  'settings',
  'tos',
  'u',
  'user'
];

/**
 * What a route is called in a language that has its own word for it. A segment
 * missing here keeps its english name in every language, and that is a decision
 * per route rather than an omission:
 *
 *   c, u          the short links people paste into chat. they are short on
 *                 purpose and the same in every language
 *   dashboard     signed in, team only, and never linked publicly
 *   design        internal, noindex
 *   settings      signed in
 *   privacy, tos  the contract, english whatever you read it in. a translated
 *                 slug would promise a translation the page does not have
 *
 * Only the first segment translates. `/de/kanal/page/2` is deliberate: the
 * deeper segments are paging and usernames, which nobody types.
 */
export const ROUTE_SLUGS = {
  about: { de: 'ueber-moddex', fr: 'a-propos' },
  channel: { de: 'kanal', fr: 'chaine' },
  donate: { de: 'spenden', fr: 'don' },
  leaderboard: { de: 'rangliste', fr: 'classement' },
  user: { de: 'account', fr: 'compte' }
};

export const slugFor = (locale, segment) => ROUTE_SLUGS[segment]?.[locale] ?? segment;

export const routeFor = (locale, slug) => {
  for (const [route, byLocale] of Object.entries(ROUTE_SLUGS)) {
    if (byLocale[locale] === slug) return route;
  }

  return slug;
};
