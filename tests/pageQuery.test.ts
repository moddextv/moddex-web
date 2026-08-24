import { describe, expect, it } from 'vitest';

import {
  MIN_SEARCH_LENGTH,
  Query,
  stillPaged,
  takeOnce,
  withServerSearch,
  withServerSort
} from '../src/hooks/pageQuery';

const query = (over: Partial<Query> = {}): Query => ({
  sort: 'granted',
  dir: 'desc',
  search: '',
  ...over
});

describe('takeOnce', () => {
  it('hands the value to the first caller and nothing to the second', () => {
    const ref = { current: 'cursor-1' as string | null };

    expect(takeOnce(ref)).toBe('cursor-1');
    expect(takeOnce(ref)).toBeNull();
  });

  it('is safe to call on an empty ref', () => {
    const ref = { current: null as string | null };

    expect(takeOnce(ref)).toBeNull();
    expect(ref.current).toBeNull();
  });

  it('lets the value be put back after a failed attempt', () => {
    const ref = { current: 'cursor-1' as string | null };
    const taken = takeOnce(ref);

    ref.current = taken;

    expect(takeOnce(ref)).toBe('cursor-1');
  });
});

describe('withServerSort', () => {
  it('returns the SAME object when nothing changed', () => {
    const previous = query({ sort: 'followers', dir: 'asc' });

    expect(withServerSort(previous, 'followers', 'asc')).toBe(previous);
  });

  it('returns a new object when the column changes', () => {
    const previous = query({ sort: 'granted' });
    const next = withServerSort(previous, 'followers', 'desc');

    expect(next).not.toBe(previous);
    expect(next.sort).toBe('followers');
  });

  it('returns a new object when only the direction changes', () => {
    const previous = query({ sort: 'granted', dir: 'desc' });

    expect(withServerSort(previous, 'granted', 'asc')).not.toBe(previous);
  });

  it('leaves the search term alone', () => {
    const previous = query({ search: 'nightbot' });

    expect(withServerSort(previous, 'followers', 'desc').search).toBe('nightbot');
  });
});

describe('withServerSearch', () => {
  it('returns the SAME object for a term that is still too short', () => {
    const previous = query();

    expect(withServerSearch(previous, '')).toBe(previous);
    expect(withServerSearch(previous, 'th')).toBe(previous);
    expect(withServerSearch(previous, '  a  ')).toBe(previous);
  });

  it('returns the SAME object when the term has not changed', () => {
    const previous = query({ search: 'nightbot' });

    expect(withServerSearch(previous, 'nightbot')).toBe(previous);
    expect(withServerSearch(previous, '  nightbot  ')).toBe(previous);
  });

  it('accepts a term at exactly the minimum', () => {
    const previous = query();
    const next = withServerSearch(previous, 'thi');

    expect(next).not.toBe(previous);
    expect(next.search).toBe('thi');
    expect('thi'.length).toBe(MIN_SEARCH_LENGTH);
  });

  it('clears a term that is deleted back below the minimum', () => {
    const previous = query({ search: 'nightbot' });
    const next = withServerSearch(previous, 'ni');

    expect(next).not.toBe(previous);
    expect(next.search).toBe('');
  });

  it('trims before measuring and before sending', () => {
    expect(withServerSearch(query(), '  thi  ').search).toBe('thi');
  });

  it('leaves the ordering alone', () => {
    const previous = query({ sort: 'followers', dir: 'asc' });

    expect(withServerSearch(previous, 'thi')).toMatchObject({ sort: 'followers', dir: 'asc' });
  });
});

describe('stillPaged', () => {
  // nightbot: 839,706 rows, and "maers" matches two of them
  it('keeps a searched list paged even when the reply fits one page', () => {
    expect(stillPaged(true, query({ search: 'maers' }), false)).toBe(true);
  });

  it('lets an unfiltered reply decide', () => {
    expect(stillPaged(true, query(), false)).toBe(false);
    expect(stillPaged(false, query(), true)).toBe(true);
  });

  it('does not make a short list paged because a search matched nothing', () => {
    expect(stillPaged(false, query({ search: 'maers' }), false)).toBe(false);
  });
});
