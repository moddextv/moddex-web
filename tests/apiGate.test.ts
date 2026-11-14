import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Gate } from '../src/utils/api/moddex/gate';

vi.mock('@/misc/Logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() }
}));

let client: typeof import('../src/utils/api/moddex/client');
let seed: typeof import('../src/utils/roleSeed');

beforeAll(async () => {
  client = await import('../src/utils/api/moddex/client');
  seed = await import('../src/utils/roleSeed');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

describe('the gate', () => {
  it('admits up to its limit at once', async () => {
    const gate = new Gate(2, 0);

    expect(await gate.acquire(10)).toBeTypeOf('function');
    expect(await gate.acquire(10)).toBeTypeOf('function');
    expect(await gate.acquire(10)).toBeNull();
  });

  it('hands a released slot to the next in line', async () => {
    const gate = new Gate(1, 1);
    const first = await gate.acquire(10);
    const second = gate.acquire(1000);

    first!();

    expect(await second).toBeTypeOf('function');
    expect(gate.load).toEqual({ active: 1, waiting: 0 });
  });

  it('turns a waiter away after waitMs and forgets it', async () => {
    vi.useFakeTimers();
    const gate = new Gate(1, 1);
    await gate.acquire(10);
    const waiting = gate.acquire(50);

    vi.advanceTimersByTime(50);

    expect(await waiting).toBeNull();
    expect(gate.load).toEqual({ active: 1, waiting: 0 });
  });

  it('refuses at once when the queue is full', async () => {
    const gate = new Gate(1, 1);
    await gate.acquire(10);
    void gate.acquire(1000);

    expect(await gate.acquire(1000)).toBeNull();
  });

  it('ignores a second release of the same slot', async () => {
    const gate = new Gate(1, 0);
    const release = (await gate.acquire(10))!;

    release();
    release();

    expect(gate.load.active).toBe(0);
  });
});

describe('the api client under load', () => {
  it('answers 503 busy instead of queueing without bound', async () => {
    const pending: Array<(r: Response) => void> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>((resolve) => pending.push(resolve)))
    );

    const { limit, queue } = client.reads;
    const held = Array.from({ length: limit + queue }, () => client.call('/v1/x'));

    await expect(client.call('/v1/x')).rejects.toMatchObject({ status: 503, code: 'busy' });

    for (let i = 0; i < limit + queue; i++) {
      await vi.waitFor(() => expect(pending.length).toBeGreaterThan(i));
      pending[i]!(ok());
    }
    await Promise.all(held);

    expect(client.reads.load).toEqual({ active: 0, waiting: 0 });
  });

  it('turns a timed-out read into a 504 and frees its slot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new DOMException('slow', 'TimeoutError')))
    );

    await expect(client.call('/v1/x')).rejects.toMatchObject({ status: 504, code: 'timeout' });
    expect(client.reads.load.active).toBe(0);
  });

  it('never gates or times out a mutation', async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => ok());
    vi.stubGlobal('fetch', fetch);

    await client.call('/v1/x', { method: 'POST', body: {} });

    expect(fetch.mock.calls[0]![1]).toMatchObject({ signal: undefined });
  });
});

describe('a seed that failed to load', () => {
  const page = (n: number) => ({
    items: Array(n).fill({}),
    hasMore: false,
    cursor: null,
    total: null
  });

  it('is not an empty profile, so it never earns noindex', () => {
    expect(seed.isEmpty({ mods: undefined, vips: page(0) })).toBe(false);
  });

  it('leaves a genuinely empty profile empty', () => {
    expect(seed.isEmpty({ mods: page(0), vips: page(0) })).toBe(true);
  });
});
