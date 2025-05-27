import { Authenticated, Unauthenticated } from 'convex/react';
import { SignIn } from '@clerk/clerk-react';
import { Dialog, DialogClose, DialogOverlay } from '../ui/dialog';
import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { JoiningSpace } from './JoiningSpace';

export function Redirected({ spaceId }: { spaceId: string | undefined }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Unauthenticated>
        <Dialog
          open={open}
          onOpenChange={() => {
            setOpen((prev) => !prev);
          }}
        >
          <DialogOverlay />
          <DialogPrimitive.Content
            data-slot='dialog-content'
            className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border-0 duration-200'
          >
            <SignIn
              fallbackRedirectUrl={`/?redirect=true${spaceId ? `&spaceId=${spaceId}` : ''}`}
              forceRedirectUrl={`/?redirect=true${spaceId ? `&spaceId=${spaceId}` : ''}`}
              signUpForceRedirectUrl={`/?redirect=true${spaceId ? `&spaceId=${spaceId}` : ''}`}
            />
            <DialogClose className='absolute right-2 top-2 cursor-pointer rounded-full p-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'>
              <X className='size-4' />
            </DialogClose>
          </DialogPrimitive.Content>
        </Dialog>
      </Unauthenticated>
      <Authenticated>
        {spaceId && <JoiningSpace spaceId={spaceId} />}
      </Authenticated>
    </>
  );
}
