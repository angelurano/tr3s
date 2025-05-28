// import { useQuery, Unauthenticated, Authenticated } from 'convex/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
import {
  Authenticated,
  Unauthenticated,
  usePaginatedQuery
} from 'convex/react';
import { api } from '@server/_generated/api';
import type { Notification } from '@server/schema';
import { SignIn, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useState } from 'react';

export function Notifications() {
  return (
    <DropdownMenu>
      <Unauthenticated>
        <UnauthenticatedNotifications />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedNotification />
      </Authenticated>
    </DropdownMenu>
  );
}

function UnauthenticatedNotifications() {
  return (
    <>
      <DropdownMenuTrigger asChild>
        <Button
          variant='noShadow'
          className={
            'after:border-main-foreground relative flex size-7 cursor-default p-0 after:absolute after:bottom-[78%] after:left-[78%] after:size-2 after:rounded-full after:border-2 after:bg-red-500 after:content-[""]'
          }
        >
          <Bell className='size-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <SignInButton mode='modal'>
            <DropdownMenuItem className='cursor-pointer'>
              Inicia sesión o regístrate
            </DropdownMenuItem>
          </SignInButton>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}

function AuthenticatedNotification() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.notification.getUserNotifications,
    {},
    { initialNumItems: 7 }
  );

  const notificationsUnRead = results?.filter(
    (notification) => !notification.read
  );
  return (
    <>
      <DropdownMenuTrigger asChild>
        <Button
          variant='noShadow'
          className={`relative flex size-7 cursor-default p-0 ${
            notificationsUnRead !== undefined && notificationsUnRead.length > 0
              ? 'after:border-main-foreground after:absolute after:bottom-[78%] after:left-[78%] after:size-2 after:rounded-full after:border-2 after:bg-red-500 after:content-[""]'
              : ''
          }`}
        >
          <Bell className='size-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <NotificationsList
            notifications={results}
            // status={status}
            // loadMore={loadMore}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}

function NotificationsList({
  notifications
}: {
  notifications: Notification[];
}) {
  if (notifications === undefined) {
    return (
      <DropdownMenuItem className='cursor-progress'>
        Cargando...
      </DropdownMenuItem>
    );
  }
  if (notifications.length === 0) {
    return (
      <DropdownMenuItem className='cursor-pointer'>
        No hay notificaciones
      </DropdownMenuItem>
    );
  }
  // TODO: Manage types in each notification, read: clears when user click notify, friend request,
  // TODO: change key
  return (
    <>
      {notifications.map((notification, index) => (
        <DropdownMenuItem key={index} className='cursor-pointer text-xs text-pretty'>
          <span>{notification.content}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
}
