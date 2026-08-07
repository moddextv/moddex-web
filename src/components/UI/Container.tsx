import { FC, ReactNode } from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * the single measure the whole site aligns to — one width, deliberately no
 * size variants. header, main and footer all wrap in this, so the wordmark,
 * the page heading and the footer share one left edge.
 *
 * 1440px, up from 1024. the previous width was half of why the design read as
 * clamped, and five routes (/donate, /donate/success, /settings, /tos,
 * /dashboard) were wrapping in their own `max-w-3xl` instead, so the site had
 * two measures and neither lined up with the wordmark. those five move onto
 * this as they are ported.
 */
export const Container: FC<ContainerProps> = ({ children, className }) => (
  <div className={clsx('mx-auto w-full max-w-page px-6 sm:px-8', className)}>
    {children}
  </div>
);
