'use client';

import Image from 'next/image';
 import { FC, useEffect, useState } from 'react';
import { Badges } from '@/components/User/Badges';
import { SvgIcon } from '@/components/Icons/SvgIcon';
import { UserListLoading } from '@/components/User/UserListLoading';
import { User, UserListProps } from '@/misc/Interfaces';
import { fetchUserListData } from '@/actions/fetchUserListData';
import { formatDate } from '@/utils/utils';
import { Tooltip } from '@/components/Tooltip';

export const UserList: FC<UserListProps> = ({ type, role, user }) => {

  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUserListData(user, type, role)
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(true);
        setIsLoading(false);
      });
  }, [user, type, role]);

  return (
    <div className={role}>
      <h2>{role}</h2>
      <hr />
      {error ? (
        <p className="summary error">Something went wrong with this request</p>
      ) : isLoading ? (
        <UserListLoading />
      ) : (
        <>
          <p className="summary">{users.length} {role}</p>
          <div className="list">
            {users.map((user, index) => (
              <div key={index} className="channel">
                <Image src={user.avatar} className="avatar" alt={`${user.login}'s avatar`} width={50}
                       height={50} />
                <div className="details">
                  <div className="user">
                    <h4><a href={`./${user.login}`}>{user.name}</a></h4>
                    <Badges badges={user.badges} size={25} />
                  </div>
                  <Tooltip content={`since ${formatDate(user.granted)}`} placement="top">
                    <SvgIcon name="clock" size={20} />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};