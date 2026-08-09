'use client';

import { FC, ReactNode, useMemo, useState } from 'react';
import { ChevronDownIcon, SearchIcon } from '@/components/Icons';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { useUserListData } from '@/hooks/useUserListData';
import { User, UserListProps } from '@/misc/Interfaces';
import { ROLES, RoleKey, roleByLabel, roleCornerClass, roleTextClass } from '@/misc/roles';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FixedSizeList as List } from 'react-window';
import clsx from 'clsx';

/**
 * A column and a direction, not six sort keys — and the control for it is the
 * column heading itself (see SortHeader), not a menu.
 *
 * This went through a dropdown listing all six combinations, then a dropdown
 * of three columns that flipped when you picked the active one. Both were
 * inventions: a list with headed columns already has a place readers look to
 * sort, and it is the heading.
 *
 * `ends` names the two directions in the column's own terms: "newest" means
 * something for a date and nothing for a name. It is what the heading's
 * accessible label reads out.
 */
const COLUMNS = {
  granted: {
    label: 'Granted',
    // the end a column starts at when you first sort by it. dates and counts
    // open at the big end, names at A — picking "Account" and being handed
    // z-to-a because the last column happened to be descending is a puzzle.
    opens: 'desc',
    ends: { desc: 'newest first', asc: 'oldest first' },
    compare: (a: User, b: User) => grantedAt(a) - grantedAt(b)
  },
  followers: {
    label: 'Followers',
    opens: 'desc',
    ends: { desc: 'most first', asc: 'fewest first' },
    compare: (a: User, b: User) => (a.follower || 0) - (b.follower || 0)
  },
  name: {
    label: 'Name',
    opens: 'asc',
    ends: { desc: 'z to a', asc: 'a to z' },
    compare: (a: User, b: User) => a.login.localeCompare(b.login)
  }
} as const;

type ColumnKey = keyof typeof COLUMNS;
type Direction = 'asc' | 'desc';

/**
 * all / hide / only. "only" is not symmetry for its own sake — "which bots does
 * this channel run" is a question people actually arrive with, and until now
 * the answer was to hide everything else by eye.
 */
const BOT_MODES = ['all', 'hide', 'only'] as const;
type BotMode = (typeof BOT_MODES)[number];

const BOT_MODES_LABEL: Record<BotMode, string> = {
  all: 'shown',
  hide: 'hidden',
  only: 'only'
};

const matches = (user: User, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return (
    user.login.toLowerCase().includes(needle) ||
    (user.name ?? '').toLowerCase().includes(needle)
  );
};

/**
 * a missing grant date sorts to the far end rather than to 1970. twitch returns
 * none for a large share of older roles, and the previous comparator passed
 * those through `new Date('1970-01-01')`, which buried every real answer under
 * the ones it knew nothing about.
 */
const grantedAt = (user: User): number => {
  if (!user.granted) return Number.NEGATIVE_INFINITY;

  const time = new Date(user.granted).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
};

/**
 * A column heading that sorts. Pressing the active one reverses it.
 *
 * `aria-pressed` rather than `aria-sort`: this is a grid of divs, not a table,
 * and `aria-sort` on something that is not a columnheader inside a table role
 * announces nothing. The label spells out the state instead, which works
 * everywhere.
 */
const SortHeader: FC<{
  column: ColumnKey;
  label: string;
  align?: 'right';
  active: ColumnKey;
  direction: Direction;
  onSort: (column: ColumnKey) => void;
}> = ({ column, label, align, active, direction, onSort }) => {
  const isActive = active === column;

  return (
    <span className={clsx(align === 'right' && 'text-right')}>
      <button
        type="button"
        className={clsx('col-sort', isActive && 'is-active')}
        aria-label={
          isActive
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

/** the corner, the name and whatever the panel wants on the right of them */
const PanelHeading: FC<{
  roleKey: RoleKey;
  title: string;
  className?: string;
  children?: ReactNode;
}> = ({ roleKey, title, className, children }) => (
  <div className={clsx('flex items-center gap-3 flex-wrap', className)}>
    <span
      aria-hidden="true"
      className={clsx('corner', roleCornerClass[roleKey], roleTextClass[roleKey])}
    />
    <h2 className="text-h2">{title}</h2>
    {children}
  </div>
);

export const UserList: FC<UserListProps> = ({ type, role, user }) => {
  const { users, isLoading, error, reload } = useUserListData(user, type, role);

  const roleKey = roleByLabel(role) ?? 'mod';
  const title = type === 'channel' ? ROLES[roleKey].channelTitle : ROLES[roleKey].userTitle;

  // a channel's members are the answer to "when did each of these happen", so
  // the grant date is the axis worth defaulting to. the channels a person holds
  // a role in have no shared timeline, so those default to reach.
  const [column, setColumn] = useState<ColumnKey>(
    type === 'channel' ? 'granted' : 'followers'
  );
  const [direction, setDirection] = useState<Direction>('desc');

  // filtered rather than removed from state, so changing your mind needs no
  // refetch and the sort still applies to whatever is left.
  const [botMode, setBotMode] = useState<BotMode>('all');
  const [query, setQuery] = useState('');

  const botCount = useMemo(() => users.filter((entry) => entry.bot).length, [users]);

  const visibleUsers = useMemo(() => {
    const filtered = users.filter(
      (entry) =>
        matches(entry, query) &&
        (botMode === 'all' || (botMode === 'only' ? entry.bot : !entry.bot))
    );

    // no debounce: this is one pass over an array that is already in memory,
    // and a delay between typing and the list moving reads as lag
    const compare = COLUMNS[column].compare;
    const sorted = [...filtered].sort(compare);

    return direction === 'desc' ? sorted.reverse() : sorted;
  }, [users, query, botMode, column, direction]);

  const searching = query.trim().length > 0;
  const filtered = searching || botMode !== 'all';

  const clear = () => {
    setQuery('');
    setBotMode('all');
  };

  /** pressing the active column reverses it; any other opens at its own end */
  const chooseColumn = (next: ColumnKey) => {
    if (next === column) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setColumn(next);
    setDirection(COLUMNS[next].opens);
  };

  if (isLoading) {
    return (
      <div className="panel-flush" aria-busy="true">
        <PanelHeading roleKey={roleKey} title={title} className="px-4 pb-5">
          <span className="ml-auto text-ui text-primary-400">
            {type === 'channel' ? 'reading from twitch' : 'reading the index'}
          </span>
        </PanelHeading>
        <UserListLoading type={type} />
      </div>
    );
  }

  // one list failing does not take the page down, so the message names which
  // list, what happened, that the rest is intact, and the one thing to do.
  if (error) {
    return (
      <div className="panel">
        <PanelHeading roleKey={roleKey} title={title} className="mb-4">
          <span className="ml-auto text-ui text-vip">could not be read</span>
        </PanelHeading>
        <p className="text-read text-primary-300 max-w-prose mb-2">
          {type === 'channel'
            ? 'Twitch returned an error for this query.'
            : 'The index could not be read for this list.'}
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

  /**
   * Only when the list itself is empty — NOT when a filter emptied it.
   *
   * Those two used to share this branch, and it dropped the toolbar with the
   * rows: type one character too many, the search box you were typing into
   * disappears, and the only way back is a link in the message. A filtered-empty
   * list keeps its controls and puts the message where the rows were.
   */
  if (users.length === 0) {
    return (
      <div className="panel">
        <PanelHeading roleKey={roleKey} title={title} className="mb-4">
          <span className="text-lead text-primary-400 tabular">0</span>
        </PanelHeading>

        {roleKey === 'founder' ? (
          // the empty founders list is the one that needs explaining: it is read
          // by a different twitch query than mods and vips, on a slower
          // schedule, so empty here means not read yet rather than none exist.
          <p className="text-read text-primary-300 max-w-prose">
            None read yet. Founder badges come from a different twitch query than
            mods and vips, and it runs on a slower schedule. An empty list here
            means not yet read, not none exist.
          </p>
        ) : (
          <p className="text-read text-primary-300 max-w-prose">None read yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="panel-flush">
      <PanelHeading roleKey={roleKey} title={title} className="px-4 pb-4">
        {/* "3 of 28" only while something is filtering. a bare count that
            silently means "matches" is how a reader concludes a channel lost
            its moderators. */}
        <span className="text-lead text-primary-400 tabular">
          {visibleUsers.length}
          {filtered && <span className="text-ui"> of {users.length}</span>}
        </span>

        <span className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          <label className="search-inline">
            <SearchIcon size={13} color="text-primary-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find an account"
              aria-label={`Search ${title.toLowerCase()}`}
              autoComplete="off"
            />
          </label>

          {/* A named control, not a bare count. It read "1 bot" before, which
              is a fact about the list rather than something you can press, and
              it went unfound. Only offered when it would do something.

              see ProfileDropdown: the default scroll lock releases the
              scrollbar gutter and shifts the page sideways on open */}
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
        // the filters emptied it. the message goes where the rows were, and the
        // toolbar above stays put so the search can be corrected rather than
        // abandoned.
        <p className="px-4 pb-6 text-read text-primary-300 max-w-prose">
          {searching
            ? `Nothing here matches “${query.trim()}”.`
            : botMode === 'only'
              ? 'No bots in this list.'
              : 'Every account in this list is a bot.'}{' '}
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
          {/* Sorting lives on the column headings, which is where a reader
              already expects it and what every table has done for thirty
              years. It replaced a dropdown that listed the three columns and
              flipped the direction if you picked the one already active —
              a rule that had to be explained in the menu to be found at all.

              Below 640px the followers column is hidden (globals.css), so it
              stops being sortable there too. Sorting by a column you cannot
              see would reorder the rows for no visible reason. */}
          <div className="row-head cols-people">
            <SortHeader
              column="name"
              label={type === 'channel' ? 'Account' : 'Channel'}
              active={column}
              direction={direction}
              onSort={chooseColumn}
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
            />
          </div>

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
        </div>
      )}

      {/* under the rows, because a list that is quietly shorter than its own
          count is worth saying out loud. the search says how many it dropped;
          the bot filter says which kind. */}
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
