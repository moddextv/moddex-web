'use client';

import { CSSProperties, FC } from 'react';
import clsx from 'clsx';
import { Image } from '@/components/UI/Image';
import type { TierBadge } from '@/misc/donationTiers';

interface BadgeDeckProps {
  deck: TierBadge[];
  at: number;
  onPick: (index: number) => void;
  label: (badge: TierBadge, front: boolean) => string;
  locked?: boolean;
}

// the deck spreads across this many px however many cards it holds
const SPREAD = 190;
const MAX_STEP = 46;

// the card in front, or the first one when the front left the deck
export const frontIndex = (deck: TierBadge[], slug: string | null): number =>
  Math.max(
    deck.findIndex((badge) => badge.slug === slug),
    0
  );

export const BadgeDeck: FC<BadgeDeckProps> = ({ deck, at, onPick, label, locked = false }) => {
  const count = deck.length;
  const current = deck[at];
  const step = count > 1 ? Math.min(MAX_STEP, SPREAD / (count - 1)) : 0;

  if (!current) return null;

  return (
    <div
      className={clsx('tip-deck', locked && 'is-locked')}
      style={{ '--step': `${step}px`, '--mid': (count - 1) / 2 } as CSSProperties}
    >
      <Image
        key={`glow-${current.slug}`}
        src={current.icon}
        alt=""
        aria-hidden="true"
        width={128}
        height={128}
        className="tip-glow"
      />

      {deck.map((badge, index) => {
        const place = (index - at + count) % count;

        return (
          <button
            key={badge.slug}
            type="button"
            tabIndex={place === 0 ? 0 : -1}
            disabled={count < 2}
            onClick={() => onPick(place === 0 ? (at + 1) % count : index)}
            aria-label={label(badge, place === 0)}
            className="tip-card"
            style={{ '--p': place, zIndex: count - place } as CSSProperties}
          >
            <Image
              src={badge.icon}
              alt=""
              aria-hidden="true"
              width={112}
              height={112}
              radius="lg"
            />
          </button>
        );
      })}
    </div>
  );
};
