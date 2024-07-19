'use client';

import { Title } from '@/components/UI/Title';
import { UserListItem } from '@/components/User/UserListItem';
import { UserListLoading } from '@/components/User/UserListLoading';
import { useUserListData } from '@/hooks/useUserListData';
import { UserListProps } from '@/misc/Interfaces';
import { Divider } from '@nextui-org/react';
import { FC } from 'react';

export const UserList: FC<UserListProps> = ({
  type,
  role,
  user,
  forceRefresh,
  setForceRefresh
}) => {
  const { users, isLoading, error } = useUserListData(
    user,
    type,
    role,
    forceRefresh,
    setForceRefresh
  );

  return (
    <div className="p-4 pr-2 border-1 border-primary-700 rounded-lg">
      <Title level={2} size="lg" className="text-center uppercase">
        {role}
      </Title>
      <Divider className="w-1/2 mx-auto my-2" />
      {error && (
        <p className="text-center mt-1 mb-2 text-large text-danger">{error}</p>
      )}
      {isLoading && <UserListLoading />}
      {!isLoading && !error && (
        <>
          <p className="text-center mt-1 mb-2 text-large">
            {users.length} {role}
          </p>
          <div className="max-h-[32rem] overflow-y-auto flex flex-col gap-4">
            {users.map((user, index) => (
              <UserListItem key={index} user={user} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
