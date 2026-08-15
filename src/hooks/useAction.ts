'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActionResult } from '@/actions/result';
import { acquire, release } from '@/hooks/latch';
import type { ClearableAction } from '@/hooks/actionGroup';

interface Options<T> {
  onSuccess?: (data: T) => void | Promise<void>;
  onFailure?: (error: string, code?: string) => void;
}

export interface ActionHandle<A extends unknown[], T> extends ClearableAction {
  run: (...args: A) => Promise<ActionResult<T> | null>;
}

export const useAction = <A extends unknown[], T>(
  action: (...args: A) => Promise<ActionResult<T>>,
  options: Options<T> = {}
): ActionHandle<A, T> => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const inFlight = useRef(false);

  const latest = useRef(options);
  latest.current = options;

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (...args: A): Promise<ActionResult<T> | null> => {
    if (!acquire(inFlight)) return null;

    setPending(true);
    setError(null);
    setCode(null);

    try {
      const result = await action(...args);

      if (result.ok) {
        await latest.current.onSuccess?.(result.data);
      } else if (mounted.current) {
        setError(result.error);
        setCode(result.code ?? null);
        latest.current.onFailure?.(result.error, result.code);
      }

      return result;
    } finally {
      release(inFlight);
      if (mounted.current) setPending(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setCode(null);
  }, []);

  return { run, pending, error, code, clearError };
};
