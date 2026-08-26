export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      code?: string;
    };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const failed = <T = never>(error: string, code = ''): ActionResult<T> =>
  code ? { ok: false, error, code } : { ok: false, error };
