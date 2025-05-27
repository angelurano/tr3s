import { AppSidebar } from '@/components/AppSidebar';
import { Canvas } from '@/components/spaces/Canvas';
import { SidebarProvider } from '@/components/ui/sidebar';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { Loading } from '../components/auth/Loading';
import { api } from '@server/_generated/api';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/spaces/$spaceId')({
  component: CheckSpaceAuth
});

function CheckSpaceAuth() {
  const { spaceId } = Route.useParams();
  const getSpaceAccess = useQuery(api.spaces.getSpaceAccess, { spaceId });

  if (getSpaceAccess === undefined) return <Loading />;

  if (!getSpaceAccess.canAccess) {
    return (
      <Navigate
        to='/'
        search={{
          redirect: true,
          spaceId
        }}
      />
    );
  }

  if (getSpaceAccess.status === 'owner') {
    return <EnableSpace spaceId={spaceId} />;
  }
  return <SpacesComponent spaceId={spaceId} />;
}

function EnableSpace({ spaceId }: { spaceId: string }) {
  const enableUserSpace = useMutation(api.spaces.enableUserSpace);
  const [spaceStatus, setSpaceStatus] = useState<'loading' | 'enabled' | 'error'>('loading');

  useEffect(() => {
    async function enableSpace () {
      if (spaceStatus === 'enabled') return;

      try {
        await enableUserSpace({ spaceId });
        setSpaceStatus('enabled');
      } catch (error) {
        console.error('Error enabling space:', error);
        setSpaceStatus('error');
      }
    }

    enableSpace();
  }, []);

  if (spaceStatus === 'loading') {
    return <Loading />;
  }
  if (spaceStatus === 'error') {
    return (
      <Navigate
        to='/'
        search={{
          redirect: true,
          spaceId
        }}
      />
    );
  }
  return <SpacesComponent spaceId={spaceId} />;
}

function SpacesComponent({ spaceId }: { spaceId: string }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className='min-h-vh flex w-full'>
        <AppSidebar />

        <Canvas spaceId={spaceId} />
      </div>
    </SidebarProvider>
  );
}
