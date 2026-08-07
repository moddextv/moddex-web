import 'server-only';

/**
 * Client for api.moddex.tv.
 *
 * This is what replaces moddex-web's own database connection. Everything it
 * asks for is served by moddex-api, which owns the database — the rule in
 * CLAUDE.md that the split exists to enforce.
 *
 * `import 'server-only'` above is load-bearing, not decorative. INTERNAL_API_
 * TOKEN can write as any user, and src/config.ts warns that it is "reachable
 * from client components, so it is bundled for the browser too" — which is
 * exactly why the token is read here from process.env and never added to
 * config. If anything ever imports this from a client component the build
 * fails, which is the outcome we want.
 */

const BASE = process.env.MODDEX_API_URL ?? 'https://api.moddex.tv';

/** Read per call, not at module scope, so a missing value fails loudly where it is used. */
const token = () => process.env.INTERNAL_API_TOKEN ?? '';

export class ModdexApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    message: string
  ) {
    super(`moddex-api ${status} on ${path}: ${message}`);
    this.name = 'ModdexApiError';
  }
}

type Options = {
  /**
   * Whether this endpoint *requires* the token — donation figures and every
   * write. It no longer controls whether the header is sent: the token now
   * goes on every call, authenticated or not. See the note in `call` below.
   */
  authenticated?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /**
   * Seconds to cache. Defaults to no caching: role lists change when a channel
   * is rescraped, and a stale mod list is worse than a slow one. Pass a number
   * for the handful of things that genuinely are stable.
   */
  revalidate?: number;
};

async function call<T>(path: string, options: Options = {}): Promise<T> {
  const { authenticated = false, method = 'GET', body, revalidate } = options;

  if (authenticated && !token()) {
    throw new ModdexApiError(
      0,
      path,
      'INTERNAL_API_TOKEN is not set — see .env.example'
    );
  }

  /**
   * The token goes on every call, not only the guarded ones.
   *
   * moddex-api rate limits per IP, and this app renders every page server-side
   * — so all of moddex.tv's traffic reaches the api from a single address and
   * would be the first thing throttled. The limiter exempts callers holding
   * this token; sending it on reads is what identifies us as one.
   *
   * It costs nothing in exposure: the header goes to our own api over TLS from
   * a module that is `server-only`, and a read endpoint that does not check the
   * token simply ignores it.
   */
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token() ? { authorization: `Bearer ${token()}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    next: revalidate === undefined ? { revalidate: 0 } : { revalidate }
  });

  if (!res.ok) {
    // the api returns { error, status, message } for every failure, so one
    // shape covers all of them
    const detail = await res
      .json()
      .then((j) => j?.message ?? j?.error ?? res.statusText)
      .catch(() => res.statusText);

    throw new ModdexApiError(res.status, path, String(detail));
  }

  return (await res.json()) as T;
}

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value);
  }
  const string = search.toString();
  return string ? `?${string}` : '';
};

/* ------------------------------------------------------------------ reads */

export const getRole = <T>(
  role: 'mods' | 'vips' | 'founders',
  params: Record<string, string | undefined>
) => call<T>(`/v1/${role}${query(params)}`);

/** `login=` and `id=` both accept a comma-separated list. */
export const getUsers = <T>(params: Record<string, string | undefined>) =>
  call<T>(`/v1/users${query(params)}`);

/**
 * Whether a user has opted out. Guarded, and for the same reason the flag is
 * stripped from every public role list: who has opted out is exactly what the
 * setting exists to keep private.
 */
export const getUserIgnored = (userId: string) =>
  call<{ userId: string; ignored: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/ignored`,
    { authenticated: true }
  );

/** Staff level, for the session. Guarded — open, it would be a staff list. */
export const getUserPermissionLevel = (userId: string) =>
  call<{ userId: string; permission: number }>(
    `/v1/users/${encodeURIComponent(userId)}/permission`,
    { authenticated: true }
  );

export const getBadges = <T>(params: Record<string, string | undefined> = {}) =>
  call<T>(`/v1/badges${query(params)}`);

export const getChatBadges = <T>() => call<T>('/v1/chatBadges');

/**
 * The one donation figure that is public, because the holder is already named
 * by the badge they wear. Everything else about donations needs the token.
 */
export const getTopDonator = <T>() =>
  call<T | null>('/v1/donations/top-donator');

/** Requires the token: a donator badge plus an open total tells you how much. */
export const getUserDonationTotal = (userId: string) =>
  call<{
    userId: string;
    totalCents: number;
    payments: number;
    latest: string | null;
  }>(`/v1/donations${query({ userId })}`, { authenticated: true });

/**
 * The two browse lists. Both are pages, not bare arrays, because a browse
 * surface has to know whether there is another page.
 *
 * Cached for a minute. These are rankings over the whole index rather than an
 * answer about one channel, so a reader seeing a 60-second-old ordering is not
 * seeing anything wrong -- and the `roles` ordering reads a rollup that is
 * rebuilt daily anyway, so caching it for less than that is already generous.
 */
export const getChannels = <T>(params: Record<string, string | undefined>) =>
  call<T>(`/v1/channels${query(params)}`, { revalidate: 60 });

export const getAccounts = <T>(params: Record<string, string | undefined>) =>
  call<T>(`/v1/accounts${query(params)}`, { revalidate: 60 });

/** Homepage counters. Public, and raw — formatting is this app's job. */
export const getStats = () =>
  call<{
    channels: number;
    users: number;
    mods: number;
    vips: number;
    takenAt: string | null;
  }>('/v1/stats');

/**
 * What this user may wear in chat, and what they currently wear. Guarded: it
 * is the answer to "what has this person earned", which for the staff and
 * top-donator badges is a fact about them rather than about the site.
 */
export const getUserChatBadges = <T>(userId: string) =>
  call<{ userId: string; available: T; selected: string | null }>(
    `/v1/users/${encodeURIComponent(userId)}/chat-badges`,
    { authenticated: true }
  );

/* ----------------------------------------------------------------- writes */

/**
 * The caller must have derived `userId` from the session. The api cannot check
 * that — the token only says "this is moddex-web" — so passing a user id that
 * came from a request parameter would be a privilege escalation.
 */
export const setUserIgnored = (userId: string, ignored: boolean) =>
  call<{ userId: string; ignored: boolean; updated: boolean }>(
    `/v1/users/${encodeURIComponent(userId)}/ignored`,
    { authenticated: true, method: 'PATCH', body: { ignored } }
  );

/** `'none'` clears it. A badge the user has not earned comes back 403. */
export const setUserChatBadge = (userId: string, badge: string) =>
  call<{ userId: string; badge: string | null }>(
    `/v1/users/${encodeURIComponent(userId)}/chat-badge`,
    { authenticated: true, method: 'PUT', body: { badge } }
  );
