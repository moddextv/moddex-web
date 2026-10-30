'use client';

import { useT } from '@/i18n/context';
import { FC, useState } from 'react';
import { Image } from '@/components/UI/Image';
import { BadgeDeck, frontIndex } from '@/components/BadgeDeck';
import type { TierBadge } from '@/misc/donationTiers';

interface UnlockedDeckProps {
  badges: TierBadge[];
  login: string;
}

export const UnlockedDeck: FC<UnlockedDeckProps> = ({ badges, login }) => {
  const t = useT();
  const [front, setFront] = useState<string | null>(null);

  const at = frontIndex(badges, front);
  const current = badges[at];

  if (!current) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <BadgeDeck
        deck={badges}
        at={at}
        onPick={(index) => setFront(badges[index]!.slug)}
        label={(badge, isFront) =>
          isFront ? t('donate.nextBadge') : t('badges.alt', { name: badge.name })
        }
      />

      <p key={current.slug} className="tip-swap text-h3 font-bold capitalize mt-8 mb-1.5">
        {current.name}
      </p>
      <p className="text-ui text-primary-400 mb-6">
        {t('success.unlocked', { count: badges.length })}
      </p>

      <p className="flex items-center gap-1.5 rounded-md border border-primary-700/70 bg-primary-800/50 px-4 py-3 w-full max-w-md justify-center">
        <Image
          key={current.slug}
          src={current.chat}
          alt={t('badges.alt', { name: current.name })}
          width={18}
          height={18}
          radius="sm"
          className="tip-swap"
        />
        <span className="text-base text-primary-300 min-w-0 break-words">
          <span className="font-bold text-primary-100">{login}</span>:{' '}
          {t('chatBadge.sampleMessage')}
        </span>
      </p>
    </div>
  );
};
