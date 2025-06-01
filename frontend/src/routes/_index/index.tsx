import { createFileRoute } from '@tanstack/react-router';
import { SpacesList } from '@/components/index/SpacesList';

import { Redirected } from '@/components/index/Redirected';

interface IndexRouteParams {
  redirect?: boolean;
  spaceId?: string;
}

export const Route = createFileRoute('/_index/')({
  validateSearch: (search: Record<string, unknown>): IndexRouteParams => {
    const spaceId = search.spaceId ? String(search.spaceId) : undefined;
    return {
      redirect: search.redirect === true ? true : undefined,
      spaceId
    };
  },
  component: IndexComponent
});

function IndexComponent() {
  const { redirect, spaceId } = Route.useSearch();

  return (
    <div className='relative flex h-full w-full items-center justify-center'>
      {redirect && <Redirected spaceId={spaceId} />}
      <SpacesList />
    </div>
  );
}
