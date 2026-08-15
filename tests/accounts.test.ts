import { describe, expect, it } from 'vitest';
import {
  CAP,
  matches,
  resolveHit,
  toAdminRow,
  toBotRow,
  visibleRows
} from '@/components/Dashboard/accounts';
import type { Row } from '@/components/Dashboard/accounts';

const row = (over: Partial<Row> & { userId: string }): Row => ({
  login: null,
  name: null,
  avatar: null,
  byLogin: null,
  at: null,
  ...over
});

const NIGHTBOT = row({ userId: '19264788', login: 'nightbot', name: 'Nightbot' });
const APUJAR = row({ userId: '896181679', login: 'apujar', name: 'ApuJar' });
const MAERSUX = row({ userId: '217986157', login: 'maersux', name: 'maersux', owner: true });

describe('resolveHit', () => {
  it('never reports a second roster hit as belonging to the first account', () => {
    const hit = resolveHit([APUJAR], [MAERSUX], 'a');

    expect(hit?.account.userId).toBe(APUJAR.userId);
    expect(hit?.admin).toBe(false);
    expect(hit?.bot).toBe(true);
  });

  it('reports both when they really are the same account', () => {
    const hit = resolveHit([MAERSUX], [MAERSUX], 'maersux');

    expect(hit?.account.userId).toBe(MAERSUX.userId);
    expect(hit?.bot).toBe(true);
    expect(hit?.admin).toBe(true);
  });

  it('finds an account that is only in the admin roster', () => {
    const hit = resolveHit([NIGHTBOT], [MAERSUX], 'maersux');

    expect(hit?.account.userId).toBe(MAERSUX.userId);
    expect(hit?.bot).toBe(false);
    expect(hit?.admin).toBe(true);
  });

  it('is null for an empty term and for a term nothing matches', () => {
    expect(resolveHit([NIGHTBOT], [MAERSUX], '')).toBeNull();
    expect(resolveHit([NIGHTBOT], [MAERSUX], 'forsen')).toBeNull();
  });
});

describe('matches', () => {
  it('searches login, display name and id', () => {
    expect(matches(NIGHTBOT, 'night')).toBeTruthy();
    expect(matches(NIGHTBOT, 'nightbot')).toBeTruthy();
    expect(matches(NIGHTBOT, '1926')).toBeTruthy();
    expect(matches(NIGHTBOT, 'forsen')).toBeFalsy();
  });

  it('survives a row with no login and no name', () => {
    const unknown = row({ userId: '999999' });

    expect(matches(unknown, '9999')).toBeTruthy();
    expect(matches(unknown, 'nightbot')).toBeFalsy();
  });
});

describe('visibleRows', () => {
  const many = Array.from({ length: CAP + 12 }, (_, index) =>
    row({ userId: String(index), login: `bot${index}` })
  );

  it('caps a long roster and lifts the cap on request', () => {
    expect(visibleRows(many, '', false)).toHaveLength(CAP);
    expect(visibleRows(many, '', true)).toHaveLength(many.length);
  });

  it('filters before capping', () => {
    const found = visibleRows(many, 'bot1', false);

    expect(found.length).toBeLessThan(CAP);
    expect(found.every((one) => one.login?.includes('1'))).toBe(true);
  });
});

describe('row mapping', () => {
  it('maps a bot and an admin onto the same row shape', () => {
    const bot = toBotRow({
      userId: '1',
      login: 'a',
      name: 'A',
      avatar: null,
      addedBy: '9',
      addedByLogin: 'maersux',
      addedAt: '2026-08-10T00:00:00.000Z',
      known: true
    });

    const admin = toAdminRow({
      userId: '2',
      login: 'b',
      name: 'B',
      avatar: null,
      grantedBy: null,
      grantedByLogin: null,
      grantedAt: null,
      owner: true
    });

    expect(bot.byLogin).toBe('maersux');
    expect(bot.known).toBe(true);
    expect(bot.owner).toBeUndefined();

    expect(admin.byLogin).toBeNull();
    expect(admin.at).toBeNull();
    expect(admin.owner).toBe(true);
  });
});
