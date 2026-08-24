import 'server-only';

import { logger } from '@/misc/Logger';
import { ShapeError, type Check } from '@/utils/api/shape';

const BASE = process.env.MODDEX_API_URL ?? 'https://api.moddex.tv';

const token = () => process.env.INTERNAL_API_TOKEN ?? '';

export class ModdexApiError extends Error {
  readonly detail: string;

  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
    readonly code: string = ''
  ) {
    super(`moddex-api ${status} on ${path}: ${message}`);
    this.name = 'ModdexApiError';
    this.detail = message;
  }
}

type Options = {
  authenticated?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  actor?: string;
  revalidate?: number;
  expect?: Check<unknown>;
};

export async function call<T>(path: string, options: Options = {}): Promise<T> {
  const { authenticated = false, method = 'GET', body, revalidate, actor, expect } = options;

  if (authenticated && !token()) {
    throw new ModdexApiError(0, path, 'INTERNAL_API_TOKEN is not set, see .env.example');
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token() ? { authorization: `Bearer ${token()}` } : {}),
      ...(actor ? { 'x-moddex-actor': actor } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    next: revalidate === undefined ? { revalidate: 0 } : { revalidate }
  });

  if (!res.ok) {
    // `code` is the api's stable slug and `message` is rewordable prose — branch
    // on the slug, never on the sentence
    const body = await res
      .json()
      .then((j) => ({ message: j?.message ?? j?.error ?? res.statusText, code: j?.error ?? '' }))
      .catch(() => ({ message: res.statusText, code: '' }));

    throw new ModdexApiError(res.status, path, String(body.message), String(body.code));
  }

  const payload = await res.json();

  if (expect) {
    try {
      expect(payload, '');
    } catch (error) {
      const detail = error instanceof ShapeError ? error.message : 'unreadable response';

      logger.error(`moddex-api sent a shape ${path} cannot use: ${detail}`);

      throw new ModdexApiError(502, path, detail, 'bad shape');
    }
  }

  return payload as T;
}

export const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value);
  }
  const string = search.toString();
  return string ? `?${string}` : '';
};

export const asParams = (params: object): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, value == null ? undefined : String(value)])
  );
