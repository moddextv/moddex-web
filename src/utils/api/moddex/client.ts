import 'server-only';

import { logger } from '@/misc/Logger';
import { Gate } from '@/utils/api/moddex/gate';
import { ShapeError, type Check } from '@/utils/api/shape';

const BASE = process.env.MODDEX_API_URL ?? 'https://api.moddex.tv';

const token = () => process.env.INTERNAL_API_TOKEN ?? '';

const READ_TIMEOUT_MS = 15_000;
const READ_WAIT_MS = 5_000;

export const reads = new Gate(32, 128);

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
  headers?: Record<string, string>;
};

export async function call<T>(path: string, options: Options = {}): Promise<T> {
  const {
    authenticated = false,
    method = 'GET',
    body,
    revalidate,
    actor,
    expect,
    headers: extra
  } = options;

  if (authenticated && !token()) {
    throw new ModdexApiError(0, path, 'INTERNAL_API_TOKEN is not set, see .env.example');
  }

  const read = method === 'GET';
  const release = read ? await reads.acquire(READ_WAIT_MS) : null;

  // a flood of profile views must fail fast, not pile up on the heap
  if (read && !release) throw new ModdexApiError(503, path, 'too busy', 'busy');

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token() ? { authorization: `Bearer ${token()}` } : {}),
        ...(actor ? { 'x-moddex-actor': actor } : {}),
        ...extra
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: read ? AbortSignal.timeout(READ_TIMEOUT_MS) : undefined,
      next: revalidate === undefined ? { revalidate: 0 } : { revalidate }
    });

    return await settle<T>(res, path, expect);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new ModdexApiError(504, path, 'timed out', 'timeout');
    }
    throw error;
  } finally {
    release?.();
  }
}

async function settle<T>(res: Response, path: string, expect?: Check<unknown>): Promise<T> {
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
