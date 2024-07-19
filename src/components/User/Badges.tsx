import { Tooltip } from '@/components/UI/Tooltip';
import { BadgeComponent } from '@/misc/Interfaces';
import { FC } from 'react';
import { Image } from '@nextui-org/react';

export const Badges: FC<BadgeComponent> = ({ badges, size = 32 }) => {
  if (!badges || badges.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-row flex-wrap gap-1">
      {badges.map((badge, index) => (
        <Tooltip key={index} content={badge.name}>
          <Image
            src={badge.path}
            alt={badge.name}
            width={size}
            height={size}
            className="cursor-pointer"
          />
        </Tooltip>
      ))}
    </div>
  );
};
