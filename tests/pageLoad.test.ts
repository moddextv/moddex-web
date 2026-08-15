import { describe, expect, it } from 'vitest';
import { beginPage, beginQuery, createPageLoad, newest, wanted } from '@/hooks/pageLoad';
import { acquire, release } from '@/hooks/latch';
import { takeOnce } from '@/hooks/pageQuery';

// Each block replays one of the three client defects found by clicking around
// the deployed site on 2026-08-13. Node-only on purpose: these are event
// orderings, not renders.

describe('the reply that is no longer wanted (BrowseList, sort changed twice)', () => {
  it('drops the earlier query and keeps the later one', () => {
    const load = createPageLoad();

    const first = beginQuery(load);
    const second = beginQuery(load);

    expect(wanted(load, first)).toBe(false);
    expect(wanted(load, second)).toBe(true);
  });

  it('does not let a slow first reply overwrite a fast second one', () => {
    const load = createPageLoad();

    const byRoles = beginQuery(load);
    const byFollowers = beginQuery(load);

    // followers lands first, roles lands late — the late one must not win
    expect(wanted(load, byFollowers)).toBe(true);
    expect(wanted(load, byRoles)).toBe(false);
  });
});

describe('"Load more" stayed disabled for the rest of the session', () => {
  it('drops a superseded page but STILL releases the button', () => {
    const load = createPageLoad();

    const page = beginPage(load); // the reader clicks Load more
    beginQuery(load); // ...and changes the sort while it is in flight

    // the list must not append this page
    expect(wanted(load, page)).toBe(false);

    // the button must come back anyway. clearing on `wanted` is the defect:
    // the flag stayed true and the button read "Loading…" forever.
    expect(newest(load, page)).toBe(true);
  });

  it('does not let a late page release the button out from under a newer one', () => {
    const load = createPageLoad();

    const first = beginPage(load);
    const second = beginPage(load);

    expect(newest(load, first)).toBe(false);
    expect(newest(load, second)).toBe(true);
  });

  it('keeps the button responsive across a query change and a fresh page', () => {
    const load = createPageLoad();

    const stale = beginPage(load);
    beginQuery(load);
    const fresh = beginPage(load);

    expect(newest(load, stale)).toBe(false);
    expect(newest(load, fresh)).toBe(true);
    expect(wanted(load, fresh)).toBe(true);
  });
});

describe('pending is not a lock (two clicks inside one render)', () => {
  it('refuses the second click through the latch, not through a rendered flag', () => {
    const inFlight = { current: false };

    expect(acquire(inFlight)).toBe(true);
    expect(acquire(inFlight)).toBe(false);

    release(inFlight);
    expect(acquire(inFlight)).toBe(true);
  });

  it('hands the cursor out once, so two clicks cannot page from the same offset', () => {
    const cursor = { current: 'abc' as string | null };

    expect(takeOnce(cursor)).toBe('abc');
    expect(takeOnce(cursor)).toBeNull();
  });

  it('releases the latch even when the request failed', () => {
    const inFlight = { current: false };

    acquire(inFlight);
    try {
      throw new Error('the api was unreachable');
    } catch {
      // the point: release is in a finally, so a failure does not wedge it
    } finally {
      release(inFlight);
    }

    expect(acquire(inFlight)).toBe(true);
  });
});
