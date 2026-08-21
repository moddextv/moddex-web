import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSuggestions = vi.fn();

vi.mock('@/utils/api/moddex', async () => {
  const actual =
    await vi.importActual<typeof import('../src/utils/api/moddex')>('../src/utils/api/moddex');

  return { ModdexApiError: actual.ModdexApiError, getSuggestions };
});

const { fetchSuggestions } = await import('@/actions/search');
const { ModdexApiError } = await import('@/utils/api/moddex');
const { SUGGEST_LIMIT } = await import('@/misc/suggest');

const rows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: String(index),
    login: `login${index}`,
    name: null,
    avatar: null,
    followers: index,
    badges: [],
    chatBadge: null
  }));

beforeEach(() => {
  getSuggestions.mockReset().mockResolvedValue({ items: [] });
});

// every export of a 'use server' file is a public endpoint, so this one is
// bounded at the door rather than by whoever calls it
describe('what the action will ask the api for', () => {
  it('asks nothing at all below three characters', async () => {
    expect(await fetchSuggestions('ni')).toEqual([]);
    expect(await fetchSuggestions('  n  ')).toEqual([]);
    expect(getSuggestions).not.toHaveBeenCalled();
  });

  it('sends its own limit rather than one the caller chose', async () => {
    await fetchSuggestions('night');

    expect(getSuggestions).toHaveBeenCalledWith('night', SUGGEST_LIMIT);
  });

  it('trims before it measures, so spaces do not buy a lookup', async () => {
    await fetchSuggestions('  night  ');

    expect(getSuggestions).toHaveBeenCalledWith('night', SUGGEST_LIMIT);
  });

  it('cuts an over-long answer down instead of trusting the api', async () => {
    getSuggestions.mockResolvedValue({ items: rows(50) });

    expect(await fetchSuggestions('night')).toHaveLength(SUGGEST_LIMIT);
  });

  it('carries only the five fields a row draws', async () => {
    getSuggestions.mockResolvedValue({ items: rows(1) });

    const [first] = await fetchSuggestions('night');

    expect(Object.keys(first).sort()).toEqual(['avatar', 'followers', 'id', 'login', 'name']);
  });
});

describe('when the api cannot answer', () => {
  // the endpoint ships with the api, and a search bar that still routes on
  // Enter beats one that throws while the two repos are a deploy apart
  it('falls back to no suggestions on a 404', async () => {
    getSuggestions.mockImplementation(async () => {
      throw new ModdexApiError(404, '/v1/search', 'not found');
    });

    expect(await fetchSuggestions('night')).toEqual([]);
  });

  it('falls back on a 500 as well, rather than failing the keystroke', async () => {
    getSuggestions.mockImplementation(async () => {
      throw new ModdexApiError(500, '/v1/search', 'boom');
    });

    expect(await fetchSuggestions('night')).toEqual([]);
  });

  it('still throws anything that is not the api answering', async () => {
    getSuggestions.mockImplementation(async () => {
      throw new TypeError('fetch failed');
    });

    await expect(fetchSuggestions('night')).rejects.toThrow('fetch failed');
  });
});
