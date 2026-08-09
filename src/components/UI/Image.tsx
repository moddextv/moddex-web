import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { FC } from 'react';
import clsx from 'clsx';
import { config } from '@/config';

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
/**
 * Badge urls arrive from moddex-api as absolute — `https://moddex.tv/badges/…`
 * — because that endpoint is public and a relative path means nothing to a
 * caller that is not this app. But *this* app serves those files itself, so an
 * absolute url would send next/image out to the network to fetch an image
 * sitting in its own `public/`, and would need moddex.tv added to
 * `remotePatterns` to be allowed to at all.
 *
 * Trimming our own origin back off hands next/image a local path, which it
 * optimises from disk. Any other host is left alone and goes through the
 * normal remote path.
 */
const local = (src: NextImageProps['src']) =>
  typeof src === 'string' && src.startsWith(`${config.brand.url}/`)
    ? src.slice(config.brand.url.length)
    : src;

export const Image: FC<ImageProps> = ({
  alt = '',
  radius = 'none',
  className,
  src,
  ...props
}) => (
  <NextImage
    alt={alt}
    src={local(src)}
    className={clsx(radiusClasses[radius], 'object-cover', className)}
    {...props}
  />
);
