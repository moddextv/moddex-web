import { Tooltip } from '@/components/UI/Tooltip';
import { Badge, BadgeComponent } from '@/misc/Interfaces';
import { FC } from 'react';
import { Image } from '@/components/UI/Image';

/**
 * Not a row in `badges` — synthesised here from `user.bot`.
 *
 * Every other badge is an awarded record joined through `user_badges`; being a
 * bot is a curated flag on the account (see misc/bots.ts). Making it a real
 * badge would mean a migration, a backfill and a reconciliation job to keep it
 * true, for something already known from a boolean. It only has to *look* like
 * a badge, which is what this is.
 *
 * Grey rather than a role colour, and first in the row: it says what kind of
 * account this is, which is a different claim from the ones it earned.
 */
const BOT_BADGE: Badge = { id: -1, name: 'Bot', path: '/badges/bot.svg' };

export const Badges: FC<BadgeComponent> = ({ badges, size = 24, bot = false }) => {
  const shown = bot ? [BOT_BADGE, ...(badges ?? [])] : (badges ?? []);

  if (shown.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-row flex-wrap gap-1">
      {shown.map((badge) => (
        <Tooltip key={badge.id} content={badge.name}>
          <div>
            <Image
              src={badge.path}
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
