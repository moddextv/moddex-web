'use client';

import { FC, useState } from 'react';
import clsx from 'clsx';
import { Image } from '@/components/UI/Image';

interface AvatarProps {
  src: string | null | undefined;
  name: string;
  size: number;
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ src, name, size, className }) => {
  const [failed, setFailed] = useState(false);

  return (
    <span className={clsx('avatar-slot', className)} style={{ width: size, height: size }}>
      {src && !failed ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          radius="full"
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
};
