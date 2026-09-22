'use client';

import { FC, ReactNode, useEffect, useState } from 'react';

// shown on the first page of a visit and not again: the server renders it, the
// browser remembers having seen it. a browser that will not remember shows it every time
export const Once: FC<{ id: string; children: ReactNode }> = ({ id, children }) => {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const key = `once:${id}`;

    try {
      if (sessionStorage.getItem(key)) {
        setSeen(true);
        return;
      }

      sessionStorage.setItem(key, '1');
    } catch {
      // private mode or blocked storage: show it, as the server did
    }
  }, [id]);

  return seen ? null : <>{children}</>;
};
