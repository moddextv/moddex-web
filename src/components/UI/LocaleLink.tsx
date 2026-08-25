'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';

interface LocaleLinkProps {
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
}

/**
 * An internal link that keeps the reader in the language they are reading.
 *
 * A client component on purpose: server components cannot reach the context,
 * and threading the locale into every call site is what this exists to avoid.
 * An absolute or external href is passed through untouched.
 */
export const LocaleLink: FC<LocaleLinkProps> = ({ href, className, target, rel, children }) => {
  const { path } = useI18n();
  const internal = href.startsWith('/') && !href.startsWith('//');

  return (
    <Link href={internal ? path(href) : href} className={className} target={target} rel={rel}>
      {children}
    </Link>
  );
};
