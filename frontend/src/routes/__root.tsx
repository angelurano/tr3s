import { createRootRoute, Outlet } from '@tanstack/react-router';

import { Loading } from '@/components/auth/Loading';
import { useStoreUserEffect } from '@/hooks/useStoreUserEffect';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: () => <Root />
});

function Root() {
  const { isLoading } = useStoreUserEffect();

  return (
    <>
      {isLoading ? <Loading /> : <Outlet />}
      <Toaster />
    </>
  );
}
