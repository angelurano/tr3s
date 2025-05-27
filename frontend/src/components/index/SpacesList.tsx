import { useUser } from '@clerk/clerk-react';
import { EmptySpaces } from './EmptySpaces';
import { useQuery } from 'convex/react';
import { api } from '@server/_generated/api';
import { Link } from '@tanstack/react-router';
import { getURLImagePicsum } from '@/lib/utils';
import CreateSpace from './CreateSpace';
import { Plus, Eye, EyeOff, PencilLine, Trash2 } from 'lucide-react';
import ImageCard from '../ui/image-card';
import { Badge } from '../ui/badge';
import EditSpace from './EditSpace';
import DeleteSpace from './DeleteSpace';

export function SpacesList() {
  const { isSignedIn } = useUser();

  const userSpaces = useQuery(api.spaces.getCurrentUserSpaces, {});

  if (!isSignedIn) {
    return <EmptySpaces />;
  }

  if (userSpaces === undefined) {
    return null;
  }

  if (userSpaces.length === 0) {
    return <EmptySpaces />;
  }

  const canCreateMore = userSpaces.length < 3;

  return (
    <div className='flex h-full flex-col justify-center space-y-3 px-2 py-6'>
      <h1 className='text-2xl'>Mis Espacios</h1>
      <p className='text-muted-foreground'>
        Gestiona y accede a tus espacios de colaboración{' '}
        <span className='font-semibold'>({userSpaces.length}/3)</span>
      </p>

      <div className='grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {userSpaces.map((space) => (
          <UserSpaceLink key={space._id} space={space} />
        ))}

        {canCreateMore && <UserCreateNewSpace />}
      </div>
    </div>
  );
}

function UserSpaceLink({
  space
}: {
  space: {
    _id: string;
    title: string;
    imagePicsumId: number;
    isActive: boolean;
  };
}) {
  return (
    <div className='group relative cursor-pointer transition-transform duration-200 hover:scale-105'>
      <div className='absolute left-2 top-2 z-10 flex flex-col items-center justify-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
        <DeleteSpace spaceId={space._id} spaceTitle={space.title}>
          <button
            className='bg-foreground shadow-shadow hover:bg-foreground/80 transition-color cursor-pointer rounded-full p-1 duration-200'
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Trash2 className='text-background h-4 w-4' />
          </button>
        </DeleteSpace>
        <EditSpace space={space}>
          <button
            className='bg-secondary-background shadow-shadow hover:bg-secondary-background/80 transition-color cursor-pointer rounded-full p-1 duration-200'
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <PencilLine className='text-foreground h-4 w-4' />
          </button>
        </EditSpace>
      </div>
      <Link to='/spaces/$spaceId' params={{ spaceId: space._id }}>
        <Badge
          variant='neutral'
          className='absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100'
        >
          {space.isActive ? (
            <>
              <Eye className='h-3 w-3' />
              Activo
            </>
          ) : (
            <>
              <EyeOff className='h-3 w-3' />
              Inactivo
            </>
          )}
        </Badge>

        {space.imagePicsumId !== -1 ? (
          <ImageCard
            imageUrl={getURLImagePicsum(space.imagePicsumId, 400, 300)}
            caption={space.title}
            className='h-full'
          />
        ) : (
          <figure className='rounded-base border-border bg-main font-base shadow-shadow h-full w-[250px] overflow-hidden border-2'>
            <div className='aspect-4/3 bg-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:33px_33px] bg-center' />
            <figcaption className='text-main-foreground border-border border-t-2 p-4'>
              {space.title}
            </figcaption>
          </figure>
        )}
      </Link>
    </div>
  );
}

function UserCreateNewSpace() {
  return (
    <CreateSpace>
      <div className='rounded-base border-border bg-main font-base shadow-shadow hover:bg-main/80 group w-[250px] cursor-pointer overflow-hidden border-2 border-dashed transition-all duration-200 hover:border-solid'>
        <div className='aspect-4/3 bg-main-foreground/5 group-hover:bg-main-foreground/10 flex w-full items-center justify-center transition-colors duration-200'>
          <div className='text-main-foreground/60 group-hover:text-main-foreground/80 flex flex-col items-center gap-2 transition-colors duration-200'>
            <Plus className='h-8 w-8' />
            <span className='text-sm font-medium'>Crear Espacio</span>
          </div>
        </div>
        <div className='border-border border-t-2 p-4'>
          <p className='text-main-foreground/60 text-center text-sm'>
            Agrega un nuevo espacio de colaboración
          </p>
        </div>
      </div>
    </CreateSpace>
  );
}
