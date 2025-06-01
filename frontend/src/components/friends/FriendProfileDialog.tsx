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
import { UserPlus, UserMinus, Clock, UserX } from 'lucide-react';
import { useMatch } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@server/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@server/_generated/dataModel';
import { Skeleton } from '../ui/skeleton';

interface User {
  _id: string;
  name: string;
  username: string;
  imageUrl: string;
}

interface FriendProfileDialogProps {
  children?: React.ReactNode;
  user: User;
}

export function FriendProfileDialog({
  children,
  user
}: FriendProfileDialogProps) {
  const match = useMatch({ from: '/spaces/$spaceId', shouldThrow: false });
  const closeButtonRef = useRef<HTMLButtonElement>(null!);

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

          <ButtonFriend user={user} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ButtonFriend({ user }: { user: User }) {
  const userRelationship = useQuery(api.friends.getFriendshipByUserId, {
    userId: user._id as Id<'users'>
  });

  if (userRelationship === undefined) {
    return <Skeleton className='bg-muted h-10 w-40 rounded-md' />;
  }

  if (userRelationship === null) {
    return <ButtonAddFriend user={user} />;
  }

  if (
    userRelationship.status === 'pending' &&
    userRelationship.toId === user._id
  ) {
    return <ButtonPendingFriend />;
  }

  if (userRelationship.status === 'pending') {
    return (
      <ButtonAcceptFriend user={user} friendshipId={userRelationship._id} />
    );
  }

  if (userRelationship.status === 'accepted') {
    return (
      <ButtonRemoveFriend user={user} friendshipId={userRelationship._id} />
    );
  }

  return null;
}

function ButtonAddFriend({ user }: { user: User }) {
  const addFriend = useMutation(api.friends.sendFriendRequest);

  const handleAddFriend = async () => {
    try {
      await addFriend({ toId: user._id as Id<'users'> });
      toast.success(`Solicitud de amistad enviada a ${user.name}`);
    } catch (error) {
      toast.error(`Error al enviar solicitud de amistad`);
    }
  };

  return (
    <Button variant='default' onClick={handleAddFriend}>
      <UserPlus className='h-4 w-4' />
      Agregar amigo
    </Button>
  );
}

function ButtonPendingFriend() {
  return (
    <Button variant='neutral' disabled>
      <Clock className='h-4 w-4' />
      Solicitud pendiente
    </Button>
  );
}

function ButtonAcceptFriend({
  user,
  friendshipId
}: {
  user: User;
  friendshipId: Id<'friendships'>;
}) {
  const acceptFriend = useMutation(api.friends.acceptFriendRequest);

  const handleAcceptFriend = async () => {
    try {
      await acceptFriend({ friendshipId });
      toast.success(`Solicitud de amistad aceptada de ${user.name}`);
    } catch (error) {
      toast.error(`Error al aceptar solicitud de amistad`);
    }
  };

  return (
    <Button variant='default' onClick={handleAcceptFriend}>
      <UserPlus className='h-4 w-4' />
      Aceptar solicitud
    </Button>
  );
}

function ButtonRemoveFriend({
  user,
  friendshipId
}: {
  user: User;
  friendshipId: Id<'friendships'>;
}) {
  const removeFriend = useMutation(api.friends.removeFriend);

  const handleRemoveFriend = async () => {
    try {
      await removeFriend({ friendshipId });
      toast.success(`Amistad eliminada con ${user.username}`);
    } catch (error) {
      toast.error(`Error al eliminar amistad`);
    }
  };

  return (
    <Button variant='default' onClick={handleRemoveFriend}>
      <UserX className='h-4 w-4' />
      Eliminar amistad
    </Button>
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
      await kickUser({ spaceId, userId: user._id as Id<'users'> });
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
