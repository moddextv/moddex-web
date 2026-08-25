'use client';

import { useT } from '@/i18n';
import { FC, ReactNode } from 'react';
import { ChevronDownIcon, SearchIcon } from '@/components/Icons';
import { BotMode, ColumnKey, Direction } from '@/components/User/columns';
import { showListTotal } from '@/components/User/listCount';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { MIN_SEARCH_LENGTH } from '@/hooks/pageQuery';
import { PAGE_SIZE, useUserListData } from '@/hooks/useUserListData';
import { useUserListView } from '@/hooks/useUserListView';
import { UserListProps } from '@/misc/account';
import { RoleKey, roleByLabel, roleCornerClass, roleTextClass } from '@/misc/roles';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FixedSizeList as List } from 'react-window';
import clsx from 'clsx';

const SortHeader: FC<{
  column: ColumnKey;
  label: string;
  align?: 'right';
  active: ColumnKey;
  direction: Direction;
  onSort: (column: ColumnKey) => void;
  disabled?: boolean;
  disabledReason?: string;
}> = ({ column, label, align, active, direction, onSort, disabled, disabledReason }) => {
  const t = useT();
  const reason = disabledReason ?? t('controls.sort.tooLong', { label: label.toLowerCase() });
  const isActive = active === column && !disabled;

  return (
    <span className={clsx(align === 'right' && 'text-right')}>
      <button
        type="button"
        disabled={disabled}
        className={clsx('col-sort', isActive && 'is-active', disabled && 'is-disabled')}
        title={disabled ? t('controls.sort.disabledTitle', { reason }) : undefined}
        aria-label={
          disabled
            ? t('controls.sort.disabledAria', { label, reason })
            : isActive
              ? t('controls.sort.activeAria', {
                  label: label.toLowerCase(),
                  ends: t(`controls.columns.${column}.${direction}`)
                })
              : t('controls.sort.idleAria', { label: label.toLowerCase() })
        }
        onClick={() => onSort(column)}
      >
        {label}
        <span aria-hidden="true" className={clsx('col-arrow', isActive && 'is-active')}>
          {isActive && direction === 'asc' ? '↑' : '↓'}
        </span>
      </button>
    </span>
  );
};

// inside the role tabs the tab already carries the corner, the name and the
// count, so repeating them here made three bands say the same thing
const PanelHeading: FC<{
  roleKey: RoleKey;
  title: string;
  tabbed?: boolean;
  className?: string;
  children?: ReactNode;
}> = ({ roleKey, title, tabbed, className, children }) => (
  <div className={clsx('flex items-center gap-3 flex-wrap', className)}>
    {!tabbed && (
      <>
        <span
          aria-hidden="true"
          className={clsx('corner', roleCornerClass[roleKey], roleTextClass[roleKey])}
        />
        <h2 className="text-h2">{title}</h2>
      </>
    )}
    {children}
  </div>
);

// three whole sentences rather than four fragments glued together, because
// the pieces do not survive a translation in that order
const hiddenByKey = (searching: boolean, bots: boolean): string => {
  if (searching && bots) return 'misc.hiddenBySearchAndBots';

  return searching ? 'misc.hiddenBySearch' : 'misc.hiddenByBots';
};

export const UserList: FC<UserListProps> = ({ type, role, user, initial, tabbed }) => {
  const t = useT();
  const {
    users,
    isLoading,
    isLoadingMore,
    error,
    reload,
    paged,
    hasMore,
    total,
    loadMore,
    setServerSort,
    setServerSearch
  } = useUserListData(user, type, role, initial);

  const roleKey = roleByLabel(role) ?? 'mod';
  // ROLES carries the domain model, not the copy: a heading is a message
  const title = t(`roles.title.${type === 'channel' ? 'channel' : 'user'}.${roleKey}`);

  const {
    column,
    direction,
    botMode,
    setBotMode,
    query,
    setQuery,
    botCount,
    visibleUsers,
    searching,
    filtered,
    canClear,
    clear,
    chooseColumn
  } = useUserListView(users, paged, type, setServerSort, setServerSearch);

  const showTotal = showListTotal(total, visibleUsers.length);

  if (isLoading) {
    return (
      <div className="panel-flush" aria-busy="true">
        <PanelHeading roleKey={roleKey} title={title} tabbed={tabbed} className="px-4 pb-5">
          <span className="ml-auto text-ui text-primary-400">{t('misc.readingIndex')}</span>
        </PanelHeading>
        <UserListLoading type={type} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <PanelHeading roleKey={roleKey} title={title} tabbed={tabbed} className="mb-4">
          <span className="ml-auto text-ui text-vip">{t('errors.couldNotRead')}</span>
        </PanelHeading>
        <p className="text-read text-primary-300 max-w-prose mb-2">{t('errors.listUnread')}</p>
        <p className="text-ui text-primary-400 mb-5">{t('errors.otherListsFine')}</p>
        <button type="button" className="btn btn-soft" onClick={reload}>
          {t('errors.tryListAgain')}
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="panel">
        <PanelHeading roleKey={roleKey} title={title} tabbed={tabbed} className="mb-4">
          {!tabbed && <span className="text-lead text-primary-400 tabular">0</span>}
        </PanelHeading>

        {roleKey === 'founder' ? (
          <p className="text-read text-primary-300 max-w-prose">{t('misc.noFoundersRead')}</p>
        ) : (
          <p className="text-read text-primary-300 max-w-prose">{t('misc.noneRead')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="panel-flush">
      <PanelHeading roleKey={roleKey} title={title} tabbed={tabbed} className="px-4 pb-4">
        {/* tabbed and unfiltered, the tab's own count already says this */}
        {(!tabbed || filtered || paged) && (
          <span className="text-lead text-primary-400 tabular">
            {visibleUsers.length}
            {filtered && (
              <span className="text-ui"> {t('misc.ofTotal', { total: users.length })}</span>
            )}
            {paged && showTotal && (
              <span className="text-ui"> {t('misc.ofTotal', { total: t.number(total) })}</span>
            )}
            {paged && !showTotal && <span className="text-ui"> {t('misc.loaded')}</span>}
          </span>
        )}

        <span className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <label className="search-inline">
            <SearchIcon size={13} color="text-primary-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                paged
                  ? t('misc.loginStartsWith')
                  : type === 'user'
                    ? t('misc.findChannel')
                    : t('misc.findAccount')
              }
              aria-label={
                paged
                  ? `Search ${title.toLowerCase()} by the start of their login, at least 3 characters`
                  : `Search ${title.toLowerCase()}`
              }
              autoComplete="off"
            />
          </label>

          {paged && query.trim().length > 0 && query.trim().length < MIN_SEARCH_LENGTH && (
            <span className="text-ui text-primary-400">
              {t('misc.keepTyping', { min: MIN_SEARCH_LENGTH })}
            </span>
          )}

          {botCount > 0 && (
            <Dropdown type="listbox" placement="bottom-end" shouldBlockScroll={false}>
              <DropdownTrigger>
                <button
                  type="button"
                  className="chip"
                  aria-label={t('controls.botsAria', { state: t(`controls.botModes.${botMode}`) })}
                >
                  {t('controls.bots', { state: t(`controls.botModes.${botMode}`) })}
                  <ChevronDownIcon size={11} />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={t('misc.whichAccounts')}
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([botMode])}
                onSelectionChange={(keys) => {
                  const [next] = Array.from(keys as Set<string>);
                  if (next) setBotMode(next as BotMode);
                }}
              >
                <DropdownItem key="all" textValue={t('misc.showBots')}>
                  {t('misc.showBots')}
                </DropdownItem>
                <DropdownItem key="hide" textValue={t('misc.hideBots')}>
                  {t('misc.hideBotCount', { count: botCount })}
                </DropdownItem>
                <DropdownItem key="only" textValue={t('misc.onlyBots')}>
                  {t('misc.onlyBots')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}

          {canClear && (
            <button type="button" className="chip" onClick={clear}>
              {t('common.clear')}
            </button>
          )}
        </span>
      </PanelHeading>

      {visibleUsers.length === 0 ? (
        <p className="px-4 pb-6 text-read text-primary-300 max-w-prose">
          {paged
            ? t('misc.noLoginStartsWith', { query: query.trim() })
            : searching
              ? t('misc.nothingMatches', { query: query.trim() })
              : botMode === 'only'
                ? t('misc.noBotsInList')
                : t('misc.allBots')}{' '}
          <button
            type="button"
            className="text-primary-200 font-semibold hover:underline"
            onClick={clear}
          >
            {t('controls.clearFilters')}
          </button>
        </p>
      ) : (
        <div className="rows">
          <div className="row-head cols-people">
            <SortHeader
              column="name"
              label={
                type === 'channel' ? t('controls.columns.account') : t('controls.columns.channel')
              }
              active={column}
              direction={direction}
              onSort={chooseColumn}
              disabled={paged}
            />
            <SortHeader
              column="granted"
              label={t('controls.columns.granted.label')}
              align="right"
              active={column}
              direction={direction}
              onSort={chooseColumn}
            />
            <SortHeader
              column="followers"
              label={t('controls.columns.followers.label')}
              align="right"
              active={column}
              direction={direction}
              onSort={chooseColumn}
              disabled={paged && type === 'channel'}
              disabledReason={t('controls.sort.tooLongFollowers')}
            />
          </div>

          {/* one page renders plainly, or the server html holds only what fits a viewport */}
          {visibleUsers.length <= PAGE_SIZE ? (
            <div>
              {visibleUsers.map((entry) => (
                <UserListItem key={entry.id} user={entry} type={type} />
              ))}
            </div>
          ) : (
            <List
              height={Math.min(visibleUsers.length * 52, 520)}
              itemCount={visibleUsers.length}
              itemSize={52}
              width="100%"
            >
              {({ index, style }) => {
                const user = visibleUsers[index];

                return <div style={style}>{user && <UserListItem user={user} type={type} />}</div>;
              }}
            </List>
          )}
        </div>
      )}

      {paged && visibleUsers.length > 0 && (
        <div className="px-4 py-4 flex items-center gap-3">
          {hasMore ? (
            <button
              type="button"
              className="btn btn-soft"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? t('common.loading') : t('misc.loadMoreCount', { count: PAGE_SIZE })}
            </button>
          ) : (
            <span className="text-ui text-primary-400">{t('misc.endOfList')}</span>
          )}
        </div>
      )}

      {filtered && visibleUsers.length > 0 && (
        <p className="px-4 py-4 text-ui text-primary-400">
          {t(hiddenByKey(searching, botMode !== 'all'), {
            hidden: users.length - visibleUsers.length,
            total: users.length
          })}{' '}
          <button
            type="button"
            className="text-primary-200 font-semibold hover:underline"
            onClick={clear}
          >
            {t('misc.showEverything')}
          </button>
        </p>
      )}
    </div>
  );
};
