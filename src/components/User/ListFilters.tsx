'use client';

import { useT } from '@/i18n/context';
import { FC } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { ChevronDownIcon } from '@/components/Icons';
import { BotMode, Filters, KINDS, Kind, activeFilterCount } from '@/components/User/columns';
import { FilterCounts } from '@/hooks/useUserListView';
import clsx from 'clsx';

const BOT_MODES: BotMode[] = ['all', 'hide', 'only'];

const Choice: FC<{
  pressed: boolean;
  count?: number;
  onClick: () => void;
  children: string;
}> = ({ pressed, count, onClick, children }) => (
  <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
    {children}
    {count !== undefined && <span className="text-primary-400 tabular">{count}</span>}
  </button>
);

const Group: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <p className="text-meta text-primary-400">{label}</p>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

export const ListFilters: FC<{
  filters: Filters;
  counts: FilterCounts;
  onChange: (next: Filters) => void;
}> = ({ filters, counts, onChange }) => {
  const t = useT();
  const active = activeFilterCount(filters);
  const kinds = KINDS.filter((kind) => counts.kinds[kind] > 0);

  // nothing to narrow by means no menu, rather than a menu full of zeros
  if (counts.bots === 0 && counts.banned === 0 && kinds.length === 0) return null;

  const toggleKind = (kind: Kind) =>
    onChange({
      ...filters,
      kinds: filters.kinds.includes(kind)
        ? filters.kinds.filter((entry) => entry !== kind)
        : [...filters.kinds, kind]
    });

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
        {counts.bots > 0 && (
          <Group label={t('controls.groups.bots')}>
            {BOT_MODES.map((mode) => (
              <Choice
                key={mode}
                pressed={filters.bots === mode}
                count={mode === 'all' ? undefined : counts.bots}
                onClick={() => onChange({ ...filters, bots: mode })}
              >
                {t(`controls.botModes.${mode}`)}
              </Choice>
            ))}
          </Group>
        )}

        {kinds.length > 0 && (
          <Group label={t('controls.groups.only')}>
            {kinds.map((kind) => (
              <Choice
                key={kind}
                pressed={filters.kinds.includes(kind)}
                count={counts.kinds[kind]}
                onClick={() => toggleKind(kind)}
              >
                {t(`controls.kinds.${kind}`)}
              </Choice>
            ))}
          </Group>
        )}

        {counts.banned > 0 && (
          <Group label={t('controls.groups.banned')}>
            <Choice
              pressed={filters.hideBanned}
              count={counts.banned}
              onClick={() => onChange({ ...filters, hideBanned: !filters.hideBanned })}
            >
              {t('controls.hideBanned')}
            </Choice>
          </Group>
        )}
      </PopoverContent>
    </Popover>
  );
};
