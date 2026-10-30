'use client';

import { useI18n } from '@/i18n/context';
import { FC, useState } from 'react';
import clsx from 'clsx';
import { Image } from '@/components/UI/Image';
import { BadgeDeck, frontIndex } from '@/components/BadgeDeck';
import { TierBadge, wholeDollars } from '@/misc/donationTiers';

interface BadgePreviewProps {
  badges: TierBadge[];
  locked: TierBadge | null;
  startsAt: number;
  top: boolean;
  login: string | null;
}

export const BadgePreview: FC<BadgePreviewProps> = ({ badges, locked, startsAt, top, login }) => {
  const { t } = useI18n();
  const [front, setFront] = useState<string | null>(null);

  const isLocked = badges.length === 0;
  const deck = isLocked ? (locked ? [locked] : []) : badges;
  const count = deck.length;
  const at = frontIndex(deck, front);
  const current = deck[at];

  const caption = isLocked
    ? t('donate.startsAt', { amount: wholeDollars(t.money(startsAt, 'USD')) })
    : top
      ? t('donate.topIncluded', { count })
      : count > 1
        ? t('donate.cycle', { count })
        : t('donate.yours', { amount: wholeDollars(t.money(startsAt, 'USD')) });

  if (!current) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <BadgeDeck
        deck={deck}
        at={at}
        locked={isLocked}
        onPick={(index) => setFront(deck[index]!.slug)}
        label={(badge, isFront) =>
          isFront ? t('donate.nextBadge') : t('badges.alt', { name: badge.name })
        }
      />

      <p
        key={current.slug}
        className={clsx(
          'tip-swap text-h3 font-bold capitalize mt-8 mb-1.5',
          isLocked && 'text-primary-400'
        )}
      >
        {current.name}
      </p>
      <p key={caption} className="tip-pulse text-ui text-primary-400 mb-6">
        {caption}
      </p>

      <p
        className={clsx(
          'flex items-center gap-1.5 rounded-md border border-primary-700/70 bg-primary-800/50 px-4 py-3 self-stretch justify-center',
          isLocked && 'opacity-50'
        )}
      >
        <Image
          key={current.slug}
          src={current.chat}
          alt={t('badges.alt', { name: current.name })}
          width={18}
          height={18}
          radius="sm"
          className={clsx('tip-swap', isLocked && 'grayscale')}
        />
        <span className="text-base text-primary-300 min-w-0 break-words">
          <span className="font-bold text-primary-100">{login ?? t('donate.previewName')}</span>:{' '}
          {t('chatBadge.sampleMessage')}
        </span>
      </p>
    </div>
  );
};
