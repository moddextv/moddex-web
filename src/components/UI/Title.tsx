import { createElement, FC, ReactNode } from 'react';
import clsx from 'clsx';

interface TitleProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mb?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};

const mbClasses = {
  none: '',
  xs: 'mb-1',
  sm: 'mb-2',
  md: 'mb-4',
  lg: 'mb-6',
  xl: 'mb-8'
};

export const Title: FC<TitleProps> = ({
  children,
  level = 1,
  className,
  size = 'xl',
  mb = 'none'
}) => {
  const classes = clsx(
    'font-cairo',
    className,
    mbClasses[mb],
    sizeClasses[size]
  );

  return createElement(`h${level}`, { className: classes }, children);
};
