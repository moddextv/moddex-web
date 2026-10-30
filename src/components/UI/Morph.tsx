import { FC, ReactNode, ViewTransition } from 'react';

// one account seen in a row and on its profile is the same object, so it moves rather than swaps
export const Morph: FC<{ id: string; part: 'avatar' | 'name'; children: ReactNode }> = ({
  id,
  part,
  children
}) => (
  <ViewTransition name={`u${id}-${part}`} share="morph" default="none">
    {children}
  </ViewTransition>
);
