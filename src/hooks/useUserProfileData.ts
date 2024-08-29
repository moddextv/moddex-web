import { useState, useCallback } from 'react';
import { User } from '@/misc/Interfaces';
import { getUser } from '@/utils/user';

export const useUserProfileData = (initialUser: User) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(false);
  const [banReason, setBanReason] = useState<string | undefined>(undefined);

  const reloadUserProfile = useCallback(async (username: string, forceRefresh: boolean = false) => {
    setLoading(true);
    const { user, banReason } = await getUser(username, forceRefresh);
    setCurrentUser(user);
    setBanReason(banReason);
    setLoading(false);
  }, []);

  return { currentUser, loading, banReason, reloadUserProfile };
};
