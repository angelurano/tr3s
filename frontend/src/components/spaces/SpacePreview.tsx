import { api } from '@server/_generated/api';
import { useQuery } from 'convex/react';
import { Skeleton } from '../ui/skeleton';
import { getURLImagePicsum } from '../../lib/utils';
import { Link } from '@tanstack/react-router';

interface SpacePreviewProps {
  spaceId: string;
}
export function SpacePreview({ spaceId }: SpacePreviewProps) {
  const spaceAccess = useQuery(api.spaces.getSpaceAccess, { spaceId });

  if (spaceAccess === undefined || spaceAccess?.space === undefined) {
    return (
      <Skeleton className='sm:h-30 sm:w-35 absolute right-3 top-14 h-24 w-24 sm:top-16' />
    );
  }
  return (
    <div className='sm:h-30 sm:w-35 shadow-shadow bg-main text-main-foreground absolute right-3 top-14 flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-md border-2 sm:right-3 sm:top-16 sm:translate-x-0'>
      {spaceAccess.space.imagePicsumId !== -1 ? (
        <a
          href={getURLImagePicsum(spaceAccess.space.imagePicsumId, 1000, 600)}
          target='_blank'
          rel='noopener noreferrer'
          className='aspect-5/3 block w-full'
        >
          <img
            src={getURLImagePicsum(spaceAccess.space.imagePicsumId, 300, 200)}
            alt={`Background from picsum with ID ${spaceAccess.space.imagePicsumId}`}
            className='max-h-full max-w-full object-cover'
          />
        </a>
      ) : (
        <div className='bg-background aspect-5/3 w-full cursor-pointer bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:20px_20px] bg-center' />
      )}

      <Link
        to='/spaces/$spaceId'
        params={{ spaceId: spaceAccess.space._id }}
        className='block w-full max-w-full flex-1 border-t-2 px-2 py-1'
      >
        <p className='line-clamp-2 text-center text-xs'>
          {spaceAccess.space.title}
        </p>
      </Link>
    </div>
  );
}
