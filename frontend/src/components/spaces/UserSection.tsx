import { UserRoundPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { UserButton } from '@clerk/clerk-react';
import { InviteDialog } from './InviteDialog';

export function UserSection({ spaceId }: { spaceId: string }) {
  return (
    <div className='absolute right-3 top-2 flex h-auto items-center gap-2'>
      <InviteDialog spaceId={spaceId}>
        <Button
          variant='neutral'
          className='h-10 w-10 cursor-pointer rounded-full sm:h-8 sm:w-auto'
        >
          <UserRoundPlus />
          <span className='hidden sm:inline'>Invitar</span>
        </Button>
      </InviteDialog>
      <Button variant='default' className='cursor-pointer rounded-full p-1'>
        <UserButton showName={false} />
      </Button>
    </div>
  );
}
