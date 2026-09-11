'use client';

import { useT } from '@/i18n/context';
import { Children, FC, ReactNode, useState } from 'react';
import clsx from 'clsx';

import { RoleKey, roleCornerClass, roleTextClass } from '@/misc/roles';

interface RoleTab {
  key: RoleKey;
  label: string;
  count: number | null;
  href: string;
}

export const RoleTabs: FC<{ tabs: RoleTab[]; initial?: number; children: ReactNode }> = ({
  tabs,
  initial = 0,
  children
}) => {
  const t = useT();
  const [active, setActive] = useState(initial);
  const panels = Children.toArray(children);

  const select = (index: number) => {
    setActive(index);

    const href = tabs[index]?.href;

    if (href) window.history.replaceState(null, '', href);
  };

  return (
    <div>
      {/* a group of pressed buttons, not role="tab": the ARIA tabs pattern owes
          the reader arrow-key navigation, and these read as filter chips */}
      <div className="role-tabs" role="group" aria-label={t('misc.whichRoles')}>
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={index === active}
            className={clsx('role-tab', index === active && 'is-active')}
            onClick={() => select(index)}
          >
            <span
              aria-hidden="true"
              className={clsx(
                'corner',
                roleCornerClass[tab.key],
                index === active ? roleTextClass[tab.key] : 'text-primary-600'
              )}
            />
            {tab.label}
            <span className="tabular text-primary-400">
              {tab.count === null ? '·' : t.number(tab.count)}
            </span>
          </button>
        ))}
      </div>

      {/* every panel stays in the html: a crawler reads all three lists, not the open one */}
      {panels.map((panel, index) => (
        <div key={tabs[index]?.key ?? index} className={clsx(index !== active && 'hidden')}>
          {panel}
        </div>
      ))}
    </div>
  );
};
