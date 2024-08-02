import { useState, useCallback } from 'react';
import { User } from '@/misc/Interfaces';
import { getUsers } from '@/utils/user';

export const useUserProfileData = (initialUser: User) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(false);

  const reloadUserProfile = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    setLoading(true);
    const updatedUser = await getUsers([userId], forceRefresh);
    setCurrentUser(updatedUser?.[0] || null);
    setLoading(false);
  }, []);

  return { currentUser, loading, reloadUserProfile };
};
