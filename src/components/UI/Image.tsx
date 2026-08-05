import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { FC } from 'react';
import clsx from 'clsx';

type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt?: string;
  radius?: Radius;
}

const radiusClasses: Record<Radius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
};

/**
 * plain next/image.
 *
 * this used to be heroui's <Image as={NextImage}>, which renders the image at
 * opacity-0 until its own load handler flips a data-loaded attribute — and
 * that handler does not fire reliably through the `as` indirection, so avatars
 * and badges stayed invisible even though the files served fine (200 OK). the
 * wrapper survives only to keep the radius prop the call sites already pass.
 */
export const Image: FC<ImageProps> = ({
  alt = '',
  radius = 'none',
  className,
  ...props
}) => (
  <NextImage
    alt={alt}
    className={clsx(radiusClasses[radius], 'object-cover', className)}
    {...props}
  />
);
