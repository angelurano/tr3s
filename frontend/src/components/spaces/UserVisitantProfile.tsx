import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { UserPlus, UserMinus } from 'lucide-react';
import { useMatch } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@server/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@server/_generated/dataModel';

interface User {
  _id: Id<'users'>;
  name: string;
  username: string;
  imageUrl: string;
}

interface UserVisitantProfileProps {
  children?: React.ReactNode;
  user: User;
}

export function UserVisitantProfile({
  children,
  user
}: UserVisitantProfileProps) {
  const match = useMatch({ from: '/spaces/$spaceId', shouldThrow: false });
  const closeButtonRef = useRef<HTMLButtonElement>(null!);

  const handleAddFriend = () => {
    // Lógica para agregar amigo
    /*
    if (onAddFriend) {
      onAddFriend();
    }
    console.log('Agregando amigo:', user.username);
    */
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Avatar className='h-20 w-20 flex-shrink-0 cursor-pointer'>
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback className='bg-main h-full w-full'>
              <div className='h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:12px_12px] bg-center' />
            </AvatarFallback>
          </Avatar>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Perfil de usuario</DialogTitle>
          <DialogDescription>
            Información del usuario en este espacio
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col items-center gap-4 py-4'>
          <Avatar className='h-20 w-20 flex-shrink-0'>
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback className='bg-main h-full w-full'>
              <div className='h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:12px_12px] bg-center' />
            </AvatarFallback>
          </Avatar>

          <div className='space-y-1 text-center'>
            <h3 className='text-lg font-semibold'>{user.name}</h3>
            <p className='text-muted-foreground text-sm'>@{user.username}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className='hidden' ref={closeButtonRef} />
          </DialogClose>

          {match && (
            <ButtonKickUser
              user={user}
              spaceId={match.params.spaceId}
              closeRef={closeButtonRef}
            />
          )}

          {/* TODO: Implementar lógica para agregar amigo si no es amigo */}
          <Button
            variant='default'
            onClick={handleAddFriend}
            className='flex items-center gap-2'
          >
            <UserPlus className='h-4 w-4' />
            Agregar como amigo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ButtonKickUser({
  user,
  spaceId,
  closeRef
}: {
  user: User;
  spaceId: string;
  closeRef: React.RefObject<HTMLButtonElement> | null;
}) {
  const access = useQuery(api.spaces.getSpaceAccess, { spaceId });
  // const kickUser = useMutation(api.spaces.kickUserFromSpace);

  if (!access || access.status !== 'owner') {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='neutral' className='flex items-center gap-2'>
          <UserMinus className='h-4 w-4' />
          Expulsar usuario
        </Button>
      </DialogTrigger>
      <KickUserDialog user={user} spaceId={spaceId} closeRef={closeRef} />
    </Dialog>
  );
}

function KickUserDialog({
  user,
  spaceId,
  closeRef
}: {
  user: User;
  spaceId: string;
  closeRef: React.RefObject<HTMLButtonElement> | null;
}) {
  const kickUser = useMutation(api.spacesUsers.kickUserFromSpace);

  const handleKick = async () => {
    try {
      await kickUser({ spaceId, userId: user._id });
      toast.success(`Usuario expulsado del espacio`);
    } catch (error) {
      toast.error(`Ha ocurrido un error al expulsar al usuario`);
    } finally {
      if (closeRef?.current) {
        closeRef.current.click();
      }
    }
  };

  return (
    <DialogContent className='sm:max-w-md'>
      <DialogHeader>
        <DialogTitle>Expulsar usuario</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que quieres expulsar a {user.name} del espacio? Esta
          acción no se puede deshacer.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className='flex flex-col gap-2 sm:flex-row'>
        <DialogClose asChild>
          <Button
            variant='neutral'
            onClick={handleKick}
            className='flex items-center gap-2'
          >
            <UserMinus className='h-4 w-4' />
            Expulsar usuario
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant='default'>Cancelar</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
