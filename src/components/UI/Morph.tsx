'use client';

import { FC, ReactNode, ViewTransition, useEffect, useSyncExternalStore } from 'react';

let armed: string | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const arm = (id: string | null) => {
  if (id === armed) return;

  armed = id;
  listeners.forEach((listener) => listener());
};

// only the armed row is named: naming 212 rows froze the old page for a second
export const Morph: FC<{
  id: string;
  part: 'avatar' | 'name';
  always?: boolean;
  children: ReactNode;
}> = ({ id, part, always = false, children }) => {
  const on = useSyncExternalStore(
    subscribe,
    () => always || armed === id,
    () => always
  );

  return (
    <ViewTransition name={on ? `u${id}-${part}` : undefined} share="morph" default="none">
      {children}
    </ViewTransition>
  );
};

// the row under the pointer, or the one a keyboard is about to open, is the one that moves
export const MorphArming: FC = () => {
  useEffect(() => {
    const pick = (event: Event) => {
      const row = (event.target as Element | null)?.closest?.('[data-morph]');
      arm(row?.getAttribute('data-morph') ?? null);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter') pick(event);
    };

    document.addEventListener('pointerdown', pick, true);
    document.addEventListener('keydown', onKey, true);

    return () => {
      document.removeEventListener('pointerdown', pick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, []);

  return null;
};
