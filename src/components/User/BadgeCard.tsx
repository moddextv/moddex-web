'use client';

import { useT } from '@/i18n/context';
import { FC, useEffect, useState } from 'react';
import { badgeHolderCounts } from '@/actions/badgeHolders';

let counts: Promise<Record<string, number | null>> | null = null;

// asked once per page, on the first card anybody opens
const holderCounts = () => (counts ??= badgeHolderCounts());

export const BadgeCard: FC<{ slug: string; name: string }> = ({ slug, name }) => {
  const t = useT();
  const [holders, setHolders] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    let live = true;

    void holderCounts().then((all) => live && setHolders(all[slug] ?? null));

    return () => {
      live = false;
    };
  }, [slug]);

  return (
    <span className="badge-card">
      <span className="block font-bold capitalize">{name}</span>
      {holders !== null && (
        <span className="block text-primary-400 tabular">
          {holders === undefined
            ? ' '
            : t('badges.holders', { count: holders, n: t.number(holders) })}
        </span>
      )}
    </span>
  );
};
