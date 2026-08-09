import { Image } from '@/components/UI/Image';
import { FC } from 'react';

interface BadgeSelectItemProps {
  name: string;
  path: string;
  size: number;
}

export const BadgeSelectItem: FC<BadgeSelectItemProps> = ({ name, path, size }) => (
  <div className="flex flex-row items-center gap-2">
    {path ? <Image src={path} width={size} height={size} alt={name.toLowerCase()} /> : null}
    <span className="text-medium">{name.toLowerCase()}</span>
  </div>
);
