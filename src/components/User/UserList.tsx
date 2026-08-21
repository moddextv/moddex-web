'use client';

import { FC, ReactNode } from 'react';
import { ChevronDownIcon, SearchIcon } from '@/components/Icons';
import { BOT_MODES_LABEL, BotMode, COLUMNS, ColumnKey, Direction } from '@/components/User/columns';
import { showListTotal } from '@/components/User/listCount';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { MIN_SEARCH_LENGTH } from '@/hooks/pageQuery';
import { PAGE_SIZE, useUserListData } from '@/hooks/useUserListData';
import { useUserListView } from '@/hooks/useUserListView';
import { UserListProps } from '@/misc/account';
import { ROLES, RoleKey, roleByLabel, roleCornerClass, roleTextClass } from '@/misc/roles';
import { formatNumber } from '@/utils/format';
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
  const reason = disabledReason ?? `too long to sort by ${label.toLowerCase()}`;
  const isActive = active === column && !disabled;

  return (
    <span className={clsx(align === 'right' && 'text-right')}>
      <button
        type="button"
        disabled={disabled}
        className={clsx('col-sort', isActive && 'is-active', disabled && 'is-disabled')}
        title={disabled ? `This list is ${reason}` : undefined}
        aria-label={
          disabled
            ? `${label}. This list is ${reason}.`
            : isActive
              ? `Sorted by ${label.toLowerCase()}, ${COLUMNS[column].ends[direction]}. Press to reverse.`
              : `Sort by ${label.toLowerCase()}`
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

export const UserList: FC<UserListProps> = ({ type, role, user, initial, tabbed }) => {
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
  const title = type === 'channel' ? ROLES[roleKey].channelTitle : ROLES[roleKey].userTitle;

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
    clear,
    chooseColumn
  } = useUserListView(users, paged, type, setServerSort, setServerSearch);

  const showTotal = showListTotal(total, visibleUsers.length);

  if (isLoading) {
    return (
      <div className="panel-flush" aria-busy="true">
        <PanelHeading roleKey={roleKey} title={title} tabbed={tabbed} className="px-4 pb-5">
          <span className="ml-auto text-ui text-primary-400">reading the index</span>
        </PanelHeading>
        <UserListLoading type={type} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <PanelHeading roleKey={roleKey} title={title} tabbed={tabbed} className="mb-4">
          <span className="ml-auto text-ui text-vip">could not be read</span>
        </PanelHeading>
        <p className="text-read text-primary-300 max-w-prose mb-2">
          We couldn&apos;t read the index for this list.
        </p>
        <p className="text-ui text-primary-400 mb-5">
          The other lists on this page are unaffected.
        </p>
        <button type="button" className="btn btn-soft" onClick={reload}>
          Try this list again
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
          <p className="text-read text-primary-300 max-w-prose">
            None read yet. Founder badges come from a different Twitch query than mods and vips, and
            it runs on a slower schedule. So an empty list here means we haven&apos;t read them yet,
            not that there are none.
          </p>
        ) : (
          <p className="text-read text-primary-300 max-w-prose">None read yet.</p>
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
            {filtered && <span className="text-ui"> of {users.length}</span>}
            {paged && showTotal && <span className="text-ui"> of {formatNumber(total)}</span>}
            {paged && !showTotal && <span className="text-ui"> loaded</span>}
          </span>
        )}

        <span className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <label className="search-inline">
            <SearchIcon size={13} color="text-primary-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={paged ? 'Login starts with…' : 'Find an account'}
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
              Keep typing, {MIN_SEARCH_LENGTH} characters minimum
            </span>
          )}

          {botCount > 0 && (
            <Dropdown type="listbox" placement="bottom-end" shouldBlockScroll={false}>
              <DropdownTrigger>
                <button
                  type="button"
                  className="chip"
                  aria-label={`Bots: ${BOT_MODES_LABEL[botMode]}. Change which accounts are listed.`}
                >
                  Bots: {BOT_MODES_LABEL[botMode]}
                  <ChevronDownIcon size={11} />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Which accounts to list"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([botMode])}
                onSelectionChange={(keys) => {
                  const [next] = Array.from(keys as Set<string>);
                  if (next) setBotMode(next as BotMode);
                }}
              >
                <DropdownItem key="all" textValue="Show bots">
                  Show bots
                </DropdownItem>
                <DropdownItem key="hide" textValue="Hide bots">
                  Hide {botCount} {botCount === 1 ? 'bot' : 'bots'}
                </DropdownItem>
                <DropdownItem key="only" textValue="Only bots">
                  Only bots
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}

          {filtered && (
            <button type="button" className="chip" onClick={clear}>
              Clear
            </button>
          )}
        </span>
      </PanelHeading>

      {visibleUsers.length === 0 ? (
        <p className="px-4 pb-6 text-read text-primary-300 max-w-prose">
          {paged ? (
            <>
              No login in this list starts with &quot;{query.trim()}&quot;. This list searches the
              start of a login, not any part of a name.
            </>
          ) : searching ? (
            `Nothing here matches "${query.trim()}".`
          ) : botMode === 'only' ? (
            'No bots in this list.'
          ) : (
            'Every account in this list is a bot.'
          )}{' '}
          <button
            type="button"
            className="text-primary-200 font-semibold hover:underline"
            onClick={clear}
          >
            Clear the filters
          </button>
        </p>
      ) : (
        <div className="rows">
          <div className="row-head cols-people">
            <SortHeader
              column="name"
              label={type === 'channel' ? 'Account' : 'Channel'}
              active={column}
              direction={direction}
              onSort={chooseColumn}
              disabled={paged}
            />
            <SortHeader
              column="granted"
              label="Granted"
              align="right"
              active={column}
              direction={direction}
              onSort={chooseColumn}
            />
            <SortHeader
              column="followers"
              label="Followers"
              align="right"
              active={column}
              direction={direction}
              onSort={chooseColumn}
              disabled={paged && type === 'channel'}
              disabledReason="too long to sort by follower count"
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
              {({ index, style }) => (
                <div style={style}>
                  <UserListItem user={visibleUsers[index]} type={type} />
                </div>
              )}
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
              {isLoadingMore ? 'Loading…' : `Load ${PAGE_SIZE} more`}
            </button>
          ) : (
            <span className="text-ui text-primary-400">That&apos;s the end of this list.</span>
          )}
        </div>
      )}

      {filtered && visibleUsers.length > 0 && (
        <p className="px-4 py-4 text-ui text-primary-400">
          {users.length - visibleUsers.length} of {users.length} hidden by the
          {searching && ' search'}
          {searching && botMode !== 'all' && ' and the'}
          {botMode !== 'all' && ' bot filter'}.{' '}
          <button
            type="button"
            className="text-primary-200 font-semibold hover:underline"
            onClick={clear}
          >
            Show everything
          </button>
        </p>
      )}
    </div>
  );
};
