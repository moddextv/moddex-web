import NextImage from 'next/image';
import { Image as NextUIImage, ImageProps as NextUIImageProps } from '@nextui-org/react';
import { FC } from 'react';

export const Image: FC<NextUIImageProps> = ({
  ...props
}) => {
  return (
    <NextUIImage
      as={NextImage}
      {...props}
    />
  );
};
