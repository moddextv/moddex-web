import { FC, ReactNode } from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container: FC<ContainerProps> = ({ children, className }) => (
  <div className={clsx('mx-auto w-full max-w-page px-6 sm:px-8', className)}>{children}</div>
);
