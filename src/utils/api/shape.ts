import 'server-only';

export class ShapeError extends Error {
  constructor(
    readonly at: string,
    readonly expected: string,
    readonly got: unknown
  ) {
    super(`expected ${expected} at ${at}, got ${describe(got)}`);
    this.name = 'ShapeError';
  }
}

const describe = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array(${value.length})`;

  const type = typeof value;

  return type === 'object' ? `object{${Object.keys(value as object).join(',')}}` : type;
};

export type Check<T> = (value: unknown, at: string) => T;

export const str: Check<string> = (value, at) => {
  if (typeof value !== 'string') throw new ShapeError(at, 'string', value);

  return value;
};

export const num: Check<number> = (value, at) => {
  if (typeof value !== 'number' || Number.isNaN(value)) throw new ShapeError(at, 'number', value);

  return value;
};

export const bool: Check<boolean> = (value, at) => {
  if (typeof value !== 'boolean') throw new ShapeError(at, 'boolean', value);

  return value;
};

export const nullable =
  <T>(check: Check<T>): Check<T | null> =>
  (value, at) =>
    value === null ? null : check(value, at);

export const arrayOf =
  <T>(check: Check<T>): Check<T[]> =>
  (value, at) => {
    if (!Array.isArray(value)) throw new ShapeError(at, 'array', value);

    return value.map((entry, index) => check(entry, `${at}[${index}]`));
  };

type Infer<C> = C extends Check<infer T> ? T : never;
type Shaped<S> = { [K in keyof S]: Infer<S[K]> };

export const object =
  <S extends Record<string, Check<unknown>>>(shape: S): Check<Shaped<S>> =>
  (value, at) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ShapeError(at, 'object', value);
    }

    for (const [key, check] of Object.entries(shape)) {
      check((value as Record<string, unknown>)[key], at ? `${at}.${key}` : key);
    }

    return value as Shaped<S>;
  };

export const id: Check<string> = (value, at) => {
  if (typeof value !== 'string') throw new ShapeError(at, 'twitch id (string)', value);

  return value;
};
