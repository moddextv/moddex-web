'use client';

import { ReloadIcon } from '@/components/Icons';
import { Title } from '@/components/UI/Title';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { useUserListData } from '@/hooks/useUserListData';
import { UserListProps } from '@/misc/Interfaces';
import { Divider } from '@nextui-org/react';
import { FC } from 'react';

export const UserList: FC<UserListProps> = ({ type, role, user }) => {
  const { users, isLoading, error, reload } = useUserListData(user, type, role);

  return (
    <div className="relative p-4 pr-2 border-1 border-primary-700 rounded-lg">
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
          <div className="md:max-h-[32rem] overflow-y-auto flex flex-col gap-4">
            {users.map((user, index) => (
              <UserListItem key={index} user={user} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
