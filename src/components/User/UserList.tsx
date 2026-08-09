'use client';

import { FC, ReactNode, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@/components/Icons';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { useUserListData } from '@/hooks/useUserListData';
import { User, UserListProps } from '@/misc/Interfaces';
import { ROLES, RoleKey, roleByLabel, roleCornerClass, roleTextClass } from '@/misc/roles';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FixedSizeList as List } from 'react-window';
import clsx from 'clsx';

/**
 * `chip` is the column the sort acts on and is what the closed control shows;
 * `label` is the full sentence inside the menu. two sorts share a chip because
 * a reader scanning the header wants to know which column is ordering the list,
 * not which end it starts from.
 */
const SORTS = [
  {
    key: 'granted-desc',
    chip: 'Granted',
    label: 'granted, newest first',
    compare: (a: User, b: User) => grantedAt(b) - grantedAt(a)
  },
  {
    key: 'granted-asc',
    chip: 'Granted',
    label: 'granted, oldest first',
    compare: (a: User, b: User) => grantedAt(a) - grantedAt(b)
  },
  {
    key: 'followers-desc',
    chip: 'Followers',
    label: 'followers, most first',
    compare: (a: User, b: User) => (b.follower || 0) - (a.follower || 0)
  },
  {
    key: 'followers-asc',
    chip: 'Followers',
    label: 'followers, fewest first',
    compare: (a: User, b: User) => (a.follower || 0) - (b.follower || 0)
  },
  {
    key: 'name-asc',
    chip: 'Name',
    label: 'name, a to z',
    compare: (a: User, b: User) => a.login.localeCompare(b.login)
  },
  {
    key: 'name-desc',
    chip: 'Name',
    label: 'name, z to a',
    compare: (a: User, b: User) => b.login.localeCompare(a.login)
  }
] as const;

type SortKey = (typeof SORTS)[number]['key'];

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
  const [sortKey, setSortKey] = useState<SortKey>(
    type === 'channel' ? 'granted-desc' : 'followers-desc'
  );

  // filtered rather than removed from state, so toggling back needs no refetch
  // and the sort still applies to the full set.
  const [hideBots, setHideBots] = useState(false);
  const botCount = useMemo(() => users.filter((entry) => entry.bot).length, [users]);

  const visibleUsers = useMemo(() => {
    const compare = SORTS.find((sort) => sort.key === sortKey)?.compare;
    const filtered = hideBots ? users.filter((entry) => !entry.bot) : users;

    return compare ? [...filtered].sort(compare) : filtered;
  }, [users, hideBots, sortKey]);

  const activeSort = SORTS.find((sort) => sort.key === sortKey) ?? SORTS[0];

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

  if (visibleUsers.length === 0) {
    return (
      <div className="panel">
        <PanelHeading roleKey={roleKey} title={title} className="mb-4">
          <span className="text-lead text-primary-400 tabular">0</span>
        </PanelHeading>

        {users.length > 0 ? (
          <p className="text-read text-primary-300 max-w-prose">
            Every account in this list is a bot.{' '}
            <button
              type="button"
              className="text-primary-200 font-semibold hover:underline"
              onClick={() => setHideBots(false)}
            >
              Show them
            </button>
          </p>
        ) : roleKey === 'founder' ? (
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
      <PanelHeading roleKey={roleKey} title={title} className="px-4 pb-5">
        <span className="text-lead text-primary-400 tabular">{visibleUsers.length}</span>

        <span className="ml-auto flex items-center gap-2">
          {/* only offered when it would do something. a dead toggle on a list
              with no bots in it is noise. */}
          {botCount > 0 && (
            <button
              type="button"
              className="chip"
              aria-pressed={hideBots}
              onClick={() => setHideBots((hidden) => !hidden)}
            >
              {hideBots
                ? 'Bots hidden'
                : `Hide ${botCount} ${botCount === 1 ? 'bot' : 'bots'}`}
            </button>
          )}

          {/* see ProfileDropdown: the default scroll lock releases the
              scrollbar gutter and shifts the page sideways on open */}
          <Dropdown type="listbox" placement="bottom-end" shouldBlockScroll={false}>
            <DropdownTrigger>
              <button
                type="button"
                className="chip"
                aria-label={`Sorted by ${activeSort.label}. Change the sort.`}
              >
                {activeSort.chip}
                <ChevronDownIcon size={11} />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort this list"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([sortKey])}
              onSelectionChange={(keys) => {
                const [next] = Array.from(keys as Set<string>);
                if (next) setSortKey(next as SortKey);
              }}
            >
              {SORTS.map((sort) => (
                <DropdownItem key={sort.key} textValue={sort.label}>
                  {sort.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </span>
      </PanelHeading>

      <div className="rows">
        <div className="row-head cols-people">
          <span>{type === 'channel' ? 'Account' : 'Channel'}</span>
          <span className="text-right">Granted</span>
          <span className="text-right">Followers</span>
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

      {hideBots && botCount > 0 && (
        <p className="px-4 py-4 text-ui text-primary-400">
          {botCount} bot {botCount === 1 ? 'account' : 'accounts'} hidden.{' '}
          <button
            type="button"
            className="text-primary-200 font-semibold hover:underline"
            onClick={() => setHideBots(false)}
          >
            Show them
          </button>
        </p>
      )}
    </div>
  );
};
