'use client';

import { FC, useCallback, useState } from 'react';
import { UserList } from '@/components/User/UserList';
import { Button } from '@nextui-org/react';
import { User } from '@/misc/Interfaces';

interface UserListsProps {
  user: User;
}

export const UserLists: FC<UserListsProps> = ({ user }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);

  const reload = useCallback(() => {
    setReloadKey((prevKey) => prevKey + 1);
    setForceRefresh(true);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList
          key={`${reloadKey}-mods`}
          type="channel"
          role="mods"
          user={user}
          forceRefresh={forceRefresh}
          setForceRefresh={setForceRefresh}
        />
        <UserList
          key={`${reloadKey}-vips`}
          type="channel"
          role="vips"
          user={user}
          forceRefresh={forceRefresh}
          setForceRefresh={setForceRefresh}
        />
      </div>

      <p className="text-large mt-4">
        can&apos;t find a mod/vip in the list? you can update the channel&apos;s
        mod/vip list here.
      </p>
      <p className="text-sm text-primary-500">
        please note, acquiring all user data may take some time.
      </p>
      <Button className="mt-2" onClick={reload}>
        reload mods/vips
      </Button>
    </>
  );
};
