import { createRootRoute, Outlet } from '@tanstack/react-router';

import { Loading } from '@/components/auth/Loading';
import { useStoreUserEffect } from '@/hooks/useStoreUserEffect';

export const Route = createRootRoute({
  component: () => <Root />
});

function Root() {
  const { isLoading } = useStoreUserEffect();

  return <>{isLoading ? <Loading /> : <Outlet />}</>;
}
