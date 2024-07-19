import { useState, useEffect, useCallback } from 'react';
import { fetchUserListData } from '@/actions/fetchUserListData';
import { RoleType, User, UserType } from '@/misc/Interfaces';

export const useUserListData = (
  user: User,
  type: UserType,
  role: RoleType,
  forceRefresh: boolean,
  setForceRefresh: (value: boolean) => void
) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (forceRefresh: boolean) => {
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
    },
    [user, type, role, setForceRefresh]
  );

  useEffect(() => {
    fetchData(forceRefresh);
  }, [fetchData, forceRefresh]);

  return { users, isLoading, error };
};
