'use client';

import { useT } from '@/i18n/context';
import { FC, ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { ChevronDownIcon } from '@/components/Icons';
import { LocaleLink } from '@/components/UI/LocaleLink';
import clsx from 'clsx';

// one menu for every list: a chip that never changes width, groups of choices inside

export const FilterGroup: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <p className="text-meta text-primary-400">{label}</p>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

interface ChoiceProps {
  pressed: boolean;
  count?: number;
  onClick?: () => void;
  href?: string;
  children: string;
}

export const FilterChoice: FC<ChoiceProps> = ({ pressed, count, onClick, href, children }) => {
  const inner = (
    <>
      {children}
      {count !== undefined && <span className="text-primary-400 tabular">{count}</span>}
    </>
  );

  if (href) {
    return (
      <LocaleLink href={href} className="chip" aria-pressed={pressed}>
        {inner}
      </LocaleLink>
    );
  }

  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {inner}
    </button>
  );
};

export const FilterMenu: FC<{ active: number; children: ReactNode }> = ({ active, children }) => {
  const t = useT();

  return (
    <Popover placement="bottom-end" shouldBlockScroll={false}>
      <PopoverTrigger>
        {/* a fixed width: the popover is anchored here, and a label that grows moves it */}
        <button
          type="button"
          className="chip"
          aria-pressed={active > 0}
          aria-label={t('controls.filterAria', { count: active })}
        >
          {t('controls.filter')}
          <span
            className={clsx('tabular w-4 text-center', active === 0 && 'opacity-0')}
            aria-hidden="true"
          >
            {active}
          </span>
          <ChevronDownIcon size={11} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="panel p-4 flex flex-col items-stretch gap-4 min-w-[240px]">
        {children}
      </PopoverContent>
    </Popover>
  );
};
