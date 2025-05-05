'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { FilterIcon, ReloadIcon, Sort01Icon, Sort10Icon, SortAZIcon, SortNewOldIcon, SortOldNewIcon, SortZAIcon } from '@/components/Icons';
import { Title } from '@/components/UI/Title';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { useUserListData } from '@/hooks/useUserListData';
import { User, UserListProps } from '@/misc/Interfaces';
import { Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FixedSizeList as List } from 'react-window';

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
        <div className="cursor-pointer"><FilterIcon size={24} /></div>
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

  return (
    <div className="relative p-4 pr-2 border-1 border-primary-700 rounded-lg">
      {!isLoading && !error && !!users.length && (
        <div className="absolute top-[1.4rem] left-[1.4rem]">
          <UserDropdown onSort={handleSort} />
        </div>
      )}
      {!isLoading && !error && type === 'channel' && (
        <div className="absolute top-[1.4rem] right-[1.4rem] cursor-pointer" onClick={reload}>
          <ReloadIcon size={24} />
        </div>
      )}
      <Title level={2} size="lg" className="text-center uppercase">
        {role}
      </Title>
      <Divider className="w-1/2 mx-auto my-2" />
      {error && (
        <p className="text-center mt-1 mb-2 text-large text-red-500">{error}</p>
      )}
      {isLoading && <UserListLoading />}
      {!isLoading && !error && (
        <>
          <p className="text-center mt-1 mb-2 text-large">
            {users.length} {role}
          </p>
          <List
            height={users.length ? Math.min(users.length * 72, 512) : 0}
            itemCount={users.length}
            itemSize={72}
            width="100%"
          >
            {({ index, style }) => (
              <div style={style}>
                <UserListItem user={users[index]} />
              </div>
            )}
          </List>
        </>
      )}
    </div>
  );
};
