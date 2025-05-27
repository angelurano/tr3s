import elements from '@/assets/nospaceindex.svg';
import { Button } from '../ui/button';
import { JoinSpace } from './JoinSpace';
import CreateSpace from './CreateSpace';

export const EmptySpaces = () => {
  return (
    <div className='flex h-full flex-col items-center justify-center py-4'>
      <img
        src={elements}
        alt='No hay espacios'
        width={150}
        height={171}
        className='max-h-full'
      />
      <h2 className='mt-6 text-center text-2xl font-semibold'>
        Bienvenido a tr3s
      </h2>
      <p className='text-foreground/50 mt-2 text-center text-sm'>
        Crea o únete a un espacio para empezar
      </p>
      <div className='mt-4 flex flex-col space-y-2'>
        <CreateSpace>
          <Button variant='reverse' size='default' className='cursor-pointer'>
            Crea tu primer espacio
          </Button>
        </CreateSpace>
        <JoinSpace>
          <Button
            variant='reverse'
            size='default'
            className='bg-secondary-background text-foreground cursor-pointer'
          >
            Únete a un espacio
          </Button>
        </JoinSpace>
      </div>
    </div>
  );
};
