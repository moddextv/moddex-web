import { Tooltip } from '@/components/UI/Tooltip';
import { BadgesProps } from '@/misc/badges';
import { FC } from 'react';
import { Image } from '@/components/UI/Image';
import clsx from 'clsx';

export const Badges: FC<BadgesProps> = ({ badges, size = 24, className }) => {
  const shown = badges ?? [];

  if (shown.length === 0) {
    return <></>;
  }

  return (
    <div className={clsx('badges flex flex-row flex-wrap gap-1', className)}>
      {shown.map((badge) => (
        <Tooltip key={badge.id} content={badge.name}>
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
