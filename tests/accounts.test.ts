import { describe, expect, it } from 'vitest';
import {
  CAP,
  matches,
  toBotRow,
  toHolderRow,
  visibleRows
} from '@/components/Dashboard/accounts';
import type { Row } from '@/components/Dashboard/accounts';

const row = (over: Partial<Row> & { userId: string }): Row => ({
  login: null,
  name: null,
  avatar: null,
  badges: [],
  byLogin: null,
  at: null,
  ...over
});

const NIGHTBOT = row({ userId: '19264788', login: 'nightbot', name: 'Nightbot' });
const APUJAR = row({ userId: '896181679', login: 'apujar', name: 'ApuJar' });
const MAERSUX = row({ userId: '217986157', login: 'maersux', name: 'maersux', owner: true });

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
  it('maps a bot and a holder onto the same row shape', () => {
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

    const admin = toHolderRow({
      id: '2',
      login: 'b',
      name: 'B',
      avatar: null,
      ignored: false,
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

describe('toHolderRow', () => {
  it('maps a badge holder onto the same row shape as a bot and an admin', () => {
    const mapped = toHolderRow({
      id: '1',
      login: 'maersux',
      name: 'Maersux',
      avatar: 'a.png',
      ignored: false,
      grantedBy: '9',
      grantedAt: '2026-08-17',
      grantedByLogin: 'someone',
      owner: false
    });

    expect(mapped).toEqual({
      userId: '1',
      login: 'maersux',
      name: 'Maersux',
      avatar: 'a.png',
      badges: [],
      byLogin: 'someone',
      at: '2026-08-17',
      ignored: false,
      owner: false
    });
  });

  // web and api deploy separately, so the badges may not be in the reply yet
  it('carries the badges through, and survives an api that does not send them', () => {
    const badge = { id: 4, name: 'donator', svg: 's', webp: 'w' };

    expect(toHolderRow({ id: '1', badges: [badge] } as never).badges).toEqual([badge]);
    expect(toHolderRow({ id: '1' } as never).badges).toEqual([]);
  });

  it('carries the opt-out through rather than hiding the row', () => {
    const mapped = toHolderRow({
      id: '1',
      login: 'a',
      name: null,
      avatar: null,
      ignored: true,
      grantedBy: null,
      grantedAt: null,
      grantedByLogin: null,
      owner: false
    });

    expect(mapped.ignored).toBe(true);
    expect(mapped.byLogin).toBeNull();
  });
});
