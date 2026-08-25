import { getTranslator, Locale, localePath } from '@/i18n';
import { BrowseAxis, browsePagePath } from '@/misc/browsePages';
import Link from 'next/link';
import { FC } from 'react';
import clsx from 'clsx';

const WINDOW = 2;

const windowed = (page: number, last: number): number[] => {
  const pages = new Set<number>([1, last]);

  for (let n = page - WINDOW; n <= page + WINDOW; n++) {
    if (n >= 1 && n <= last) pages.add(n);
  }

  return [...pages].sort((a, b) => a - b);
};

interface BrowsePagerProps {
  axis: BrowseAxis;
  page: number;
  last: number;
  locale: Locale;
}

export const BrowsePager: FC<BrowsePagerProps> = ({ axis, page, last, locale }) => {
  const t = getTranslator(locale);
  if (last < 2) return null;

  const numbers = windowed(page, last);

  return (
    <nav
      className="flex items-center justify-center gap-2 flex-wrap pt-6"
      aria-label={t('misc.pagination')}
    >
      {page > 1 && (
        <Link
          href={localePath(locale, browsePagePath(axis, page - 1))}
          rel="prev"
          className="btn btn-soft"
        >
          {t('common.previous')}
        </Link>
      )}

      {numbers.map((number, index) => (
        <span key={number} className="flex items-center gap-2">
          {index > 0 && numbers[index - 1] !== number - 1 && (
            <span className="text-ui text-primary-400" aria-hidden="true">
              …
            </span>
          )}

          <Link
            href={localePath(locale, browsePagePath(axis, number))}
            aria-current={number === page ? 'page' : undefined}
            className={clsx(
              'chip tabular',
              number === page && 'text-primary-100 font-bold pointer-events-none'
            )}
          >
            {number}
          </Link>
        </span>
      ))}

      {page < last && (
        <Link
          href={localePath(locale, browsePagePath(axis, page + 1))}
          rel="next"
          className="btn btn-soft"
        >
          {t('common.next')}
        </Link>
      )}
    </nav>
  );
};
