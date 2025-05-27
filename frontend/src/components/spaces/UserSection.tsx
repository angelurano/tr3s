import { UserRoundPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { UserButton } from '@clerk/clerk-react';

// Foto of the user, and button to invite new users to the space, bg.white only for reference
export function UserSection() {
  return (
    <div className='absolute right-2 top-2 flex h-auto items-center gap-3 bg-white'>
      <Button variant='neutral' className='cursor-pointer rounded-full'>
        <UserRoundPlus />
        Invitar
      </Button>
      <Button variant='default' className='cursor-pointer rounded-full p-1'>
        <UserButton showName={false} />
      </Button>
    </div>
  );
}
