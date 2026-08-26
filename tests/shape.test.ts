import { describe, expect, it } from 'vitest';
import { arrayOf, bool, id, nullable, num, object, ShapeError, str } from '@/utils/api/shape';

describe('the primitives', () => {
  it('accepts what it says and refuses what it does not', () => {
    expect(str('forsen', 'login')).toBe('forsen');
    expect(num(24, 'mods')).toBe(24);
    expect(bool(true, 'hasMore')).toBe(true);

    expect(() => str(24, 'login')).toThrow(ShapeError);
    expect(() => bool('true', 'hasMore')).toThrow(ShapeError);
  });

  it('refuses NaN, which is a number and never an answer', () => {
    expect(() => num(Number.NaN, 'mods')).toThrow(ShapeError);
  });

  it('treats null as a value, not an absence', () => {
    expect(nullable(num)(null, 'founders')).toBeNull();
    expect(nullable(num)(1270000, 'founders')).toBe(1270000);

    expect(() => nullable(num)(undefined, 'founders')).toThrow(ShapeError);
  });

  it('insists a twitch id is a string, which migration 035 settled', () => {
    expect(id('44322889', 'id')).toBe('44322889');
    expect(() => id(44322889, 'id')).toThrow(ShapeError);
  });
});

describe('objects', () => {
  const user = object({ id, login: str });

  it('passes a row that carries what we read', () => {
    expect(user({ id: '1', login: 'forsen' }, '')).toEqual({ id: '1', login: 'forsen' });
  });

  it('LETS EXTRA FIELDS THROUGH, and hands the original object back', () => {
    const row = { id: '1', login: 'forsen', somethingNew: 42 };

    expect(user(row, '')).toBe(row);
  });

  it('refuses a row missing the field every link is built from', () => {
    expect(() => user({ id: '1' }, '')).toThrow(ShapeError);
  });

  it('names the exact path, which is the whole point of the log line', () => {
    const rows = arrayOf(user);

    expect(() => rows([{ id: '1', login: 'forsen' }, { id: '2' }], 'items')).toThrow(
      /items\[1\]\.login/
    );
  });

  it('refuses an array where an object belongs, and the reverse', () => {
    expect(() => user([], '')).toThrow(ShapeError);
    expect(() => arrayOf(user)({ id: '1', login: 'a' }, '')).toThrow(ShapeError);
  });

  it('describes what it got without printing the whole payload', () => {
    expect(() => str({ id: '1', login: 'forsen' }, 'login')).toThrow(/object\{id,login\}/);
  });
});
