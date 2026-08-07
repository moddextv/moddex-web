import { FC } from 'react';
import clsx from 'clsx';

/**
 * the moddex mark — two identical corner brackets in 180° rotational symmetry.
 * geometry copied verbatim from public/logo/moddex-mark.svg; if the logo ever
 * changes, change it there and re-copy rather than editing these paths.
 *
 * `split` paints bracket A mod-green and bracket B vip-pink, which is the
 * whole idea of the mark: one relationship, two ends.
 *
 * the header and footer use `split` now. they used to be monochrome on the
 * reasoning that colour is never load-bearing at small sizes — still true, and
 * still why the favicon and the chat badge are monochrome — but the green/pink
 * pair is what took over from twitch purple as the site's accent, so the one
 * place the pair is stated outright had better be the wordmark.
 */
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
    <path d="M4 4 H18 V10 H10 V18 H4 Z" fill={split ? '#4ADE80' : undefined} />
    <path d="M28 28 H14 V22 H22 V14 H28 Z" fill={split ? '#F472B6' : undefined} />
  </svg>
);
