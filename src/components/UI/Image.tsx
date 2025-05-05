import NextImage from 'next/image';
import { Image as HeroUIImage, ImageProps as HeroUIImageProps } from '@heroui/react';
import { FC } from 'react';

export const Image: FC<HeroUIImageProps> = ({
  ...props
}) => {
  return (
    <HeroUIImage
      as={NextImage}
      {...props}
    />
  );
};
