'use client';

import { useT } from '@/i18n/context';
import { FC } from 'react';
import { BotMode, Filters, KINDS, Kind, activeFilterCount } from '@/components/User/columns';
import { FilterChoice, FilterGroup, FilterMenu } from '@/components/UI/FilterMenu';
import { FilterCounts } from '@/hooks/useUserListView';

const BOT_MODES: BotMode[] = ['all', 'hide', 'only'];

export const ListFilters: FC<{
  filters: Filters;
  counts: FilterCounts;
  onChange: (next: Filters) => void;
}> = ({ filters, counts, onChange }) => {
  const t = useT();
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
    <FilterMenu active={activeFilterCount(filters)}>
      {counts.bots > 0 && (
        <FilterGroup label={t('controls.groups.bots')}>
          {BOT_MODES.map((mode) => (
            <FilterChoice
              key={mode}
              pressed={filters.bots === mode}
              count={mode === 'all' ? undefined : counts.bots}
              onClick={() => onChange({ ...filters, bots: mode })}
            >
              {t(`controls.botModes.${mode}`)}
            </FilterChoice>
          ))}
        </FilterGroup>
      )}

      {kinds.length > 0 && (
        <FilterGroup label={t('controls.groups.only')}>
          {kinds.map((kind) => (
            <FilterChoice
              key={kind}
              pressed={filters.kinds.includes(kind)}
              count={counts.kinds[kind]}
              onClick={() => toggleKind(kind)}
            >
              {t(`controls.kinds.${kind}`)}
            </FilterChoice>
          ))}
        </FilterGroup>
      )}

      {counts.banned > 0 && (
        <FilterGroup label={t('controls.groups.banned')}>
          <FilterChoice
            pressed={filters.hideBanned}
            count={counts.banned}
            onClick={() => onChange({ ...filters, hideBanned: !filters.hideBanned })}
          >
            {t('controls.hideBanned')}
          </FilterChoice>
        </FilterGroup>
      )}
    </FilterMenu>
  );
};
