import { useConvexAuth, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { Id } from '@server/_generated/dataModel';
import { api } from '@server/_generated/api';

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();

  const [userId, setUserId] = useState<Id<'users'> | null>(null);
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function storeUserData() {
      const id = await storeUser();
      setUserId(id);
    }
    storeUserData();

    return () => {
      setUserId(null);
    };
  }, [isAuthenticated, user?.id, storeUser]);

  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null
  };
}
