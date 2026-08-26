import { FC } from 'react';
import clsx from 'clsx';

export const Mark: FC<{ size?: number; split?: boolean; className?: string }> = ({
  size = 22,
  split = false,
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    role="img"
    aria-label="moddex"
    fill={split ? undefined : 'currentColor'}
    className={clsx('shrink-0', className)}
  >
    <path d="M4 4 H18 V10 H10 V18 H4 Z" fill={split ? 'var(--mark-in)' : undefined} />
    <path d="M28 28 H14 V22 H22 V14 H28 Z" fill={split ? 'var(--mark-out)' : undefined} />
  </svg>
);
