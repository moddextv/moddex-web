'use client';

import { FC, useState } from 'react';
import clsx from 'clsx';
import { Image } from '@/components/UI/Image';
import { avatarVariant } from '@/misc/avatar';

interface AvatarProps {
  src: string | null | undefined;
  name: string;
  size: number;
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ src, name, size, className }) => {
  const [failed, setFailed] = useState({ src: '', step: 0 });

  // the sized variant first, the stored url as the fallback it 404s to
  const candidates = src ? [...new Set([avatarVariant(src, size), src])] : [];
  const step = failed.src === src ? failed.step : 0;
  const current = candidates[step];

  return (
    <span className={clsx('avatar-slot', className)} style={{ width: size, height: size }}>
      {current ? (
        <Image
          key={current}
          src={current}
          alt={name}
          width={size}
          height={size}
          radius="full"
          unoptimized
          onError={() => setFailed({ src: src ?? '', step: step + 1 })}
        />
      ) : null}
    </span>
  );
};
