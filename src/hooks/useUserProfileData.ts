import { useState, useCallback } from 'react';
import { User } from '@/misc/account';
import { getUserProfile } from '@/actions/userProfile';

export const useUserProfileData = (initialUser: User) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(false);
  const [banReason, setBanReason] = useState<string | undefined>(undefined);

  const reloadUserProfile = useCallback(
    async (username: string, forceRefresh: boolean = false, withRoles: boolean = false) => {
      setLoading(true);
      const { user, banReason } = await getUserProfile(username, forceRefresh, withRoles);
      setCurrentUser(user);
      setBanReason(banReason);
      setLoading(false);
    },
    []
  );

  return { currentUser, loading, banReason, reloadUserProfile };
};
