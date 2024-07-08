import Image from 'next/image';
import { FC } from 'react';
import { BadgeComponent } from '@/misc/Interfaces';
import { Tooltip } from '@/components/Tooltip';

export const Badges: FC<BadgeComponent> = ({ badges, size = 32 }) => {
    if (!badges || badges.length === 0) {
        return <></>;
    }

    return (
        <div className="badges">
            {badges.map((badge, index) => (
                <Tooltip key={index} content={badge.name} placement="top">
                    <Image
                        src={badge.path}
                        alt={badge.name}
                        width={size}
                        height={size}
                    />
                </Tooltip>
            ))}
        </div>
    );
};