import { FC, ReactNode } from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * the single measure the whole site aligns to — one width, deliberately no
 * size variants. header, main and footer all wrap in this, so the wordmark,
 * the page heading and the footer share one left edge. two different measures
 * is what made the header look detached from the page before.
 */
export const Container: FC<ContainerProps> = ({ children, className }) => (
  <div className={clsx('mx-auto w-full max-w-5xl px-5 sm:px-8', className)}>
    {children}
  </div>
);
