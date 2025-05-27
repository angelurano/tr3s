import { UserRoundPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { UserButton } from '@clerk/clerk-react';
import { InviteDialog } from './InviteSpace';

// Foto of the user, and button to invite new users to the space, bg.white only for reference
export function UserSection({ spaceId }: { spaceId: string }) {
  return (
    <div className='absolute right-2 top-2 flex h-auto items-center gap-2 bg-white'>
      <InviteDialog spaceId={spaceId}>
        <Button variant='neutral' className='h-8 cursor-pointer rounded-full'>
          <UserRoundPlus />
          Invitar
        </Button>
      </InviteDialog>
      <Button variant='default' className='cursor-pointer rounded-full p-1'>
        <UserButton showName={false} />
      </Button>
    </div>
  );
}
