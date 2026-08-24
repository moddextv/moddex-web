import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { FC } from 'react';
import clsx from 'clsx';
import { config } from '@/config';

type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface ImageProps extends NextImageProps {
  radius?: Radius;
}

const radiusClasses: Record<Radius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
};

const local = (src: NextImageProps['src']) =>
  typeof src === 'string' && src.startsWith(`${config.brand.url}/`)
    ? src.slice(config.brand.url.length)
    : src;

const isSvg = (src: NextImageProps['src']) =>
  typeof src === 'string' && src.split('?')[0]?.endsWith('.svg') === true;

export const Image: FC<ImageProps> = ({ alt, radius = 'none', className, src, ...props }) => {
  const resolved = local(src);
  const classes = clsx(radiusClasses[radius], 'object-cover', className);

  if (isSvg(resolved)) {
    const { width, height, title, style, loading } = props;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={resolved as string}
        width={width as number | undefined}
        height={height as number | undefined}
        title={title}
        style={style}
        loading={loading ?? 'lazy'}
        className={classes}
      />
    );
  }

  return <NextImage alt={alt} src={resolved} className={classes} {...props} />;
};
