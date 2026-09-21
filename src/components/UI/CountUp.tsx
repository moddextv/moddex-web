'use client';

import { useT } from '@/i18n/context';
import { FC, useEffect, useRef, useState } from 'react';

const DURATION = 1100;

const easeOut = (x: number): number => 1 - Math.pow(1 - x, 3);

const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// the server renders the final number, so a reader without javascript sees it
export const CountUp: FC<{ value: number }> = ({ value }) => {
  const t = useT();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion() || value === 0) return;

    let frame = 0;

    const run = (start: number) => (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      setShown(Math.round(easeOut(progress) * value));
      if (progress < 1) frame = requestAnimationFrame(run(start));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setShown(0);
        frame = requestAnimationFrame((now) => run(now)(now));
      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{t.number(shown)}</span>;
};
