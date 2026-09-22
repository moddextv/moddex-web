'use client';

import { useT } from '@/i18n/context';
import { FC, ReactNode } from 'react';
import { SearchIcon } from '@/components/Icons';
import { ColumnKey, Direction } from '@/components/User/columns';
import { ListFilters } from '@/components/User/ListFilters';
import { showListTotal } from '@/components/User/listCount';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { MIN_SEARCH_LENGTH } from '@/hooks/pageQuery';
import { PAGE_SIZE, useUserListData } from '@/hooks/useUserListData';
import { useUserListView } from '@/hooks/useUserListView';
import { useAction } from '@/hooks/useAction';
import { hideChannel } from '@/actions/settings';
import { UserListProps } from '@/misc/account';
import { RoleKey, roleByLabel, roleCornerClass, roleTextClass } from '@/misc/roles';
import { useSession } from 'next-auth/react';
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
const hiddenByKey = (searching: boolean, filtering: boolean): string => {
  if (searching && filtering) return 'misc.hiddenBySearchAndFilters';

  return searching ? 'misc.hiddenBySearch' : 'misc.hiddenByFilters';
};

export const UserList: FC<UserListProps> = ({ type, role, user, initial, tabbed }) => {
  const t = useT();
  const {
    users,
    dismiss,
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
    filters,
    setFilters,
    counts,
    query,
    setQuery,
    visibleUsers,
    searching,
    filtering,
    filtered,
    canClear,
    clear,
    chooseColumn
  } = useUserListView(users, paged, type, setServerSort, setServerSearch);

  // the owner of the account, on the axis that is theirs: a row may be hidden
  const { data: session } = useSession();
  const owner = type === 'user' && !!session?.user?.id && session.user.id === user.id;
  const hide = useAction(hideChannel);
  const onHide = owner
    ? (id: string) => {
        void hide.run(id).then((result) => {
          if (result?.ok) dismiss(id);
        });
      }
    : undefined;

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
          {/* on the left, so the filter chip and the popover it anchors never move */}
          {canClear && (
            <button type="button" className="chip" onClick={clear}>
              {t('common.clear')}
            </button>
          )}

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

          {!paged && <ListFilters filters={filters} counts={counts} onChange={setFilters} />}
        </span>
      </PanelHeading>

      {visibleUsers.length === 0 ? (
        <p className="px-4 pb-6 text-read text-primary-300 max-w-prose">
          {paged
            ? t('misc.noLoginStartsWith', { query: query.trim() })
            : searching
              ? t('misc.nothingMatches', { query: query.trim() })
              : t('misc.nothingMatchesFilters')}{' '}
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
          <div className={clsx('row-head cols-people', onHide && 'pr-14')}>
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
                <UserListItem key={entry.id} user={entry} type={type} onHide={onHide} />
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

                return (
                  <div style={style}>
                    {user && <UserListItem user={user} type={type} onHide={onHide} />}
                  </div>
                );
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
          {t(hiddenByKey(searching, filtering), {
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
