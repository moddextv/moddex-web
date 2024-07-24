import { useState, useEffect } from 'react';
import { fetchUserListData } from '@/actions/fetchUserListData';
import { RoleType, User, UserType } from '@/misc/Interfaces';

export const useUserListData = (user: User, type: UserType, role: RoleType) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUserListData(user, type, role, forceRefresh);
        setUsers(data);
      } catch (err) {
        setError('Something went wrong with this request');
      } finally {
        setIsLoading(false);
        setForceRefresh(false);
      }
    };

    fetchData();
  }, [user, type, role, forceRefresh]);

  const reload = () => {
    setForceRefresh(true);
  };

  return { users, isLoading, error, reload };
};
