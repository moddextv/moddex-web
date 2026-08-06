import { FC, ReactNode } from 'react';
import clsx from 'clsx';

type Tone = 'neutral' | 'mod' | 'vip';

interface BracketProps {
  children: ReactNode;
  tone?: Tone;
  /** brackets converge on the content when it first appears */
  animate?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'text-primary-500',
  mod: 'text-mod',
  vip: 'text-vip'
};

/**
 * the core primitive of the whole design, taken straight from the logo: the
 * mark IS two corner brackets in 180° rotational symmetry, so content here is
 * framed by two corners rather than boxed by a border.
 *
 * a full box would be a card — which is exactly the generic shape we are
 * avoiding. two corners imply the frame without drawing it, and they carry the
 * brand at every scale for free.
 */
export const Bracket: FC<BracketProps> = ({
  children,
  tone = 'neutral',
  animate = false,
  className
}) => (
  <div
    className={clsx(
      'bracket relative',
      animate && 'bracket-in',
      toneClasses[tone],
      className
    )}
  >
    {children}
  </div>
);
