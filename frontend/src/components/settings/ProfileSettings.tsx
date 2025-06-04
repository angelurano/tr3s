import { Dialog, DialogClose, DialogOverlay } from '../ui/dialog';
import { Authenticated, Unauthenticated } from 'convex/react';
import { UserRoundCog, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { SignUpButton, UserProfile } from '@clerk/clerk-react';
import { SidebarMenuSubButton } from '../ui/sidebar';

export function ProfileSettings() {
  return (
    <>
      <Unauthenticated>
        <SignUpButton mode='modal'>
          <SidebarMenuSubButton asChild>
            <button className='w-full cursor-pointer'>
              <UserRoundCog className='size-5 flex-shrink-0' />
              <span>Configuración de la cuenta</span>
            </button>
          </SidebarMenuSubButton>
        </SignUpButton>
      </Unauthenticated>

      <Authenticated>
        <Dialog>
          <DialogPrimitive.DialogTrigger asChild>
            <SidebarMenuSubButton className='w-full cursor-pointer'>
              <UserRoundCog className='size-5 flex-shrink-0' />
              <span>Configuración de la cuenta</span>
            </SidebarMenuSubButton>
          </DialogPrimitive.DialogTrigger>
          <DialogOverlay />
          <DialogPrimitive.Content
            data-slot='dialog-content'
            className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-100 fixed left-[50%] top-[50%] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border-0 duration-200'
          >
            <DialogPrimitive.Title className='hidden'>
              Configuración de la cuenta
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className='hidden'>
              Cambia la configuración de tu cuenta
            </DialogPrimitive.Description>
            <UserProfile />
            <DialogClose className='absolute right-2 top-2 cursor-pointer rounded-full p-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'>
              <X className='size-4' />
            </DialogClose>
          </DialogPrimitive.Content>
        </Dialog>
      </Authenticated>
    </>
  );
}
