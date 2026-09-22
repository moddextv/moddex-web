import { Tooltip } from '@/components/UI/Tooltip';
import type { Translator } from '@/i18n/translate';
import { BadgesProps } from '@/misc/badges';
import { FC } from 'react';
import { Image } from '@/components/UI/Image';
import clsx from 'clsx';

// a badge that says what kind of account this is gets a word more than its name.
// drawn by server and client components alike, so the translator comes from the caller
const EXPLAINED: Record<string, string> = { verified: 'badges.verifiedTooltip' };

export const explainBadge =
  (t: Translator) =>
  (slug: string): string | undefined => {
    const key = EXPLAINED[slug];

    return key ? t(key) : undefined;
  };

export const Badges: FC<BadgesProps> = ({ badges, size = 24, className, explain }) => {
  const shown = badges ?? [];

  if (shown.length === 0) {
    return <></>;
  }

  return (
    <div className={clsx('badges flex flex-row flex-wrap gap-1', className)}>
      {shown.map((badge) => (
        <Tooltip key={badge.id} content={explain?.(badge.slug) ?? badge.name}>
          <div>
            <Image
              src={badge.svg}
              alt={badge.name}
              width={size}
              height={size}
              className="cursor-help"
            />
          </div>
        </Tooltip>
      ))}
    </div>
  );
};
