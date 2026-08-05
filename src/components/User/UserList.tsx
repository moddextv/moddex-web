'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { FilterIcon, ReloadIcon, Sort01Icon, Sort10Icon, SortAZIcon, SortNewOldIcon, SortOldNewIcon, SortZAIcon } from '@/components/Icons';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { useUserListData } from '@/hooks/useUserListData';
import { User, UserListProps } from '@/misc/Interfaces';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FixedSizeList as List } from 'react-window';
import clsx from 'clsx';

const sortAZ = (users: User[]): User[] => [...users].sort((a, b) => a.login.localeCompare(b.login));
const sortZA = (users: User[]): User[] => [...users].sort((a, b) => b.login.localeCompare(a.login));
const sort01 = (users: User[]): User[] => [...users].sort((a, b) => (a.follower || 0) - (b.follower || 0));
const sort10 = (users: User[]): User[] => [...users].sort((a, b) => (b.follower || 0) - (a.follower || 0));
const sortFewMany = (users: User[]): User[] => [...users].sort((a, b) => new Date(a.granted || '1970-01-01').getTime() - new Date(b.granted || '1970-01-01').getTime());
const sortManyFew = (users: User[]): User[] => [...users].sort((a, b) => new Date(b.granted || '1970-01-01').getTime() - new Date(a.granted || '1970-01-01').getTime());

interface UserDropdownProps {
  onSort: (sortFn: (users: User[]) => User[]) => void;
}

const UserDropdown: FC<UserDropdownProps> = ({ onSort }) => {
  const dropdownItems = [
    { label: 'username a-z', icon: <SortAZIcon size={24} />, action: () => onSort(sortAZ) },
    { label: 'username z-a', icon: <SortZAIcon size={24} />, action: () => onSort(sortZA) },
    { label: 'follower few-many', icon: <Sort01Icon size={24} />, action: () => onSort(sort01) },
    { label: 'follower many-few', icon: <Sort10Icon size={24} />, action: () => onSort(sort10) },
    { label: 'granted old-new', icon: <SortOldNewIcon size={24} />, action: () => onSort(sortFewMany) },
    { label: 'granted new-old', icon: <SortNewOldIcon size={24} />, action: () => onSort(sortManyFew) }
  ];

  return (
    <Dropdown type="listbox">
      <DropdownTrigger>
        <button
          type="button"
          aria-label="sort list"
          className="flex items-center justify-center w-7 h-7 rounded-md hover:text-primary-200 transition-colors duration-150 pressable"
        >
          <FilterIcon size={18} />
        </button>
      </DropdownTrigger>
      <DropdownMenu>
        {dropdownItems.map((item, index) => (
          <DropdownItem key={index} onClick={item.action} startContent={item.icon}>
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export const UserList: FC<UserListProps> = ({ type, role, user }) => {
  const { users: initialUsers, isLoading, error, reload } = useUserListData(user, type, role);
  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleSort = useCallback((sortFn: (users: User[]) => User[]) => {
    setUsers((prevUsers) => sortFn(prevUsers));
  }, []);

  // the rows are virtualized, so they mount and unmount constantly while
  // scrolling — animating them individually would re-fire on every scroll.
  // the list arrives as one surface instead.
  const listKey = `${role}-${users.length}`;

  const isMod = role === 'mods' || role === 'modding';

  return (
    <section>
      {/* heading row carries the count and the controls, so the list itself
          can be pure data with nothing floating over it */}
      <div className="flex items-center gap-3 h-8 mb-1">
        {/* a single corner from the mark, oriented per role: mods take the
            top-left bracket, vips the bottom-right — 180° apart, so a channel
            page renders the logo at page scale */}
        <span
          aria-hidden="true"
          className={clsx(
            'w-3 h-3 border-2',
            isMod ? 'border-b-0 border-r-0 border-mod' : 'border-t-0 border-l-0 border-vip'
          )}
        />
        <h2
          className={clsx(
            'text-sm uppercase tracking-wider',
            isMod ? 'text-mod' : 'text-vip'
          )}
        >
          {role}
        </h2>

        {!isLoading && !error && (
          <span className="text-sm text-primary-500 mono">{users.length}</span>
        )}

        <div className="ml-auto flex items-center gap-1 text-primary-400">
          {!isLoading && !error && !!users.length && <UserDropdown onSort={handleSort} />}
          {!isLoading && !error && type === 'channel' && (
            <button
              type="button"
              aria-label={`reload ${role}`}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:text-primary-200 transition-colors duration-150 pressable"
              onClick={reload}
            >
              <ReloadIcon size={18} />
            </button>
          )}
        </div>
      </div>

      {error && <p className="py-3 text-red-400">{error}</p>}
      {isLoading && <UserListLoading />}

      {!isLoading && !error && (
        <div key={listKey} className="enter-item border-t border-primary-700">
          {users.length === 0 ? (
            <p className="py-6 text-sm text-primary-500 mono">
              none tracked yet
            </p>
          ) : (
            <List
              height={Math.min(users.length * 72, 512)}
              itemCount={users.length}
              itemSize={72}
              width="100%"
            >
              {({ index, style }) => (
                <div style={style}>
                  <UserListItem user={users[index]} role={role} />
                </div>
              )}
            </List>
          )}
        </div>
      )}
    </section>
  );
};
